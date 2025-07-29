import { Groq } from "groq-sdk";
import { AppError } from '../types/common';
import { ParsedAnalysis, Entity } from "../types/database";
import logger from "../utils/logger";
import config from "../config/environment";

// Import the actual enum types from the generated Prisma client
type DocumentType = "letter" | "report" | "photo" | "newspaper" | "list" | "diary_entry" | "book" | "map" | "biography";
type EntityType = "person" | "location" | "organization" | "event" | "date" | "unit";

export class AIService {
  private groq: Groq;
  private readonly systemPrompt: string;

  constructor() {
    this.groq = new Groq({
      apiKey: config.GROQ_API_KEY,
    });

    this.systemPrompt = `You are a specialized document analyzer for historical documents, particularly from World War II era.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON object
2. Do NOT include any markdown formatting (no \`\`\`json or \`\`\`)
3. Do NOT include any text before or after the JSON
4. The JSON must be perfectly formatted and parseable

REQUIRED JSON STRUCTURE:
{
  "title": "string - descriptive title for the document",
  "content": "string - detailed summary of document content (5-6 sentences)",
  "document_type": "must be exactly one of: letter|report|photo|newspaper|list|diary_entry|book|map|biography",
  "entities": [
    {
      "name": "string - entity name (e.g., Winston Churchill, London, RAF)",
      "type": "must be exactly one of: person|location|organization|event|date|unit"
    }
  ]
}

EXAMPLES OF CORRECT OUTPUT:

For a military letter:
{
  "title": "Military Correspondence from Colonel Smith to High Command",
  "content": "This letter details troop movements in the European theater during 1944. Colonel Smith reports on the status of the 82nd Airborne Division and their preparations for upcoming operations. The correspondence includes strategic information about enemy positions and supply line concerns. Weather conditions and their impact on planned missions are discussed. The letter concludes with requests for additional ammunition and medical supplies.",
  "document_type": "letter",
  "entities": [
    {"name": "Colonel Smith", "type": "person"},
    {"name": "82nd Airborne Division", "type": "unit"},
    {"name": "European theater", "type": "location"},
    {"name": "1944", "type": "date"}
  ]
}

For a photograph:
{
  "title": "Allied Forces Liberation of Paris",
  "content": "Black and white photograph showing Allied troops marching through the streets of Paris during the liberation in August 1944. Crowds of French civilians can be seen celebrating alongside American and British soldiers. The Arc de Triomphe is visible in the background. Military vehicles including tanks and jeeps are present in the scene. The image captures the historic moment of Paris being freed from German occupation.",
  "document_type": "photo",
  "entities": [
    {"name": "Paris", "type": "location"},
    {"name": "Arc de Triomphe", "type": "location"},
    {"name": "Allied Forces", "type": "organization"},
    {"name": "Liberation of Paris", "type": "event"},
    {"name": "1944-08", "type": "date"}
  ]
}

ENTITY EXTRACTION RULES:
- Extract ALL relevant historical figures, places, military units, organizations, events, and dates
- For dates: Use YYYY-MM-DD format when possible, or YYYY-MM, or YYYY if less specific
- For military units: Include division numbers, regiment names, etc.
- For locations: Include cities, countries, regions, battlefields, etc.
- For organizations: Include military branches, government agencies, etc.
- For events: Include battles, operations, meetings, etc.

DOCUMENT TYPE SELECTION:
- letter: Personal or official correspondence
- report: Military or intelligence reports, situation reports
- photo: Photographs, images, pictures
- newspaper: Newspaper articles, clippings, press releases
- list: Lists of names, supplies, casualties, etc.
- diary_entry: Personal diary entries, journal entries
- book: Book pages, manual excerpts, published materials
- map: Maps, diagrams, tactical drawings
- biography: Biographical information, personnel records

You must be extremely accurate with the document_type and entity types. Choose the most specific and appropriate type for each entity.`;
  }

  /**
   * Analyze image using Groq API with improved parameters for accuracy
   */
  async analyzeImage(imageDataUrl: string, retries = 3): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.info(`Sending request to Groq API (attempt ${attempt}/${retries})`);

