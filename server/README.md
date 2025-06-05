# WWII Document Scanner API

A powerful Node.js API server for scanning, analyzing, and managing WWII historical documents using AI-powered document analysis with Google Drive integration.

## 🚀 Features

- **Document Processing**: Upload, analyze, and manage WWII historical documents
- **AI-Powered Analysis**: Extract entities, relationships, and metadata using Groq API
- **Google Drive Integration**: Seamless integration with Google Drive for document storage
- **Entity Management**: Track people, locations, organizations, events, dates, and military units
- **Advanced Search**: Full-text search across documents and entities
- **Statistics & Analytics**: Get insights into your document collection
- **RESTful API**: Clean, well-documented REST endpoints
- **TypeScript**: Fully typed for better developer experience
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Helmet, CORS, and comprehensive error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **AI Service**: Groq API
- **Storage**: Google Drive API
- **Document Processing**: PDF2Pic, Mammoth, PDF.js, Canvas
- **Logging**: Winston
- **Security**: Helmet, CORS

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Google Drive API credentials
- Groq API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3000
   
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/wwii_scanner"
   
   # Google Drive API
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id
   GOOGLE_CLIENT_EMAIL=your_service_account_email
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----"
   
   # Groq AI API
   GROQ_API_KEY=your_groq_api_key
   
   # File Upload
   MAX_FILE_SIZE=50mb
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Build and Start**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## 📖 API Documentation

### Base URL
```
http://localhost:3000
```

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": {}, 
  "message": "Optional message",
  "pagination": {}, // For paginated endpoints
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📄 Document Endpoints

### Create Document
```http
POST /api/documents
```

**Request Body:**
```json
{
  "title": "Document Title",
  "fileName": "document.pdf",
  "content": "Document content text",
  "documentType": "REPORT", // REPORT, LETTER, PHOTO, MAP, ORDER, TELEGRAM, DIARY, OTHER
  "date": "1944-06-06",
  "location": "Normandy",
  "author": "General Smith",
  "description": "D-Day operation report"
}
```

### Get All Documents
```http
GET /api/documents
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `documentType` (string): Filter by document type
- `keyword` (string): Search in title and content
- `entity` (string): Filter by entity name
- `startDate` (string): Filter documents from date (YYYY-MM-DD)
- `endDate` (string): Filter documents to date (YYYY-MM-DD)

**Example:**
```http
GET /api/documents?page=1&limit=20&documentType=REPORT&keyword=normandy
```

### Get Document by ID
```http
GET /api/documents/:id
```

### Update Document
```http
PUT /api/documents/:id
```

**Request Body:** (Same as create, all fields optional)

### Delete Document
```http
DELETE /api/documents/:id
```

### Search Documents
```http
GET /api/documents/search
```

**Query Parameters:**
- `q` (string, required): Search query (minimum 2 characters)
- `page` (number): Page number
- `limit` (number): Items per page

### Get Document Statistics
```http
GET /api/documents/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 150,
    "documentsByType": {
      "REPORT": 45,
      "LETTER": 30,
      "PHOTO": 25
    },
    "documentsThisMonth": 12,
    "recentDocuments": []
  }
}
```

### Get Documents by Entity
```http
GET /api/documents/entity/:entityId
```

### Analyze Document (Without Saving)
```http
POST /api/documents/analyze/:fileId
```

**Request Body:**
```json
{
  "forceRefresh": false,
  "includeImage": true
}
```

### Process and Save Document
```http
POST /api/documents/process/:fileId
```

**Request Body:**
```json
{
  "forceRefresh": false
}
```

---

## 👥 Entity Endpoints

Entities represent people, locations, organizations, events, dates, and military units found in documents.

### Create Entity
```http
POST /api/entities
```

**Request Body:**
```json
{
  "name": "General Dwight D. Eisenhower",
  "type": "PERSON", // PERSON, LOCATION, ORGANIZATION, EVENT, DATE, UNIT
  "date": "1944-06-06"
}
```

### Get All Entities
```http
GET /api/entities
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): Filter by entity type
- `keyword` (string): Search in entity names
- `date` (string): Filter by date

