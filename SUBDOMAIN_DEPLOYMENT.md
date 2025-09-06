# Frontend Subdomain Deployment Guide

This guide explains how to deploy the Scribe frontend with proper subdomain routing for `speaker.{domain}` and `listener.{domain}`.

## Overview

The frontend application uses subdomain-based routing:
- `speaker.{domain}` → InputApp (for speakers)
- `listener.{domain}` → TranslationApp (for listeners)
- `api.{domain}` → Backend API

## Prerequisites

1. Google Cloud Project with Cloud Run enabled
2. Custom domain configured in Google Cloud
3. DNS access for your domain
4. SSL certificates (handled by Cloud Run)

## Step 1: Update Domain Configuration

Edit `scribe-frontend/deploy.sh` and replace `yourdomain.com` with your actual domain:

```bash
# Set your domain (replace with your actual domain)
DOMAIN="yourdomain.com"
```

## Step 2: Deploy Frontend

```bash
cd scribe-frontend
./deploy.sh
```

This will:
- Build the frontend with environment variables
- Deploy to Cloud Run
- Set up environment variables for subdomain routing

## Step 3: Configure Custom Domain Mapping

### Option A: Using Cloud Console

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your `scribe-frontend` service
3. Go to "Custom Domains" tab
4. Click "Add Custom Domain"
5. Add the following domains:
   - `speaker.{yourdomain.com}`
   - `listener.{yourdomain.com}`

### Option B: Using gcloud CLI

```bash
# Map speaker subdomain
gcloud run domain-mappings create \
  --service=scribe-frontend \
  --domain=speaker.yourdomain.com \
  --region=us-central1

# Map listener subdomain
gcloud run domain-mappings create \
  --service=scribe-frontend \
  --domain=listener.yourdomain.com \
  --region=us-central1
```

## Step 4: Configure DNS Records

Add the following DNS records to your domain:

```
Type: CNAME
Name: speaker
Value: ghs.googlehosted.com

Type: CNAME
Name: listener
Value: ghs.googlehosted.com

Type: CNAME
Name: api
Value: (your-backend-service-url)
```

## Step 5: Environment Variables

The frontend is configured with these environment variables:

### Production
- `VITE_NODE_ENV=prod`
- `VITE_BACKEND_URL=https://api.{yourdomain.com}`
- `VITE_TRANSLATION_URL=https://listener.{yourdomain.com}`
- `VITE_INPUT_URL=https://speaker.{yourdomain.com}`

### Staging
- `VITE_NODE_ENV=staging`
- `VITE_BACKEND_URL=https://api-staging.{yourdomain.com}`
- `VITE_TRANSLATION_URL=https://listener-staging.{yourdomain.com}`
- `VITE_INPUT_URL=https://speaker-staging.{yourdomain.com}`

## Step 6: Update Backend CORS

Make sure your backend CORS configuration includes the new subdomains:

```javascript
CORS_ORIGIN: "https://speaker.yourdomain.com,https://listener.yourdomain.com"
```

## Step 7: Test Deployment

1. Visit `https://speaker.{yourdomain.com}` - should show InputApp
2. Visit `https://listener.{yourdomain.com}` - should show TranslationApp
3. Test user registration and authentication

## Troubleshooting

### SSL Certificate Issues
- Cloud Run automatically provisions SSL certificates for custom domains
- Wait 10-15 minutes after domain mapping for certificates to be ready

### CORS Errors
- Ensure backend CORS_ORIGIN includes both subdomains
- Check that environment variables are set correctly

### 404 Errors
- Verify DNS records are pointing to `ghs.googlehosted.com`
- Check that domain mappings are created in Cloud Run

## Development vs Production

### Development
- Uses `localhost` subdomains: `speaker.localhost:5173`, `listener.localhost:5173`
- Requires `/etc/hosts` configuration (see `setup-localhost.sh`)

### Production
- Uses real domain subdomains: `speaker.{domain}`, `listener.{domain}`
- Requires DNS configuration and SSL certificates

## File Structure

```
scribe-frontend/
├── deploy.sh                 # Deployment script
├── cloudbuild.yaml          # Cloud Build configuration
├── src/
│   ├── main.tsx             # Subdomain routing logic
│   └── config/
│       └── urls.ts          # Environment-based URL configuration
└── SUBDOMAIN_DEPLOYMENT.md  # This guide
```

## Support

If you encounter issues:
1. Check Cloud Run logs for errors
2. Verify DNS propagation with `nslookup`
3. Test SSL certificates with `openssl s_client`
4. Check browser developer tools for CORS errors
