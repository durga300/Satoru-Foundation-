import React, { useState, useEffect } from 'react';
import { BlogAPI } from './lib/api';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { AdminPage } from './pages/AdminPage';

type View = 'home' | 'post' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentSlug, setCurrentSlug] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await BlogAPI.initializeDatabase();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialized(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

  // Simple client-side routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the '#'
      
      if (hash === '' || hash === '/') {
        setCurrentView('home');
      } else if (hash === '/admin') {
        setCurrentView('admin');
      } else if (hash.startsWith('/post/')) {
        const slug = hash.replace('/post/', '');
        setCurrentSlug(slug);
        setCurrentView('post');
      } else {
        setCurrentView('home');
      }
    };

    // Handle initial route
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateToPost = (slug: string) => {
    window.location.hash = `/post/${slug}`;
  };

  const navigateToHome = () => {
    window.location.hash = '/';
  };

  const navigateToAdmin = () => {
    window.location.hash = '/admin';
  };

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fadeInUp">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Initializing Blog Platform
          </h2>
          <p className="text-gray-600">Setting up your amazing blog experience...</p>
        </div>
      </div>
    );
  }

  switch (currentView) {
    case 'post':
      return (
        <PostPage 
          slug={currentSlug} 
          onBackClick={navigateToHome}
        />
      );
    case 'admin':
      return (
        <AdminPage 
          onBackClick={navigateToHome}
        />
      );
    default:
      return (
        <HomePage 
          onPostClick={navigateToPost}
          onAdminClick={navigateToAdmin}
        />
      );
  }
}

export default App;