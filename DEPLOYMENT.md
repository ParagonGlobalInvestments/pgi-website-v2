# PGI Portal Deployment Guide

## Pre-deployment Checklist

1. **Environment Variables**

   - [ ] Copy all variables from `.env.production.example` to Vercel project settings
   - [ ] Set up production Clerk keys
   - [ ] Configure production MongoDB URI
   - [ ] Set correct production URLs

2. **Clerk Setup**

   - [ ] Configure production JWT template
   - [ ] Set up production webhooks
   - [ ] Update allowed origins in Clerk dashboard
   - [ ] Configure sign-in/sign-up URLs

3. **MongoDB Setup**

   - [ ] Create production database
   - [ ] Set up database indexes
   - [ ] Configure network access for Vercel IPs
   - [ ] Back up any existing data

4. **Domain Configuration**
   - [ ] Configure main domain (paragon-global.org)
   - [ ] Set up portal subdomain (portal.paragon-global.org)
   - [ ] Add domains to Vercel project
   - [ ] Configure DNS records

## Deployment Steps

1. **Initial Setup**

   ```bash
   # Install dependencies
   npm install

   # Build locally to test
   npm run build
   ```

2. **Vercel Deployment**

   - Connect your GitHub repository to Vercel
   - Configure the production branch (usually `main`)
   - Add all environment variables
   - Deploy the project

3. **Post-deployment**
   - Verify all routes are working
   - Test authentication flow
   - Check mobile responsiveness
   - Verify API endpoints
   - Test database connections

## Monitoring

- Set up error monitoring
- Configure performance monitoring
- Set up uptime monitoring
- Enable Vercel Analytics

## Security Checklist

- [ ] Enable HTTPS only
- [ ] Configure security headers
- [ ] Set up CORS policies
- [ ] Enable rate limiting
- [ ] Configure authentication timeouts

## Rollback Plan

1. If issues occur:

   - Identify the problem
   - Check Vercel deployment logs
   - Verify environment variables
   - Check MongoDB connection
   - Verify Clerk configuration

2. To rollback:
   - Use Vercel's instant rollback feature
   - Restore database backup if needed
   - Update DNS if required

## Maintenance

- Regular database backups
- Monitor error logs
- Update dependencies
- Check security advisories
- Monitor performance metrics
