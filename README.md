# Navigation Tracker

A full-stack React application for laboratory navigation tracking.

## Deployment on Vercel

This project is configured for deployment on Vercel. The following files have been set up:

- `vercel.json` - Vercel configuration
- `api/index.ts` - Serverless API functions
- `client/package.json` - Client build configuration

### Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the project**:
   ```bash
   vercel
   ```

4. **For production deployment**:
   ```bash
   vercel --prod
   ```

### Important Notes

- The project uses Vercel version 2 configuration
- Build process is handled by Vercel's static build system
- API routes are served through serverless functions in `/api` directory
- Static files are served from the built client application

### Project Structure

- `client/` - React frontend application
- `server/` - Express.js backend API
- `api/` - Vercel serverless functions
- `shared/` - Shared TypeScript schemas

### Build Process

The project uses Vite for building the frontend and esbuild for the backend. The build process:

1. Builds the React app using Vite
2. Bundles the server code using esbuild
3. Deploys static files and serverless functions to Vercel

### Environment Variables

Make sure to set up the following environment variables in your Vercel project:

- Database connection strings
- API keys
- Other configuration variables

### Troubleshooting

If you see code instead of the website:

1. Check that the build process completed successfully
2. Verify that `vercel.json` is properly configured
3. Ensure all dependencies are installed
4. Check the Vercel deployment logs for errors 