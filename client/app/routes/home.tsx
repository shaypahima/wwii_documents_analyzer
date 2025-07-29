import type { Route } from "./+types/home";
import { Link } from 'react-router';
import { HardDrive, FileText, Brain, BarChart3, Lock, ArrowRight, Sparkles, Clock, TrendingUp, Users, MapPin, Calendar } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useDocumentStats } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "The Chaim Herzog Museum of the Jewish Soldier in World War II" },
    { name: "description", content: "The Chaim Herzog Museum tells the important and neglected chapter of Jewish heroism in WWII, honoring 1,500,000 Jewish soldiers who served in Allied forces and perpetuating the memory of 250,000 who gave their lives." },
  ];
}

export default function Home() {
  const { data: stats, isLoading: loading, error } = useDocumentStats();
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl" />
          <div className="relative px-8 py-16 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Preserving History with Technology
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    The Chaim Herzog Museum
                  </h1>
                  <p className="text-xl sm:text-2xl font-medium text-gray-600">
                    Jewish Soldier in World War II
                  </p>
                </div>
                
                <p className="text-lg text-gray-700 leading-relaxed max-w-xl">
                  Discover the untold stories of courage and sacrifice. Our AI-powered digital archive preserves the legacy of 1.5 million Jewish soldiers who fought against tyranny.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {isAuthenticated ? (
                    <Link
                      to="/drive"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all group"
                    >
                      Start Exploring
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <Link
                      to="/register"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all group"
                    >
                      Get Started
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  <Link
                    to="/documents"
                    className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                  >
                    Browse Archive
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10">
                  <img 
                    src="/icon2.jpg" 
                    alt="The Chaim Herzog Museum" 
                    className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                  />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-20 blur-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {!loading && !error && stats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Archive Overview</h2>
              <p className="text-gray-600">Digital preservation of historical documents and artifacts</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.totalDocuments?.toLocaleString() || 0}
                </div>
                <div className="text-sm font-medium text-blue-700 mb-1">Total Documents</div>
                <div className="text-xs text-gray-500">Digitally preserved</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.recentDocuments ? stats.recentDocuments.reduce((total, doc) => total + doc.entities.length, 0).toLocaleString() : 0}
                </div>
                <div className="text-sm font-medium text-green-700 mb-1">Entities Extracted</div>
                <div className="text-xs text-gray-500">People, places, events</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.documentsByType ? Object.keys(stats.documentsByType).length : 0}
                </div>
                <div className="text-sm font-medium text-purple-700 mb-1">Document Types</div>
                <div className="text-xs text-gray-500">Letters, reports, photos</div>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.recentDocuments ? stats.recentDocuments.length : 0}
                </div>
                <div className="text-sm font-medium text-orange-700 mb-1">Recent Additions</div>
                <div className="text-xs text-gray-500">This month</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore the Archive</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access our comprehensive digital collection through multiple pathways
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Drive Access */}
            {isAuthenticated ? (
              <Link
                to="/drive"
                className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
              >
                <div className="absolute top-6 right-6">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <HardDrive className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Browse Drive</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Access files from Google Drive and select documents for AI-powered analysis
                    </p>
                  </div>
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                    Start browsing
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="group relative bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="absolute top-6 right-6">
                  <Lock className="h-6 w-6 text-amber-500" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-500">Browse Drive</h3>
                    <p className="text-gray-500 leading-relaxed">
                      <Link to="/login" className="text-blue-600 hover:text-blue-800 underline font-medium">
                        Sign in
                      </Link>{' '}
                      to access Google Drive files and upload documents for analysis
                    </p>
                  </div>
                  <div className="flex items-center text-gray-400 font-medium">
                    Authentication required
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            <Link
              to="/documents"
              className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-200 transition-all duration-300"
            >
              <div className="absolute top-6 right-6">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Documents Archive</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Browse and search analyzed documents with AI-extracted insights and entities
                  </p>
                </div>
                <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                  Explore documents
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Entities */}
            <Link
              to="/entities"
              className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
            >
              <div className="absolute top-6 right-6">
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Historical Entities</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Discover people, places, and events extracted from historical documents
                  </p>
                </div>
                <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                  Browse entities
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Documents */}
        {stats && stats.recentDocuments && stats.recentDocuments.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Recently Added</h2>
                <p className="text-gray-600">Latest documents in our growing archive</p>
              </div>
              <Link
                to="/documents"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View all documents
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.recentDocuments.slice(0, 6).map((document) => (
                <Link
                  key={document.id}
                  to={`/documents/${document.id}`}
                  className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {document.title}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize shrink-0 ml-3">
                        {document.documentType.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {document.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="truncate mr-2">{document.fileName}</span>
                      <div className="flex items-center space-x-4 shrink-0">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {document.entities.length}
                        </span>
                        <Clock className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold">Powered by Advanced Technology</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Our platform combines cutting-edge AI with historical expertise to unlock the stories within documents
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">AI-Powered Analysis</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Advanced natural language processing automatically extracts entities, classifies documents, and generates comprehensive summaries
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <HardDrive className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Seamless Integration</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Connect directly with Google Drive to access, analyze, and preserve your historical documents with ease
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full" />
            </div>
            
            <div className="bg-blue-50 rounded-2xl p-8 space-y-6">
              <p className="text-lg text-gray-800 leading-relaxed">
                The Association for the Establishment of the Museum of the Jewish Soldier in World War II built this museum to tell the important and neglected chapter in Jewish history - the story of heroism alongside the Holocaust.
              </p>
              <p className="text-base text-gray-700 leading-relaxed">
                Named after the late Chaim Herzog, the sixth president of Israel, who served as an intelligence officer in the British Army during WWII. Located in Latrun, on the main road between Tel-Aviv and Jerusalem, we honor 1,500,000 Jewish men and women who served in Allied forces, Partisans, and resistance movements, while perpetuating the memory of 250,000 Jewish soldiers who gave their lives during the war.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">Join Our Mission</h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Help us preserve history for future generations. Create your account to access exclusive documents and contribute to this important historical archive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all"
                >
                  Get Started Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
                <Link
                  to="/documents"
                  className="inline-flex items-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all"
                >
                  Explore Archive
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
