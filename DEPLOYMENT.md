# 🚀 StudyQuest - Deployment Guide

Congratulations on building your StudyQuest time management app! Here's a comprehensive guide to publishing it online.

## 📋 Prerequisites

Before deploying, make sure you have:
- A GitHub repository with your code
- Node.js 18+ installed locally
- Environment variables configured

## 🌐 Deployment Options

### 1. Vercel (Recommended for Next.js)

**Why Vercel?**
- Built by the creators of Next.js
- Zero-config deployment
- Free tier available
- Automatic deployments from Git

**Steps:**
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project? `N`
   - Project name? `studyquest-app`
   - Directory? `.` (current directory)
   - Override settings? `N`

5. **Add Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   ```
   Enter your database URL (for production, consider using Vercel Postgres or Supabase)

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### 2. Netlify

**Steps:**
1. **Build your project**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=.next
   ```

### 3. Railway

**Steps:**
1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize project**
   ```bash
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## 🔧 Production Setup

### Environment Variables

Create a `.env.production` file with:
```env
DATABASE_URL=your_production_database_url
NEXTAUTH_URL=your_domain_url
NEXTAUTH_SECRET=your_secret_key
```

### Database Options

**Free Options:**
- **Supabase** - PostgreSQL with generous free tier
- **PlanetScale** - MySQL serverless
- **Neon** - PostgreSQL serverless
- **Vercel Postgres** - Integrated with Vercel

**Setup Example (Supabase):**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string
4. Update your `DATABASE_URL`
5. Run migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## 📦 Build Process

### Manual Build
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t studyquest .
docker run -p 3000:3000 studyquest
```

## 🎯 Custom Domain Setup

### Vercel
1. Go to project dashboard
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records

## 🔒 Security Considerations

1. **Environment Variables** - Never commit `.env` files
2. **Database Security** - Use connection pooling
3. **API Routes** - Add rate limiting
4. **Authentication** - Implement user auth (NextAuth.js recommended)

## 📊 Monitoring

**Free Monitoring Tools:**
- **Vercel Analytics** - Built-in with Vercel
- **LogRocket** - Session replay
- **Sentry** - Error tracking
- **Uptime Robot** - Uptime monitoring

## 🚀 Pre-Deployment Checklist

- [ ] Test all features locally
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Optimize images and assets
- [ ] Test mobile responsiveness
- [ ] Set up analytics
- [ ] Configure custom domain
- [ ] Test deployment on staging

## 💡 Pro Tips

1. **Performance**: Enable Next.js Image Optimization
2. **SEO**: Add metadata to your pages
3. **SEO**: Generate sitemap automatically
4. **Caching**: Use ISR (Incremental Static Regeneration)
5. **Bundle Size**: Analyze with `@next/bundle-analyzer`

## 🛠️ Troubleshooting

**Common Issues:**
- **Build errors**: Check Node.js version compatibility
- **Database connection**: Verify environment variables
- **Static assets**: Ensure public folder is properly configured
- **API routes**: Test endpoints individually

**Debug Commands:**
```bash
# Check build
npm run build

# Test production locally
npm run start

# Check environment
npm run env:info
```

## 📞 Support

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)

---

Your StudyQuest app is now ready to help students worldwide manage their time effectively! 🎓✨