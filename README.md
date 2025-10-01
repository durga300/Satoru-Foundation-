<<<<<<< HEAD
# Modern Blog Platform

A fully functional, dynamic blog platform built with React, TypeScript, Node.js, Express, and MongoDB. This platform features a modern UI, real-time content management, image uploads, and comprehensive admin functionality.

## 🚀 Features

### Core Features
- **Dynamic Content Management**: All content is stored in MongoDB, not static files
- **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS
- **Real-time Search & Filtering**: Search by title, content, or filter by tags
- **Dynamic Routing**: Clean URLs with slug-based routing
- **Pagination**: Efficient content loading with pagination support

### Admin Features
- **Content Management**: Create, edit, and delete blog posts
- **Rich Text Editor**: Markdown editor for content creation
- **Image Management**: Upload and manage multiple images per post
- **Tag System**: Organize posts with custom tags
- **Publish Control**: Draft and publish workflow
- **Real-time Preview**: See changes as you type

### Technical Features
- **REST API**: Complete backend API with proper error handling
- **Database Integration**: MongoDB with optimized queries
- **Image Processing**: Automatic image optimization with Sharp
- **Type Safety**: Full TypeScript implementation
- **Modern Build Tools**: Vite for fast development and building

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Multer** - File upload handling
- **Sharp** - Image processing

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Concurrently** - Run multiple commands

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd modern-blog-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
cp env.example .env
```

Update the `.env` file with your configuration:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
DB_NAME=blog-platform

# Server Configuration
PORT=3001

# Development Configuration
NODE_ENV=development
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the Application

#### Development Mode (Recommended)
Run both frontend and backend simultaneously:
```bash
npm run dev:full
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

#### Individual Services
Run backend only:
```bash
npm run server
```

Run frontend only:
```bash
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 📁 Project Structure

```
modern-blog-platform/
├── src/                          # Frontend source code
│   ├── components/               # Reusable React components
│   │   ├── BlogCard.tsx         # Blog post card component
│   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   ├── MarkdownEditor.tsx   # Rich text editor
│   │   ├── MarkdownRenderer.tsx # Markdown content renderer
│   │   ├── Pagination.tsx       # Pagination component
│   │   └── SearchBar.tsx        # Search and filter component
│   ├── lib/                     # Utility libraries
│   │   ├── api.ts              # API client
│   │   └── mongodb.ts          # Database connection
│   ├── pages/                   # Page components
│   │   ├── AdminPage.tsx       # Admin dashboard
│   │   ├── HomePage.tsx        # Homepage
│   │   └── PostPage.tsx        # Individual post page
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles
├── uploads/                     # Uploaded images (created automatically)
├── server.js                   # Backend server
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── README.md                 # This file
```

## 🔧 API Endpoints

### Posts
- `GET /api/posts` - Get all posts (with pagination, search, filtering)
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/slug/:slug` - Get post by slug
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Images
- `POST /api/upload` - Upload single image
- `POST /api/posts/:id/images` - Add image to post
- `GET /api/posts/:id/images` - Get post images

### Health
- `GET /api/health` - Health check endpoint

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize the design by:
1. Modifying `tailwind.config.js` for theme customization
2. Updating component classes in the React components
3. Adding custom CSS in `src/index.css`

### Database Schema
The MongoDB collections are:
- **posts**: Blog post documents
- **images**: Post image documents

### Adding New Features
1. Create new components in `src/components/`
2. Add new API endpoints in `server.js`
3. Update the API client in `src/lib/api.ts`

## 🚀 Deployment

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=blog-platform-prod
PORT=3001
NODE_ENV=production
```

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Configure environment variables in Vercel dashboard

### Deploy to Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set MONGODB_URI=your-mongodb-uri`
4. Deploy: `git push heroku main`

## 🧪 Testing

### Manual Testing
1. Start the application: `npm run dev:full`
2. Navigate to http://localhost:5173
3. Test all features:
   - Create, edit, delete posts
   - Upload images
   - Search and filter posts
   - Admin functionality

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Get all posts
curl http://localhost:3001/api/posts

# Create a new post
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"This is a test","published":true}'
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in your .env file
   - Verify MongoDB is accessible from your application

2. **Port Already in Use**
   - Change the PORT in your .env file
   - Kill the process using the port: `lsof -ti:3001 | xargs kill -9`

3. **Image Upload Issues**
   - Check that the uploads directory exists
   - Verify file permissions
   - Ensure Sharp is properly installed

4. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run typecheck`

## 📝 Development Notes

### AI Tool Usage Disclosure
This project was developed with assistance from AI tools including:
- **Claude (Anthropic)** - Used for code generation, debugging, and architectural decisions
- **GitHub Copilot** - Used for code completion and suggestions
- **ChatGPT** - Used for documentation and troubleshooting

All AI assistance was used to enhance development speed and code quality while maintaining full control over the final implementation.

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Consistent code formatting
- Comprehensive error handling
- Responsive design principles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- MongoDB for the flexible database
- Vite for the fast build tool
- All open-source contributors

---

**Happy Blogging! 🎉**

For support or questions, please open an issue in the repository.
=======
# Satoru-Foundation-
Project assignment complete details Here 
>>>>>>> 8425e3d40e4bbc6847ad744832d449a30389df7d
