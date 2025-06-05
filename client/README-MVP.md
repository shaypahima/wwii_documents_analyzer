# Historical Document Archive - Client MVP

A minimal viable product client for the historical document archive system built with React Router 7, TypeScript, and Tailwind CSS.

## Features

### 🗂️ Google Drive Integration
- Browse files and folders from Google Drive
- Search files within directories
- Download original files
- Navigate through folder hierarchy with breadcrumbs

### 🧠 AI-Powered Document Analysis
- Analyze documents using AI to extract:
  - Document type classification
  - Content summary
  - Named entities (people, places, organizations, dates, events, units)
- Preview analysis results before saving
- Save processed documents to the database

### 📚 Document Management
- View all processed documents in a searchable archive
- Filter documents by type and sort options
- Full-text search across document content and entities
- Detailed document view with:
  - Full content display
  - Extracted entities grouped by type
  - File metadata and statistics
  - Download original files

### 🏷️ Entity Management
- Automatic entity extraction and classification
- Visual entity display with color coding
- Entity grouping and statistics

## Architecture

### API Layer (`/app/api/`)
- **storage.ts** - Google Drive operations (browse, search, download)
- **documents.ts** - Document CRUD and AI analysis operations

### Custom Hooks (`/app/hooks/`)
- **useStorage.ts** - Storage operations with state management
- **useDocuments.ts** - Document operations with state management

### Components (`/app/components/`)
- **Layout.tsx** - Main application layout with navigation
- **FileList.tsx** - Display Google Drive files with actions
- **SearchBar.tsx** - Reusable search component

### Pages (`/app/routes/`)
- **home.tsx** - Dashboard with statistics and navigation
- **drive.tsx** - Browse Google Drive files
- **analyze.tsx** - AI document analysis interface
- **documents.tsx** - Document archive browser
- **document-detail.tsx** - Individual document viewer

### Types (`/app/lib/types.ts`)
- Complete TypeScript definitions for all API responses
- Entity and document type definitions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the client directory:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Test API connectivity:**
   Open browser console and run:
   ```javascript
   import { testApiConnectivity } from './app/utils/api-test';
   testApiConnectivity();
   ```

## API Endpoints

The client expects the following API endpoints to be available:

### Storage Service
- `GET /storage/files` - List files in directory
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "1YZ-sL05d1Mu6qqX-yAp9Ps059kCwDIYO",
        "name": "MINIDV",
        "mimeType": "application/vnd.google-apps.folder",
        "size": 0,
        "type": "folder",
        "modifiedTime": "2025-02-06T12:52:55.074Z",
        "createdTime": "2025-02-06T12:52:55.074Z",
        "isFolder": true
      }
    ],
    "timestamp": "2025-02-06T12:52:55.074Z"
  }
  ```
- `GET /storage/files/:id` - Get file metadata
- `GET /storage/files/:id/content` - Download file
- `GET /storage/search` - Search files
- `GET /storage/info` - Storage information
- `GET /storage/health` - Connection test

### Document Service
- `GET /documents` - List documents with filtering
- `GET /documents/:id` - Get single document
- `GET /documents/search` - Search documents
- `GET /documents/stats` - Document statistics
  ```json
  {
    "success": true,
    "data": {
      "totalDocuments": 7,
      "documentsByType": {},
      "recentDocuments": [
        {
          "id": "b256616b-9862-4fbe-860d-459a2101ce7e",
          "title": "World War II History Book",
          "fileName": "ww2_history.pdf",
          "content": "This is a sample document of type book.",
          "documentType": "book",
          "entities": [...]
        }
      ]
    }
  }
  ```
- `POST /documents/analyze/:fileId` - Analyze document (preview)
- `POST /documents/process/:fileId` - Process and save document
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

## Functional Programming Approach

The client is built using functional programming principles:

- **No classes or OOP** - All logic is implemented using functions and hooks
- **Immutable state** - React hooks manage state immutably
- **Pure functions** - Utility functions have no side effects
- **Composition** - Components are composed from smaller, reusable parts
- **Separation of concerns** - API, hooks, and components have distinct responsibilities

## Technology Stack

- **React 19** - Latest React with concurrent features
- **React Router 7** - File-based routing and SSR support
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API calls
- **Lucide React** - Modern icon library
- **Vite** - Fast build tool and dev server

## Project Structure

```
client/
├── app/
│   ├── api/           # API layer functions
│   ├── components/    # Reusable UI components  
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and types
│   ├── routes/        # Page components
│   └── root.tsx       # Root layout
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Development Guidelines

1. **State Management** - Use React hooks, no external state library needed
2. **Error Handling** - All API calls include proper error handling
3. **Loading States** - UI shows loading indicators for better UX
4. **Responsive Design** - Mobile-first responsive layouts
5. **Accessibility** - Semantic HTML and keyboard navigation
6. **Performance** - Lazy loading and optimized rendering

## Next Steps

To extend the MVP:

1. Add user authentication
2. Implement real-time updates
3. Add batch document processing
4. Include entity relationship mapping
5. Add advanced search filters
6. Implement document annotations
7. Add export/import functionality 