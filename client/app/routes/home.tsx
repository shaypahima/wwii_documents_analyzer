import type { Route } from "./+types/home";
import { Link } from 'react-router';
import { HardDrive, FileText, Brain, BarChart3 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useDocumentStats } from '../hooks/useDocuments';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { stats, loading } = useDocumentStats();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Historical Document Archive
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze and organize historical documents with AI-powered insights. 
            Browse your Google Drive files, extract entities, and build a searchable archive.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/drive"
            className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HardDrive className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Browse Drive</h3>
                <p className="text-sm text-gray-500">
                  Access files from Google Drive and select documents for analysis
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/documents"
            className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600 group-hover:text-green-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">View Documents</h3>
                <p className="text-sm text-gray-500">
                  Browse and search your analyzed documents and entities
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
                <p className="text-sm text-gray-500">
                  Overview of your document archive
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Archive Overview</h2>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading statistics...</span>
            </div>
          </div>
        ) : stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Archive Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalDocuments || 0}
                </div>
                <div className="text-sm text-gray-500">Total Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.recentDocuments ? stats.recentDocuments.reduce((total, doc) => total + doc.entities.length, 0) : 0}
                </div>
                <div className="text-sm text-gray-500">Entities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.documentsByType ? Object.keys(stats.documentsByType).length : 0}
                </div>
                <div className="text-sm text-gray-500">Document Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.recentDocuments ? stats.recentDocuments.length : 0}
                </div>
                <div className="text-sm text-gray-500">Recent</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Documents */}
        {stats && stats.recentDocuments && stats.recentDocuments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Documents</h2>
              <Link
                to="/documents"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentDocuments.slice(0, 6).map((document) => (
                <Link
                  key={document.id}
                  to={`/documents/${document.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {document.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize ml-2 flex-shrink-0">
                        {document.documentType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {document.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{document.fileName}</span>
                      <span>{document.entities.length} entities</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <Brain className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">AI Analysis</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Automatically extract entities, classify documents, and generate summaries
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <HardDrive className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Google Drive Integration</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Seamlessly browse and process files directly from your Google Drive
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
