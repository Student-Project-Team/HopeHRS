# Deployment Guide

## Production Deployment Steps

### 1. Vercel Deployment

1. Push code to GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
6. Click "Deploy"

### 2. Netlify Deployment

1. Push code to GitHub repository
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub
5. Select repository
6. Set build command: `npm run build`
7. Set publish directory: `dist`
8. Add environment variables
9. Click "Deploy site"

### 3. Environment Variables Required

| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous key |

### 4. Post-Deployment

1. Update Supabase redirect URLs:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add production URL to redirect URLs
2. Test Google OAuth in production
3. Verify all routes work
4. Test authentication flow

### 5. Verify Deployment

- [ ] Home page loads
- [ ] Login page works
- [ ] Google OAuth works
- [ ] Protected routes work
- [ ] API calls succeed
- [ ] All features functional
