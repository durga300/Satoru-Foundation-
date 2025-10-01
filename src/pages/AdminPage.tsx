import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Save, X, Calendar, Tag, Image, Upload, Trash } from 'lucide-react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BlogAPI } from '../lib/api';
import type { BlogPost } from '../lib/api';

interface AdminPageProps {
  onBackClick: () => void;
}

interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  featured_image: string;
  published: boolean;
}

interface PostImage {
  _id: string;
  image_url: string;
  alt_text: string;
  caption: string;
  position: number;
}

export function AdminPage({ onBackClick }: AdminPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    excerpt: '',
    content: '',
    tags: [],
    featured_image: '',
    published: false,
  });

  const [newTag, setNewTag] = useState('');
  const [postImages, setPostImages] = useState<PostImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setIsTransitioning(true);
      const allPosts = await BlogAPI.getAllPosts();
      setPosts(allPosts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleCreatePost = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      tags: [],
      featured_image: '',
      published: false,
    });
    setEditingPost(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditPost = async (post: BlogPost) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      tags: post.tags || [],
      featured_image: post.featured_image || '',
      published: post.published,
    });
    setEditingPost(post);
    setIsEditing(true);
    setShowForm(true);
    
    // Load post images
    try {
      const images = await BlogAPI.getPostImages(post.id);
      setPostImages(images);
    } catch (error) {
      console.error('Error loading post images:', error);
      setPostImages([]);
    }
  };

  const handleSavePost = async () => {
    try {
      setSaving(true);
      
      if (isEditing && editingPost) {
        // Update existing post
        const updatedPost = await BlogAPI.updatePost(editingPost.id, {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          tags: formData.tags,
          featured_image: formData.featured_image,
          published: formData.published,
        });
        
        setPosts(posts.map(p => p.id === editingPost.id ? updatedPost : p));
      } else {
        // Create new post
        const newPost = await BlogAPI.createPost({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          tags: formData.tags,
          featured_image: formData.featured_image,
          published: formData.published,
        });
        
        setPosts([newPost, ...posts]);
      }
      
      setShowForm(false);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        tags: [],
        featured_image: '',
        published: false,
      });
      setEditingPost(null);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await BlogAPI.deletePost(postId);
        setPosts(posts.filter(p => p.id !== postId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete post');
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      if (isEditing && editingPost) {
        // Add image to existing post
        const result = await BlogAPI.addImageToPost(
          editingPost.id,
          file,
          '',
          '',
          postImages.length
        );
        setPostImages([...postImages, result]);
      } else {
        // Upload featured image
        const result = await BlogAPI.uploadImage(file);
        setFormData({
          ...formData,
          featured_image: result.imageUrl,
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    try {
      // Note: You might want to add a delete image API endpoint
      setPostImages(postImages.filter(img => img._id !== imageId));
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading admin panel...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackClick}
                className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-blue-50 hover-lift"
              >
                <ArrowLeft className="w-6 h-6" />
                <span>Back to Blog</span>
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <button
              onClick={handleCreatePost}
              className="flex items-center space-x-2 bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-xl hover-lift transition-all duration-300 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>New Post</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Posts List */}
        {!showForm && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="animate-float">
                  <Edit className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">Create your first blog post to get started.</p>
                <button
                  onClick={handleCreatePost}
                  className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-xl hover-lift transition-all duration-300 font-medium"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              post.published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              <span>{post.tags.length} tags</span>
                            </div>
                          )}
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => window.open(`#/post/${post.slug}`, '_blank')}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="View post"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Edit post"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete post"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Form */}
        {showForm && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter post title..."
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={3}
                  placeholder="Enter post excerpt..."
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="url"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://example.com/image.jpg or upload a file"
                    />
                    <Image className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  {/* Image Upload Button */}
                  <div className="flex items-center space-x-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {uploadingImage ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                  </div>
                  
                  {/* Featured Image Preview */}
                  {formData.featured_image && (
                    <div className="relative">
                      <img
                        src={formData.featured_image}
                        alt="Featured image preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, featured_image: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Add a tag..."
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Post Images (only when editing) */}
              {isEditing && editingPost && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Images
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {uploadingImage ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{uploadingImage ? 'Uploading...' : 'Add Image to Post'}</span>
                      </button>
                    </div>
                    
                    {/* Post Images Grid */}
                    {postImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {postImages.map((image) => (
                          <div key={image._id} className="relative group">
                            <img
                              src={image.image_url}
                              alt={image.alt_text || 'Post image'}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image._id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                              Position: {image.position}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <MarkdownEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write your post content in Markdown..."
                />
              </div>

              {/* Published Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                  Publish this post
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePost}
                  disabled={!formData.title.trim() || !formData.content.trim() || saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-xl hover-lift transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{saving ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