        const chatCompletion = await this.groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: this.systemPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this historical document image and provide the structured JSON response. Remember: respond with ONLY the JSON object, no additional formatting or text.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageDataUrl,
                  },
                },
              ],
            },
          ],
          model: "meta-llama/llama-4-scout-17b-16e-instruct", // Use standard model name
          temperature: 0.0, // Set to 0 for maximum consistency
          max_tokens: 2048, // Increased for more detailed analysis
          top_p: 0.1, // Lower for more focused responses
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        
        if (!content) {
          throw new Error('No content received from Groq API');
        }

        logger.info('Successfully received response from Groq API');
        logger.debug('Groq response:'+ JSON.stringify(content, null, 2));

        return content;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        logger.warn(`Groq API request failed (attempt ${attempt}/${retries}):`, lastError.message);

        if (attempt < retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          logger.info(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    logger.error('All Groq API attempts failed:', lastError);
    throw new AppError(`Failed to analyze image with AI after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Parse AI analysis response into structured data with improved validation
   */
  parseAnalysis(analysisText: string): ParsedAnalysis {
    try {
      logger.info('Parsing AI analysis response');

      // Clean the response - remove any potential markdown formatting
      let cleanedText = analysisText.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      // Find JSON object (more robust extraction)
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON object found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields with stricter validation
      this.validateAnalysisResponse(parsed);

      // Process entities with better validation
      const processedEntities: Entity[] = parsed.entities.map((entity: any) => {
        const processedEntity: Entity = {
          name: entity.name.trim(),
          type: entity.type as EntityType,
        };

        // Handle date entities with better parsing
        if (entity.type === 'date') {
          try {
            // Handle various date formats
            let dateStr = entity.name.trim();
            
            // If it's already in ISO format or similar, use it
            if (/^\d{4}(-\d{2})?(-\d{2})?$/.test(dateStr)) {
              processedEntity.date = dateStr;
            } else {
              // Try to parse as date
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                processedEntity.date = date.toISOString().split('T')[0];
              } else {
                // Keep original if we can't parse it
                processedEntity.date = dateStr;
              }
            }
          } catch (error) {
            logger.warn(`Invalid date format for entity: ${entity.name}`);
            processedEntity.date = entity.name.trim();
          }
        }

        return processedEntity;
      });

      const result: ParsedAnalysis = {
        documentType: parsed.document_type,
        title: parsed.title.trim(),
        content: parsed.content.trim(),
        entities: processedEntities,
      };
      
      logger.info('Successfully parsed AI analysis response');
      return result;

    } catch (error) {
      logger.error('Failed to parse AI analysis:', error);
      throw new AppError(`Failed to parse AI analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate AI analysis response structure with stricter checks
   */
  private validateAnalysisResponse(data: any): void {
    const errors: string[] = [];

    // Check required fields
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('title must be a non-empty string');
    }

    if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
      errors.push('content must be a non-empty string');
    }

    // Validate document_type against our specific enum values
    const validDocumentTypes: DocumentType[] = [
      "letter", "report", "photo", "newspaper", "list", "diary_entry", "book", "map", "biography"
    ];
    
    if (!data.document_type || typeof data.document_type !== 'string') {
      errors.push('document_type must be a non-empty string');
    } else if (!validDocumentTypes.includes(data.document_type as DocumentType)) {
      errors.push(`document_type must be one of: ${validDocumentTypes.join(', ')}`);
    }

    // Validate entities array
    if (!Array.isArray(data.entities)) {
      errors.push('entities must be an array');
    } else {
      const validEntityTypes: EntityType[] = ["person", "location", "organization", "event", "date", "unit"];
      
      data.entities.forEach((entity: any, index: number) => {
        if (!entity.name || typeof entity.name !== 'string' || entity.name.trim().length === 0) {
          errors.push(`entities[${index}].name must be a non-empty string`);
        }

        if (!entity.type || typeof entity.type !== 'string') {
          errors.push(`entities[${index}].type must be a non-empty string`);
        } else if (!validEntityTypes.includes(entity.type as EntityType)) {
          errors.push(`entities[${index}].type must be one of: ${validEntityTypes.join(', ')}`);
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`Invalid AI response structure: ${errors.join('; ')}`);
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const models = await this.groq.models.list();
      return models.data.map(model => model.id);
    } catch (error) {
      logger.error('Failed to fetch available models:', error);
      throw new AppError('Failed to fetch available models');
    }
  }

  /**
   * Test AI service connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getAvailableModels();
      return true;
    } catch (error) {
      logger.error('AI service connection test failed:', error);
      return false;
    }
  }

  /**
   * Get token usage statistics
   */
  getTokenUsage(): { totalRequests: number; totalTokens: number } {
    // This would need to be implemented with proper tracking
    // For now, return mock data
    return {
      totalRequests: 0,
      totalTokens: 0
    };
  }
}

export const aiService = new AIService();
