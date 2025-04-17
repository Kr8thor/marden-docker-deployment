# MardenSEO Audit Frontend

This is the frontend application for MardenSEO Audit tool, a comprehensive SEO analysis tool designed to provide actionable insights for website optimization.

## Features

- Modern UI built with React, TypeScript, and TailwindCSS
- Responsive design for all device sizes
- Real-time SEO auditing
- Interactive visualizations
- Actionable SEO recommendations

## Tech Stack

- React + TypeScript
- Vite for fast development and optimized builds
- TailwindCSS for styling
- Shadcn UI components
- Lucide React for icons
- Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Kr8thor/marden-audit-reimagined.git
   cd marden-audit-reimagined
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file based on `.env.example`
   - Set `VITE_API_URL` to point to your backend API

4. Start the development server:
   ```
   npm run dev
   ```

5. Build for production:
   ```
   npm run build
   ```

## Deployment to Vercel

### Setup

1. Push your code to GitHub

2. Create a new project in Vercel
   - Connect your GitHub repository
   - Set the framework preset to Vite
   - Configure the following settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. Environment Variables
   - Add `VITE_API_URL` environment variable pointing to your backend API
   - For a combined deployment, you can use `/api` as the value

4. Deploy

### Production Optimizations

- Enable Vercel Edge Network for global CDN
- Configure custom domain (e.g., audit.mardenseo.com)
- Set up Vercel Analytics for monitoring

## Connecting with Backend

This frontend is designed to work with the MardenSEO Audit Backend. When deploying both to Vercel:

1. Deploy both repositories to Vercel
2. In the frontend project settings, add the backend as a Linked Project
3. Configure the `VITE_API_URL` environment variable to point to `/api`
4. Ensure proper CORS settings in the backend

## Development Notes

- All API calls are made through the API client in `src/api/client.ts`
- The main audit functionality is in the `useAudit` hook
- Update API endpoints in the client if your backend routes differ
"# Update timestamp: $(date)"  
