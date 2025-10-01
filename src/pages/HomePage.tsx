import React, { useState, useEffect } from 'react';
import { BlogCard } from '../components/BlogCard';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BlogAPI, type BlogPostsResponse } from '../lib/api';
import { BookOpen, Rss, User } from 'lucide-react';

interface HomePageProps {
  onPostClick: (slug: string) => void;
  onAdminClick: () => void;
}

export function HomePage({ onPostClick, onAdminClick }: HomePageProps) {
  const [postsData, setPostsData] = useState<BlogPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get all unique tags for the filter
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const allPosts = await BlogAPI.getAllPosts();
        const tags = new Set<string>();
        allPosts.forEach(post => {
          if (post.published && post.tags) {
            post.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags).sort());
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };

    fetchAllTags();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setIsTransitioning(true);
        const data = await BlogAPI.getPosts({
          page: currentPage,
          pageSize: 9,
          search: searchQuery || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        });
        setPostsData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
        setPostsData(null);
      } finally {
        setLoading(false);
        // Add a small delay for smooth transition
        setTimeout(() => setIsTransitioning(false), 300);
      }
    };

    fetchPosts();
  }, [currentPage, searchQuery, selectedTags]);

  // Reset page when search or tags change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTags]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagFilter = (tags: string[]) => {
    setSelectedTags(tags);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50 animate-fadeInDown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3 animate-slideInLeft">
              <div className="bg-gradient-primary p-3 rounded-xl shadow-lg hover-glow animate-float">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Modern Blog Platform
                </h1>
                <p className="text-sm text-gray-600 animate-pulse">Discover amazing stories and insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 animate-slideInRight">
              <button className="text-gray-600 hover:text-blue-600 transition-all duration-300 p-2 rounded-lg hover:bg-blue-50 hover-lift">
                <Rss className="w-6 h-6" />
              </button>
              <button 
                onClick={onAdminClick}
                className="flex items-center space-x-2 bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-xl hover-lift transition-all duration-300 font-medium"
              >
                <User className="w-5 h-5" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-12 animate-fadeInUp">
          <SearchBar 
            onSearch={handleSearch}
            onTagFilter={handleTagFilter}
            availableTags={allTags}
          />
        </div>

        {/* Results Info */}
        {postsData && !loading && (
          <div className="mb-8 flex items-center justify-between animate-fadeInUp animate-delay-200">
            <p className="text-gray-700 font-medium">
              {postsData.total > 0 ? (
                <>
                  Showing {((postsData.page - 1) * postsData.pageSize) + 1} - {Math.min(postsData.page * postsData.pageSize, postsData.total)} of {postsData.total} posts
                  {searchQuery && <span className="ml-1">for "{searchQuery}"</span>}
                  {selectedTags.length > 0 && (
                    <span className="ml-1">
                      tagged with {selectedTags.map(tag => `"${tag}"`).join(', ')}
                    </span>
                  )}
                </>
              ) : (
                <>
                  No posts found
                  {(searchQuery || selectedTags.length > 0) && (
                    <span className="ml-1">
                      {searchQuery && `for "${searchQuery}"`}
                      {searchQuery && selectedTags.length > 0 && ' '}
                      {selectedTags.length > 0 && `with tags ${selectedTags.join(', ')}`}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20 animate-fadeInUp">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <span className="mt-4 block text-gray-600 font-medium">Loading amazing posts...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 animate-scaleIn">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Posts</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Posts Grid */}
        {postsData && !loading && !isTransitioning && (
          <>
            {postsData.posts && postsData.posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {postsData.posts.map((post, index) => (
                  <div
                    key={post.id || post._id || index}
                    className="animate-fadeInUp transform transition-all duration-500 hover:scale-105"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      opacity: isTransitioning ? 0.5 : 1
                    }}
                  >
                    <BlogCard 
                      post={post} 
                      onClick={onPostClick}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 animate-fadeInUp">
                <div className="animate-float">
                  <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Try adjusting your search terms or clearing the filters to see more results.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                    setCurrentPage(1);
                  }}
                  className="mt-4 px-6 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium hover-lift"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {postsData && postsData.totalPages > 1 && (
              <div className="animate-fadeInUp animate-delay-300">
                <Pagination
                  currentPage={postsData.page || 1}
                  totalPages={postsData.totalPages || 1}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Transition Overlay */}
        {isTransitioning && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <span className="mt-4 block text-gray-600 font-medium">Loading posts...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}