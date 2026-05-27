# PeptiForge - Peptide Sequence Generator & Docking Platform

## Overview

PeptiForge is a comprehensive full-stack application for peptide sequence design, optimization, and analysis. Built with modern web technologies, it features AI-powered sequence generation, molecular docking calculations, and advanced sequence alignment tools.

## Features

✨ **Core Features:**
- **Peptide Generator**: Generate optimized peptide sequences for various therapeutic targets
- **Docking Score Engine**: Multi-parameter scoring model for binding affinity, stability, and more
- **Sequence Alignment**: Interactive Needleman-Wunsch alignment visualization
- **CSV Export**: One-click export of sequences and scores
- **Global Search**: Fast search across all peptide databases
- **User Authentication**: Secure sign-up and login with Supabase
- **Activity Tracking**: Monitor all generation history and activities
- **Project Management**: Organize peptides into projects
- **API Access**: RESTful API for programmatic access

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend
- **Node.js + Express** - REST API server
- **Supabase** - PostgreSQL database & authentication
- **Cloudflare Workers** - Serverless edge functions
- **TypeScript** - Type-safe backend code

### Database
- **PostgreSQL** (via Supabase)
- **Row Level Security** - Data privacy
- **Full-Text Search** - Advanced search capabilities

## Quick Start

### Prerequisites
```bash
Node.js 18+
npm or yarn
Supabase account
Cloudflare account (optional)
```

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
# Server runs on http://localhost:3001
```

### 2. Cloudflare Workers Setup
```bash
cd functions
npm install
cp .env.example .env
# Edit .env with credentials
npm run dev
# Workers API runs on http://localhost:8787
```

### 3. Frontend Setup
```bash
cd web
npm install
cp .env.example .env
npm run dev
# Frontend runs on http://localhost:5173
```

## API Documentation

### Health Check
```
GET /api/health
```

### Peptides
```
GET    /api/peptides/:userId              # Get all peptides
GET    /api/peptides/:userId/:peptideId   # Get single peptide
POST   /api/peptides                      # Create peptide
PUT    /api/peptides/:peptideId           # Update peptide
DELETE /api/peptides/:peptideId           # Delete peptide
```

### Docking Calculations
```
POST /api/docking/calculate  # Calculate docking scores
```

### Sequence Alignment
```
POST /api/alignment  # Perform alignment
```

### Search
```
GET /api/search?q=query  # Search sequences
```

### Activity
```
GET  /api/users/:userId/activity  # Get activity log
POST /api/users/:userId/activity  # Create activity log
```

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL from `backend/database.sql` in the SQL editor
3. Enable Row Level Security for all tables
4. Configure environment variables

## Environment Variables

### Backend (.env)
```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_BACKEND_URL=http://localhost:3001
REACT_APP_API_WORKERS_URL=http://localhost:8787
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### 404 Not Found Error
- Ensure all three services (backend, workers, frontend) are running
- Check API endpoint paths are correct
- Verify CORS settings in backend
- Check browser console for detailed error messages

### Database Connection Issues
- Verify Supabase credentials
- Ensure database schema is initialized
- Check Row Level Security policies are enabled
- Review Supabase logs for connection errors

### CORS Errors
- Backend has CORS enabled for all origins
- Cloudflare Workers include proper CORS headers
- Verify API URLs in frontend .env

## Project Structure

```
rork-peptide-designer-hub-clone/
├── backend/
│   ├── index.ts           # Express server
│   ├── database.sql       # DB schema
│   ├── package.json
│   └── tsconfig.json
├── functions/
│   ├── index.ts           # Cloudflare Workers
│   ├── wrangler.toml
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   ├── utils/api-client.ts
│   ├── package.json
│   └── .env.example
├── rork.json              # Project config
└── SETUP.md              # Setup guide
```

## Deployment

### Backend
```bash
cd backend
npm run build
# Deploy to Heroku, Railway, Render, etc.
```

### Cloudflare Workers
```bash
cd functions
npm run deploy
```

### Frontend
```bash
cd web
npm run build
# Deploy to Vercel, Netlify, etc.
```

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Created by Rork - See LICENSE file

## Support

For issues and questions:
- Check SETUP.md for detailed setup instructions
- Review API documentation above
- Check GitHub issues for existing solutions
- Create a new issue with detailed information

## Contact

**Created by**: Venkatramaiah Bommena, PhD (Peptide Chemistry)

**Email**: bvenkatramaiah93@gmail.com

**Website**: https://rork.com/p/m764r1obdy0az7e5qqk30
