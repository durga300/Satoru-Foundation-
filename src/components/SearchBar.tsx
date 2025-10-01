import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onTagFilter: (tags: string[]) => void;
  availableTags: string[];
  placeholder?: string;
}

export function SearchBar({ onSearch, onTagFilter, availableTags, placeholder = "Search blog posts..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const debounced = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounced);
  }, [query, onSearch]);

  useEffect(() => {
    onTagFilter(selectedTags);
  }, [selectedTags, onTagFilter]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedTags([]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors duration-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 text-lg placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              showFilters || selectedTags.length > 0
                ? 'bg-blue-100 text-blue-600 shadow-md animate-pulse' 
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          {(query || selectedTags.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 hover-lift"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl animate-fadeInUp">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" />
            Filter by Tags
          </h3>
          <div className="flex flex-wrap gap-3">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover-lift ${
                  selectedTags.includes(tag)
                    ? 'bg-gradient-primary text-white shadow-lg animate-glow'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-300"
                >
                  Clear tags
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}