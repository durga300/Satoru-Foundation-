// Client-side API layer that communicates with backend via HTTP requests
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  tags?: string[];
  published?: boolean;
  published_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BlogPostQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  tags?: string[];
}

export class BlogAPI {
  private static baseUrl = '/api';

  static async getPosts({ 
    page = 1, 
    pageSize = 10, 
    search, 
    tags 
  }: BlogPostQuery = {}): Promise<BlogPostsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (search) params.append('search', search);
      if (tags && tags.length > 0) {
        tags.forEach(tag => params.append('tags', tag));
      }

      const response = await fetch(`${this.baseUrl}/posts?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to mock data if backend is not available
      return this.getMockPosts({ page, pageSize, search, tags });
    }
  }

  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/slug/${slug}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      // Fallback to mock data if backend is not available
      return this.getMockPostBySlug(slug);
    }
  }

  static async getAllPosts(): Promise<BlogPost[]> {
    try {
      const response = await fetch(`${this.baseUrl}/posts?pageSize=1000`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.posts;
    } catch (error) {
      console.error('Error fetching all posts:', error);
      // Fallback to mock data if backend is not available
      return this.getMockAllPosts();
    }
  }

  static async createPost(postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }

  static async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    }
  }

  static async deletePost(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Image upload functionality
  static async uploadImage(file: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  static async addImageToPost(postId: string, file: File, altText?: string, caption?: string, position?: number): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (altText) formData.append('alt_text', altText);
      if (caption) formData.append('caption', caption);
      if (position !== undefined) formData.append('position', position.toString());

      const response = await fetch(`${this.baseUrl}/posts/${postId}/images`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding image to post:', error);
      throw new Error('Failed to add image to post');
    }
  }

  static async getPostImages(postId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/images`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching post images:', error);
      return [];
    }
  }

  // Client-side initialization - no-op since database operations should be server-side
  static async initializeDatabase(): Promise<void> {
    return Promise.resolve();
  }

  // Mock data methods for development when backend is not available
  private static getMockPosts({ page = 1, pageSize = 10, search, tags }: BlogPostQuery): BlogPostsResponse {
    const mockPosts: BlogPost[] = [
      {
        id: '1',
        title: "Getting Started with Modern Web Development",
        slug: "getting-started-modern-web-development",
        content: `# Welcome to Modern Web Development

Web development has evolved tremendously over the past few years. In this comprehensive guide, we'll explore the latest trends, tools, and best practices that every developer should know.

## The Current Landscape

The web development ecosystem is more vibrant than ever. With frameworks like React, Vue, and Angular leading the frontend space, and Node.js, Python, and Go powering backends, developers have unprecedented choice and flexibility.

### Key Technologies to Master

- **Frontend Frameworks**: React, Vue.js, Angular
- **Backend Technologies**: Node.js, Python, Go, Rust
- **Databases**: MongoDB, PostgreSQL, Redis
- **Cloud Platforms**: AWS, Google Cloud, Azure

## Best Practices

1. **Performance First**: Always optimize for speed and user experience
2. **Mobile Responsive**: Design for mobile-first approach
3. **Accessibility**: Ensure your applications are accessible to all users
4. **Security**: Implement proper authentication and data protection

The future of web development is bright, and there's never been a better time to start your journey!`,
        excerpt: "Explore the latest trends and best practices in modern web development, from frontend frameworks to backend technologies.",
        featured_image: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        tags: ["web development", "programming", "technology", "tutorial"],
        published: true,
        published_at: new Date('2024-01-15'),
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-15')
      },
      {
        id: '2',
        title: "The Art of Database Design",
        slug: "art-of-database-design",
        content: `# Mastering Database Design

Database design is both an art and a science. A well-designed database can make the difference between a fast, scalable application and one that struggles under load.

## Fundamental Principles

### 1. Normalization
Normalization helps eliminate data redundancy and ensures data integrity. Understanding the different normal forms is crucial for any database designer.

### 2. Indexing Strategy
Proper indexing can dramatically improve query performance. However, over-indexing can slow down write operations.

### 3. Relationships
Understanding how to model relationships between entities is fundamental to good database design.

## MongoDB vs SQL Databases

### MongoDB Advantages:
- Flexible schema design
- Horizontal scaling capabilities
- JSON-like document storage
- Great for rapid prototyping

### SQL Database Advantages:
- ACID compliance
- Mature ecosystem
- Complex query capabilities
- Strong consistency guarantees

## Performance Optimization Tips

1. **Query Optimization**: Write efficient queries and use explain plans
2. **Connection Pooling**: Manage database connections effectively
3. **Caching**: Implement appropriate caching strategies
4. **Monitoring**: Keep track of database performance metrics

Remember, the best database design is one that serves your application's specific needs while maintaining performance and scalability.`,
        excerpt: "Learn the fundamental principles of database design and discover best practices for creating efficient, scalable data architectures.",
        featured_image: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        tags: ["database", "mongodb", "sql", "design", "performance"],
        published: true,
        published_at: new Date('2024-01-10'),
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-10')
      },
      {
        id: '3',
        title: "Building Responsive User Interfaces",
        slug: "building-responsive-user-interfaces",
        content: `# Creating Beautiful, Responsive UIs

User interface design has become increasingly important as users expect seamless experiences across all devices. Let's explore how to build interfaces that work everywhere.

## Mobile-First Approach

Starting with mobile design constraints forces you to prioritize content and functionality. This approach typically results in cleaner, more focused designs.

### Key Principles:
- **Progressive Enhancement**: Start simple, add complexity
- **Touch-Friendly**: Design for finger navigation
- **Performance**: Optimize for slower connections
- **Content Priority**: Show what matters most

## CSS Grid and Flexbox

Modern CSS layout tools have revolutionized how we approach responsive design.

### CSS Grid
Perfect for two-dimensional layouts:
\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
\`\`\`

### Flexbox
Ideal for one-dimensional layouts:
\`\`\`css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
\`\`\`

## Animation and Micro-interactions

Subtle animations can greatly enhance user experience:

1. **Loading States**: Keep users informed during wait times
2. **Hover Effects**: Provide visual feedback
3. **Transitions**: Smooth state changes
4. **Progressive Disclosure**: Reveal information gradually

## Accessibility Considerations

- **Semantic HTML**: Use proper HTML elements
- **Color Contrast**: Ensure sufficient contrast ratios
- **Keyboard Navigation**: Support keyboard-only users
- **Screen Readers**: Provide appropriate ARIA labels

Building great user interfaces requires balancing aesthetics, functionality, and accessibility. The best interfaces are often invisible to users – they just work.`,
        excerpt: "Master the art of creating responsive, accessible user interfaces that provide exceptional user experiences across all devices.",
        featured_image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        tags: ["ui design", "responsive", "css", "accessibility", "frontend"],
        published: true,
        published_at: new Date('2024-01-05'),
        created_at: new Date('2024-01-05'),
        updated_at: new Date('2024-01-05')
      }
    ];

    // Apply search filter
    let filteredPosts = mockPosts;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = mockPosts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchLower))
      );
    }

    // Apply tags filter
    if (tags && tags.length > 0) {
      filteredPosts = filteredPosts.filter(post =>
        post.tags && tags.some(tag => post.tags!.includes(tag))
      );
    }

    // Apply pagination
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedPosts = filteredPosts.slice(start, start + pageSize);

    return {
      posts: paginatedPosts,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  private static getMockPostBySlug(slug: string): BlogPost | null {
    const mockPosts = this.getMockAllPosts();
    return mockPosts.find(post => post.slug === slug) || null;
  }

  private static getMockAllPosts(): BlogPost[] {
    const mockData = this.getMockPosts();
    return mockData.posts;
  }
}