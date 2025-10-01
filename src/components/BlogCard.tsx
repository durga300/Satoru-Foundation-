import React from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';
import type { BlogPost } from '../lib/api';

interface BlogCardProps {
  post: BlogPost;
  onClick: (slug: string) => void;
}

export function BlogCard({ post, onClick }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const readingTime = Math.max(1, Math.ceil(post.content.length / 1000));

  return (
    <article 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-300 cursor-pointer group overflow-hidden hover-lift hover-glow transform hover:scale-[1.02]"
      onClick={() => onClick(post.slug)}
    >
      {post.featured_image && (
        <div className="aspect-video overflow-hidden relative">
          <img 
            src={post.featured_image} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      
      <div className="p-8">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-300">
            <Calendar className="w-4 h-4 group-hover:animate-pulse" />
            <time dateTime={post.published_at || post.created_at}>
              {formatDate(post.published_at || post.created_at)}
            </time>
          </div>
          <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-300">
            <Clock className="w-4 h-4 group-hover:animate-pulse" />
            <span>{readingTime} min read</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-base">
            {post.excerpt}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <Tag className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
            {post.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100 group-hover:border-blue-300 group-hover:shadow-sm transition-all duration-300"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-gray-500 text-xs font-medium">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}