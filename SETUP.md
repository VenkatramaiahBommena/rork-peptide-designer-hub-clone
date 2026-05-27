# PeptiForge Setup Guide

## Project Overview

PeptiForge is a full-stack TypeScript application with:
- **Frontend**: React web app for peptide design and visualization
- **Backend**: Express.js API with Supabase PostgreSQL database
- **Serverless**: Cloudflare Workers for edge computing

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Cloudflare account (for Workers deployment)

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/VenkatramaiahBommena/rork-peptide-designer-hub-clone.git
cd rork-peptide-designer-hub-clone
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Supabase credentials to .env
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
```

#### Database Setup

1. Create Supabase project at https://supabase.com
2. Go to SQL Editor in Supabase Dashboard
3. Run the SQL from `backend/database.sql`:

```bash
# Copy entire content of database.sql and execute in Supabase SQL Editor
```

#### Start Backend Server

```bash
npm run dev
# Backend running at http://localhost:3001
```

### 3. Cloudflare Workers Setup

```bash
cd functions

# Install dependencies
npm install

# Configure wrangler
# Edit wrangler.toml with your account_id

# Create .env file
cp .env.example .env

# Add credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key

# Run locally
npm run dev
# Workers running at http://localhost:8787
```

### 4. Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update API URLs (optional if using localhost defaults)
# REACT_APP_API_BACKEND_URL=http://localhost:3001
# REACT_APP_API_WORKERS_URL=http://localhost:8787

# Start development server
npm run dev
# Frontend running at http://localhost:5173 (or similar)
```

## Project Structure

```
rork-peptide-designer-hub-clone/
├── backend/
│   ├── index.ts              # Express server & API routes
│   ├── database.sql          # PostgreSQL schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── functions/
│   ├── index.ts              # Cloudflare Workers API
│   ├── wrangler.toml
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
├── web/
│   ├── src/
│   ├── utils/
│   │   └── api-client.ts     # API client singleton
│   ├── package.json
│   └── .env.example
├── rork.json                 # Rork configuration
├── PLAN.md                   # Project specifications
├── SETUP.md                  # This file
└── .env.example
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Peptides
- `GET /api/peptides/:userId` - Get all user peptides
- `GET /api/peptides/:userId/:peptideId` - Get single peptide
- `POST /api/peptides` - Create peptide
- `PUT /api/peptides/:peptideId` - Update peptide
- `DELETE /api/peptides/:peptideId` - Delete peptide

### Docking Calculations
- `POST /api/docking/calculate` - Calculate docking scores

### Sequence Alignment
- `POST /api/alignment` - Perform sequence alignment

### Search
- `GET /api/search?q=query` - Global search

### Activity
- `GET /api/users/:userId/activity` - Get user activity
- `POST /api/users/:userId/activity` - Log activity

## Database Tables

- **peptides** - Stores peptide sequences and docking scores
- **projects** - User projects for organizing peptides
- **activity_logs** - Tracks user actions
- **sequence_versions** - Version history of sequences
- **saved_searches** - User's saved search queries
- **api_tokens** - API access tokens
- **alignments** - Stored sequence alignments

## Deployment

### Deploy Backend to Production

```bash
cd backend

# Build TypeScript
npm run build

# Deploy to your server (e.g., Heroku, Railway, Render)
# Update SUPABASE credentials in production environment
```

### Deploy Cloudflare Workers

```bash
cd functions

# Publish to Cloudflare
npm run deploy
```

### Deploy Frontend

```bash
cd web

# Build for production
npm run build

# Deploy to Vercel, Netlify, or your hosting
```

## Environment Variables

### Backend (.env)
```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
NODE_ENV=development
```

### Cloudflare Workers (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### Frontend (.env)
```
REACT_APP_API_BACKEND_URL=http://localhost:3001
REACT_APP_API_WORKERS_URL=http://localhost:8787
```

## Troubleshooting

### 404 Not Found Errors
- Ensure backend server is running on port 3001
- Check API endpoint paths match exactly
- Verify CORS headers are set correctly

### Database Connection Issues
- Verify Supabase credentials in .env
- Check database is initialized with schema.sql
- Ensure Row Level Security (RLS) policies are enabled

### CORS Errors
- Backend has CORS middleware enabled
- Workers API includes CORS headers
- Frontend should make requests to correct API URLs

### TypeScript Errors
- Run `npm run build` to check compilation
- Ensure @types packages are installed
- Clear node_modules and reinstall if issues persist

## Development Tips

1. **Hot Reload**: Both backend and functions support hot reload with `npm run dev`
2. **API Testing**: Use Postman or REST Client VS Code extension
3. **Database**: Use Supabase Studio for GUI access to database
4. **Logs**: Check browser console for frontend logs, terminal for backend

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review error messages in logs
3. Verify environment variables are set correctly
4. Check that all three services (backend, workers, frontend) are running

## License

Created by Rork - See LICENSE file
