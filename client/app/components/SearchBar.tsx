import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Sparkles, Clock, TrendingUp } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'suggestion';
  category?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  filters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  suggestions?: SearchSuggestion[];
  size?: 'sm' | 'md' | 'lg';
}

export function SearchBar({
  onSearch,
  placeholder = "Search documents, entities, or files...",
  className = "",
  showFilters = false,
  filters = {},
  onFilterChange,
  suggestions = [],
  size = 'md'
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample suggestions if none provided
  const defaultSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'Jewish soldiers', type: 'popular', category: 'People' },
    { id: '2', text: 'World War II letters', type: 'popular', category: 'Documents' },
    { id: '3', text: 'Resistance movements', type: 'popular', category: 'Events' },
    { id: '4', text: 'Brigade reports', type: 'recent', category: 'Documents' },
    { id: '5', text: 'Liberation photos', type: 'recent', category: 'Documents' },
    { id: '6', text: 'Chaim Herzog', type: 'suggestion', category: 'People' },
  ];

  const activeSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  // Size variants
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowFilterPanel(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0 || activeSuggestions.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSearch(suggestion.text);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'popular':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'recent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Main Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center bg-white border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm hover:shadow-md ${sizeClasses[size]}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`${iconSizes[size]} text-gray-400`} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            className="block w-full pl-10 pr-20 py-0 border-0 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-0 text-gray-900"
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            
            {showFilters && (
              <button
                type="button"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`p-1.5 rounded-lg transition-colors ${showFilterPanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <Filter className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {query.length === 0 && activeSuggestions.length > 0 && (
            <div className="p-4">
              <div className="space-y-4">
                {/* Popular Searches */}
                {activeSuggestions.filter(s => s.type === 'popular').length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Popular Searches
                    </h4>
                    <div className="space-y-1">
                      {activeSuggestions.filter(s => s.type === 'popular').map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          {getSuggestionIcon(suggestion.type)}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {suggestion.text}
                            </div>
                            {suggestion.category && (
                              <div className="text-xs text-gray-500">{suggestion.category}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {activeSuggestions.filter(s => s.type === 'recent').length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Recent Searches
                    </h4>
                    <div className="space-y-1">
                      {activeSuggestions.filter(s => s.type === 'recent').map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          {getSuggestionIcon(suggestion.type)}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {suggestion.text}
                            </div>
                            {suggestion.category && (
                              <div className="text-xs text-gray-500">{suggestion.category}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {activeSuggestions.filter(s => s.type === 'suggestion').length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Suggestions
                    </h4>
                    <div className="space-y-1">
                      {activeSuggestions.filter(s => s.type === 'suggestion').map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          {getSuggestionIcon(suggestion.type)}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {suggestion.text}
                            </div>
                            {suggestion.category && (
                              <div className="text-xs text-gray-500">{suggestion.category}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {query.length > 0 && (
            <div className="p-4">
              <button
                onClick={() => handleSuggestionClick({ id: 'current', text: query, type: 'suggestion' })}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <Search className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    Search for "<span className="font-semibold">{query}</span>"
                  </div>
                  <div className="text-xs text-gray-500">Press Enter or click to search</div>
                </div>
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t border-gray-100 p-3 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Use quotation marks for exact phrases</span>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-white border rounded text-xs">Enter</kbd>
                <span>to search</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && showFilters && (
        <div className="absolute z-40 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Filter Results</h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Content Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={filters.contentType || ''}
                  onChange={(e) => onFilterChange?.({ ...filters, contentType: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="documents">Documents</option>
                  <option value="entities">Entities</option>
                  <option value="files">Files</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange || ''}
                  onChange={(e) => onFilterChange?.({ ...filters, dateRange: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Date</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy || ''}
                  onChange={(e) => onFilterChange?.({ ...filters, sortBy: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 