# Deployment Guide

## Quick Deployment Options

### 1. Vercel (Recommended for Frontend + API)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `DB_NAME`: Your database name
     - `PORT`: 3001

### 2. Heroku (Full Stack)

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-blog-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-connection-string
   heroku config:set DB_NAME=blog-platform
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### 3. Netlify (Frontend) + Railway (Backend)

1. **Deploy Backend to Railway**
   - Connect your GitHub repository
   - Set environment variables
   - Deploy

2. **Deploy Frontend to Netlify**
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-railway-app.railway.app`

### 4. DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Select "Web Service" for backend
   - Select "Static Site" for frontend

2. **Configure Backend**
   - Build command: `npm install && npm run build`
   - Run command: `node server.js`
   - Environment variables: MongoDB URI, DB name

3. **Configure Frontend**
   - Build command: `npm install && npm run build`
   - Output directory: `dist`

## Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-platform
DB_NAME=blog-platform
PORT=3001
NODE_ENV=production
```

## Database Setup

### MongoDB Atlas (Recommended)
1. Create account at https://cloud.mongodb.com
2. Create a new cluster
3. Create database user
4. Whitelist your IP address
5. Get connection string

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017`

## Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Build process working (`npm run build`)
- [ ] All features tested locally
- [ ] Images upload working
- [ ] Admin panel functional
- [ ] API endpoints responding

## Post-deployment

1. Test all functionality
2. Verify image uploads work
3. Check admin panel access
4. Test search and filtering
5. Verify responsive design
6. Check performance

## Monitoring

- Set up error tracking (Sentry)
- Monitor database performance
- Track API response times
- Monitor image upload success rates