### Get Entity by ID
```http
GET /api/entities/:id
```

**Query Parameters:**
- `includeDocuments` (boolean): Include related documents in response

### Update Entity
```http
PUT /api/entities/:id
```

### Delete Entity
```http
DELETE /api/entities/:id
```

### Search Entities
```http
GET /api/entities/search
```

**Query Parameters:**
- `q` (string, required): Search query
- `page` (number): Page number
- `limit` (number): Items per page

### Get Entity Statistics
```http
GET /api/entities/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEntities": 250,
    "entitiesByType": {
      "PERSON": 80,
      "LOCATION": 60,
      "ORGANIZATION": 45,
      "EVENT": 35,
      "UNIT": 20,
      "DATE": 10
    }
  }
}
```

### Find or Create Entity
```http
POST /api/entities/find-or-create
```

**Request Body:**
```json
{
  "name": "Operation Overlord",
  "type": "EVENT",
  "date": "1944-06-06"
}
```

### Get Entities by Type
```http
GET /api/entities/type/:type
```

**Valid types:** `PERSON`, `LOCATION`, `ORGANIZATION`, `EVENT`, `DATE`, `UNIT`

---

## 💾 Storage Endpoints

Google Drive integration for file management.

### Get Directory Content
```http
GET /api/storage/files
```

**Query Parameters:**
- `folderId` (string): Optional Google Drive folder ID

### Get File Metadata
```http
GET /api/storage/files/:fileId
```

### Get File Content
```http
GET /api/storage/files/:fileId/content
```

**Response:** Raw file content with appropriate headers

### Search Files
```http
GET /api/storage/search
```

**Query Parameters:**
- `q` (string, required): Search query (minimum 2 characters)
- `folderId` (string): Optional folder ID to search within

### Get Storage Information
```http
GET /api/storage/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "limit": "15GB",
    "usage": "2.5GB", 
    "usageInDrive": "1.8GB"
  }
}
```

### Test Storage Connection
```http
GET /api/storage/health
```

---

## 🔍 System Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600.5,
  "environment": "development",
  "version": "1.0.0"
}
```

### API Information
```http
GET /api
```

**Response:**
```json
{
  "name": "WWII Document Scanner API",
  "version": "1.0.0",
  "description": "API for scanning and analyzing WWII historical documents",
  "endpoints": {
    "documents": "/api/documents",
    "entities": "/api/entities", 
    "storage": "/api/storage",
    "health": "/health"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📊 Document Types

The system supports the following document types:

- `REPORT` - Military reports and briefings
- `LETTER` - Personal and official correspondence
- `PHOTO` - Photographs and images
- `MAP` - Maps and geographical documents
- `ORDER` - Military orders and commands
- `TELEGRAM` - Telegraph communications
- `DIARY` - Personal diaries and journals
- `OTHER` - Other document types

## 👥 Entity Types

The system recognizes these entity types:

- `PERSON` - Individuals (military personnel, civilians, etc.)
- `LOCATION` - Places, cities, countries, battlefields
- `ORGANIZATION` - Military units, government agencies, etc.
- `EVENT` - Historical events, battles, operations
- `DATE` - Specific dates and time periods
- `UNIT` - Military units and divisions

## 🔧 Error Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## 🚦 Rate Limiting

Currently, no rate limiting is implemented, but it's recommended for production use.

## 🔒 Security

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configured
- **Input Validation**: Request validation for all endpoints
- **Error Handling**: Comprehensive error handling with logging

## 📝 Logging

The application uses Winston for logging with different levels:
- `error` - Error messages
- `warn` - Warning messages  
- `info` - Informational messages
- `debug` - Debug messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Made with ❤️ for preserving WWII history** 