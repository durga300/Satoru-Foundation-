import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Tag, Share2, BookOpen } from 'lucide-react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BlogAPI } from '../lib/api';
import type { BlogPost } from '../lib/api';

interface PostPageProps {
  slug: string;
  onBackClick: () => void;
}

export function PostPage({ slug, onBackClick }: PostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setIsTransitioning(true);
        const postData = await BlogAPI.getPostBySlug(slug);
        if (postData) {
          setPost(postData);
          // Update document title
          document.title = `${postData.title} | Modern Blog Platform`;
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    };

    fetchPost();

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = 'Modern Blog Platform';
    };
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const readingTime = post ? Math.max(1, Math.ceil(post.content.length / 1000)) : 0;

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
      }
    } else if (post) {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading post...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The post you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={onBackClick}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50 animate-fadeInDown">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onBackClick}
              className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-blue-50 hover-lift"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-medium">Back to Posts</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-blue-50 hover-lift"
            >
              <Share2 className="w-6 h-6" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-12 animate-fadeInUp">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow duration-500"
            />
          </div>
        )}

        {/* Article Header */}
        <article className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fadeInUp animate-delay-200">
          <div className="px-8 py-12 sm:px-12">
            <header className="mb-12 animate-slideInLeft">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed font-light">
                  {post.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-base text-gray-500 mb-8">
                <div className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-300">
                  <Calendar className="w-5 h-5" />
                  <time dateTime={post.published_at || post.created_at}>
                    {formatDate(post.published_at || post.created_at)}
                  </time>
                </div>
                <div className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-300">
                  <Clock className="w-5 h-5" />
                  <span>{readingTime} min read</span>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap animate-slideInRight">
                  <Tag className="w-5 h-5 text-gray-400" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-300 hover-lift"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Article Content */}
            <div className="prose prose-xl max-w-none animate-fadeInUp animate-delay-300">
              <MarkdownRenderer content={post.content} />
            </div>
          </div>
        </article>

        {/* Back to Posts Button */}
        <div className="mt-12 text-center animate-fadeInUp animate-delay-400">
          <button
            onClick={onBackClick}
            className="bg-gradient-primary text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold text-lg hover-lift animate-glow"
          >
            Back to All Posts
          </button>
        </div>
      </main>
    </div>
  );
}