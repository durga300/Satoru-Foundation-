import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex items-center justify-center space-x-3 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium hover-lift rounded-xl hover:bg-blue-50"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Previous
      </button>

      <div className="flex space-x-2">
        {visiblePages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium hover-lift ${
              page === currentPage
                ? 'bg-gradient-primary text-white shadow-lg animate-glow'
                : page === '...'
                ? 'text-gray-400 cursor-default'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium hover-lift rounded-xl hover:bg-blue-50"
      >
        Next
        <ChevronRight className="w-5 h-5 ml-2" />
      </button>
    </nav>
  );
}