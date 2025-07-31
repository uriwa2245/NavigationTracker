# Deployment Guide - Vercel

This guide will help you deploy the Navigation Tracker application to Vercel for production use.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Node.js 18+**: Ensure your local environment has Node.js 18 or higher

## Step 1: Prepare Your Repository

### 1.1 Verify Configuration Files

Ensure these files are present and properly configured:

- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `package.json` - Contains build scripts
- ✅ `vite.config.ts` - Vite build configuration
- ✅ `api/index.ts` - API entry point for Vercel
- ✅ `.vercelignore` - Files to exclude from deployment

### 1.2 Check Build Scripts

Your `package.json` should have these scripts:

```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "npm run build"
  }
}
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

2. **Configure Project**:
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

3. **Environment Variables**:
   - Add `NODE_ENV=production`
   - Add any other environment variables from your `.env` file

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm settings
   - Deploy

## Step 3: Verify Deployment

### 3.1 Check Build Logs

After deployment, check the build logs for any errors:

1. Go to your project dashboard on Vercel
2. Click on the latest deployment
3. Check the "Build Logs" tab

### 3.2 Test Your Application

1. **Frontend**: Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. **API**: Test API endpoints (e.g., `https://your-app.vercel.app/api/tools`)
3. **Functionality**: Test all major features

### 3.3 Common Issues and Solutions

#### Issue: Build Fails
**Solution**: Check build logs for specific errors. Common issues:
- Missing dependencies in `package.json`
- TypeScript compilation errors
- Incorrect build command

#### Issue: API Routes Not Working
**Solution**: 
- Verify `api/index.ts` exists and exports correctly
- Check CORS configuration
- Ensure routes are properly registered

#### Issue: Static Files Not Loading
**Solution**:
- Verify `dist/public` directory is being generated
- Check `vercel.json` routes configuration
- Ensure build output directory is correct

## Step 4: Production Configuration

### 4.1 Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

### 4.2 Environment Variables

Set production environment variables:

1. Go to project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   NODE_ENV=production
   ```

### 4.3 Automatic Deployments

Configure automatic deployments:

1. Go to project settings
2. Navigate to "Git"
3. Enable "Auto Deploy" for your main branch

## Step 5: Monitoring and Maintenance

### 5.1 Monitor Performance

- Use Vercel Analytics (if enabled)
- Monitor function execution times
- Check error rates

### 5.2 Update Application

To update your application:

1. Push changes to your main branch
2. Vercel will automatically redeploy
3. Monitor the deployment status

### 5.3 Rollback (if needed)

If a deployment causes issues:

1. Go to your project dashboard
2. Click on "Deployments"
3. Find a working deployment
4. Click "Redeploy"

## Troubleshooting

### Build Errors

```bash
# Check build locally first
npm run build

# Check for TypeScript errors
npm run check
```

### API Issues

```bash
# Test API locally
curl http://localhost:5000/api/tools

# Check API logs in Vercel dashboard
```

### Performance Issues

1. **Enable Vercel Analytics**
2. **Optimize bundle size**:
   - Check for unused dependencies
   - Use code splitting
   - Optimize images

### Database Issues

Since this app uses in-memory storage:
- Data will be reset on each deployment
- Consider implementing persistent storage for production

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure CORS properly for production
3. **Input Validation**: Ensure all inputs are validated
4. **Rate Limiting**: Consider implementing rate limiting

## Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs for specific errors
3. Test locally to isolate issues
4. Contact Vercel support if needed

## Next Steps

After successful deployment:

1. **Set up monitoring** and alerts
2. **Configure backups** if using persistent storage
3. **Set up CI/CD** for automated testing
4. **Document your deployment process** for your team 