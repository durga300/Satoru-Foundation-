import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'blog-platform';

let mongoClient;
let db;

async function connectToDatabase() {
  if (db) return db;
  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  db = mongoClient.db(DB_NAME);

  // Ensure indexes
  await db.collection('posts').createIndexes([
    { key: { slug: 1 }, unique: true },
    { key: { published_at: -1 } },
    { key: { title: 'text', content: 'text', excerpt: 'text' } },
  ]);
  await db.collection('images').createIndexes([
    { key: { post_id: 1 } },
    { key: { position: 1 } },
  ]);

  return db;
}

async function getCollection(name) {
  const database = await connectToDatabase();
  return database.collection(name);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Utility function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Utility function to process and save image
async function processAndSaveImage(buffer, filename) {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  // Create uploads directory if it doesn't exist
  const fs = await import('fs');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const processedFilename = `processed_${Date.now()}_${filename}`;
  const filepath = path.join(uploadsDir, processedFilename);

  // Process image with sharp (resize, optimize)
  await sharp(buffer)
    .resize(1200, 800, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ quality: 85 })
    .toFile(filepath);

  return `/uploads/${processedFilename}`;
}

// API Routes

// GET /api/posts - Get all posts with pagination, search, and filtering
app.get('/api/posts', async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      search, 
      tags,
      published 
    } = req.query;

    const postsCollection = await getCollection('posts');
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    if (published !== undefined) {
      query.published = published === 'true';
    }

    // Get total count
    const total = await postsCollection.countDocuments(query);
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const skip = (pageNum - 1) * pageSizeNum;
    const totalPages = Math.ceil(total / pageSizeNum);

    // Get posts
    const posts = await postsCollection
      .find(query)
      .sort({ published_at: -1, created_at: -1 })
      .skip(skip)
      .limit(pageSizeNum)
      .toArray();

    res.json({
      posts,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/posts/:id - Get single post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const postsCollection = await getCollection('posts');
    
    const objectId = ObjectId.isValid(id) ? new ObjectId(id) : null;
    if (!objectId) return res.status(400).json({ error: 'Invalid id' });
    const post = await postsCollection.findOne({ _id: objectId });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// GET /api/posts/slug/:slug - Get single post by slug
app.get('/api/posts/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const postsCollection = await getCollection('posts');
    
    const post = await postsCollection.findOne({ slug });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/posts - Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const postsCollection = await getCollection('posts');
    
    const { title, content, excerpt, tags = [], featured_image, published = false } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const slug = generateSlug(title);
    const now = new Date();
    
    const postData = {
      title,
      slug,
      content,
      excerpt: excerpt || '',
      tags: Array.isArray(tags) ? tags : [],
      featured_image: featured_image || '',
      published: Boolean(published),
      published_at: published ? now : null,
      created_at: now,
      updated_at: now
    };

    const result = await postsCollection.insertOne(postData);
    const newPost = { ...postData, _id: result.insertedId };

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/posts/:id - Update post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const postsCollection = await getCollection('posts');
    const objectId = ObjectId.isValid(id) ? new ObjectId(id) : null;
    if (!objectId) return res.status(400).json({ error: 'Invalid id' });
    
    const { title, content, excerpt, tags, featured_image, published } = req.body;
    
    const updateData = {
      updated_at: new Date()
    };

    if (title) {
      updateData.title = title;
      updateData.slug = generateSlug(title);
    }
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (featured_image !== undefined) updateData.featured_image = featured_image;
    if (published !== undefined) {
      updateData.published = Boolean(published);
      if (published && !updateData.published_at) {
        updateData.published_at = new Date();
      }
    }

    const result = await postsCollection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedPost = await postsCollection.findOne({ _id: objectId });
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/posts/:id - Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const postsCollection = await getCollection('posts');
    const objectId = ObjectId.isValid(id) ? new ObjectId(id) : null;
    if (!objectId) return res.status(400).json({ error: 'Invalid id' });
    
    const result = await postsCollection.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Also delete associated images
    const imagesCollection = await getCollection('images');
    await imagesCollection.deleteMany({ post_id: id });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST /api/upload - Upload image
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { originalname, buffer } = req.file;
    const imageUrl = await processAndSaveImage(buffer, originalname);

    res.json({ 
      success: true, 
      imageUrl,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/posts/:id/images - Add image to post
app.post('/api/posts/:id/images', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, caption, position } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { originalname, buffer } = req.file;
    const imageUrl = await processAndSaveImage(buffer, originalname);

    const imagesCollection = await getCollection('images');
    const imageData = {
      post_id: id,
      image_url: imageUrl,
      alt_text: alt_text || '',
      caption: caption || '',
      position: parseInt(position) || 0,
      created_at: new Date()
    };

    const result = await imagesCollection.insertOne(imageData);
    const newImage = { ...imageData, _id: result.insertedId };

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error adding image to post:', error);
    res.status(500).json({ error: 'Failed to add image to post' });
  }
});

// GET /api/posts/:id/images - Get images for a post
app.get('/api/posts/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const imagesCollection = await getCollection('images');
    
    const images = await imagesCollection
      .find({ post_id: id })
      .sort({ position: 1 })
      .toArray();

    res.json(images);
  } catch (error) {
    console.error('Error fetching post images:', error);
    res.status(500).json({ error: 'Failed to fetch post images' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
