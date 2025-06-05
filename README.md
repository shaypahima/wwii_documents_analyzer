# Historical Document Archive System

A comprehensive full-stack application for digitizing, analyzing, and managing historical documents (specifically WWII documents) using AI-powered analysis and Google Drive integration.

**In collaboration with the Museum of the Jewish Warrior in WWII** - This project serves as a digital preservation platform to help museums, historians, and researchers digitize, organize, and make accessible their historical document collections.

## 🌟 Overview

This system combines modern web technologies with AI-powered document analysis to help preserve and organize historical documents. Developed in partnership with the Museum of the Jewish Warrior in WWII, it features automatic entity extraction, intelligent categorization, and seamless cloud storage integration to make historical research more accessible and efficient to both institutions and the public.

## 🏗️ Architecture

The project consists of two main components:

- **Client** (`/client`) - React 19 + TypeScript frontend application
- **Server** (`/server`) - Node.js + Express.js API backend

```
┌─────────────────┐    HTTP/REST API    ┌──────────────────┐
│                 │◄──────────────────►│                  │
│  React Client   │                    │  Node.js Server  │
│  (TypeScript)   │                    │  (TypeScript)    │
│                 │                    │                  │
└─────────────────┘                    └──────────────────┘
                                                 │
                                                 ▼
                          ┌─────────────────────────────────┐
                          │        External Services        │
                          │  • Google Drive API (Storage)   │
                          │  • Groq AI API (Analysis)       │
                          │  • PostgreSQL (Database)        │
                          └─────────────────────────────────┘
```

## ✨ Key Features

### 🗂️ Document Management
- **Google Drive Integration** - Browse, search, and manage documents stored in Google Drive
- **AI-Powered Analysis** - Automatic entity extraction and document classification using Groq AI
- **Smart Organization** - Categorize documents by type (reports, letters, photos, maps, etc.)
- **Advanced Search** - Full-text search across document content and extracted entities
- **Metadata Extraction** - Automatic extraction of dates, people, locations, organizations, and events

### 🧠 AI-Powered Features
- **Entity Recognition** - Extract and classify:
  - People (military personnel, civilians)
  - Locations (cities, battlefields, countries)
  - Organizations (military units, agencies)
  - Events (battles, operations)
  - Dates and time periods
  - Military units and divisions
- **Document Classification** - Automatic categorization into document types
- **Content Analysis** - Extract and summarize document content
- **Relationship Mapping** - Track connections between entities across documents

### 📊 Analytics & Insights
- **Statistics Dashboard** - Overview of document collection metrics
- **Entity Analytics** - Track frequency and relationships of extracted entities
- **Search Analytics** - Find patterns in document content and metadata
- **Collection Insights** - Understand the scope and coverage of your archive

### 🔧 Technical Features
- **RESTful API** - Clean, well-documented API endpoints
- **Real-time Processing** - Live document analysis and preview
- **Responsive Design** - Works on desktop and mobile devices
- **Type Safety** - Fully typed TypeScript codebase
- **Error Handling** - Comprehensive error handling and logging
- **Scalable Architecture** - Designed for growth and extensibility

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Google Drive API credentials
- Groq AI API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd graduation-project
```

### 2. Server Setup
```bash
cd server
npm install

# Create .env file with required configuration
cp .env.example .env
# Edit .env with your credentials

# Set up database
npx prisma generate
npx prisma db push

# Start server
npm run dev
```

### 3. Client Setup
```bash
cd ../client
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start client
npm run dev
```

### 4. Access the Application
- **Client**: http://localhost:5173
- **Server API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## 📖 Documentation

### Component Documentation
- **[Server Documentation](./server/README.md)** - Complete API documentation, endpoints, and backend setup
- **[Client Documentation](./client/README.md)** - Frontend architecture, components, and usage guide

### API Endpoints
The server provides RESTful endpoints for:
- `/api/documents` - Document CRUD operations and analysis
- `/api/entities` - Entity management and relationships
- `/api/storage` - Google Drive integration and file operations
- `/health` - System health and status checks

### Key Technologies

#### Frontend Stack
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type safety and enhanced development experience
- **React Router 7** - File-based routing and server-side rendering
- **Tailwind CSS** - Utility-first styling framework
- **Axios** - HTTP client for API communication
- **Lucide React** - Modern icon library

#### Backend Stack
- **Node.js & Express.js** - Server runtime and web framework
- **TypeScript** - Type-safe server development
- **PostgreSQL** - Robust relational database
- **Prisma ORM** - Type-safe database operations
- **Google Drive API** - Cloud storage integration
- **Groq AI API** - Advanced document analysis
- **Winston** - Comprehensive logging system

## 🔑 Configuration

### Required Environment Variables

#### Server (`/server/.env`)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/wwii_scanner"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----"
GROQ_API_KEY=your_groq_api_key
MAX_FILE_SIZE=50mb
```

#### Client (`/client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Testing

### Server Testing
```bash
cd server
npm test
```

### Client Testing
```bash
cd client
npm test
```

### API Health Check
```bash
curl http://localhost:5000/health
```

## 🚀 Deployment

### Production Build
```bash
# Build server
cd server
npm run build

# Build client
cd ../client
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set up SSL certificates
- Configure reverse proxy (nginx recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Maintain API documentation
- Use semantic commit messages
- Ensure responsive design principles

## 📊 Project Status

- ✅ **Core Features** - Document upload, analysis, and management
- ✅ **AI Integration** - Entity extraction and classification
- ✅ **Storage Integration** - Google Drive connectivity
- ✅ **Search & Filter** - Advanced document discovery
- ✅ **Responsive UI** - Mobile and desktop support
- 🔄 **In Development** - Advanced analytics and reporting
- 📋 **Planned** - User authentication and multi-tenancy

## 📄 License

This project is licensed under the ISC License. See the LICENSE file for details.

## 🆘 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/server/README.md` and `/client/README.md`

## 🏛️ Museum Partnership

This project is developed in collaboration with the **Museum of the Jewish Warrior in WWII**, serving as a practical digital preservation solution for their historical document collection. The partnership ensures that the system meets real-world needs of museums and cultural institutions while contributing to the preservation of Jewish military history during World War II.

### Collaboration Benefits:
- **Real-world Testing** - Direct feedback from museum professionals and historians
- **Historical Accuracy** - Expert validation of entity extraction and categorization
- **Cultural Preservation** - Supporting the mission to preserve and share Jewish military heritage
- **Educational Impact** - Making historical documents more accessible to researchers and the public

## 🙏 Acknowledgments

- **Museum of the Jewish Warrior in WWII** - For their invaluable partnership, historical expertise, and commitment to preserving Jewish military history
- **Groq AI** - For providing advanced document analysis capabilities
- **Google Drive API** - For seamless cloud storage integration
- **React & Node.js Communities** - For excellent tools and documentation
- **Historical Preservation Organizations** - For inspiring this project

---

**Built with ❤️ in collaboration with the Museum of the Jewish Warrior in WWII for preserving and making historical documents accessible to researchers, historians, and the public worldwide.** 