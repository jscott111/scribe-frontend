# Frontend Deployment Guide

This guide explains how to deploy the Scribe frontend using Cloud Build YAML configuration.

## Overview

The frontend is configured to deploy automatically via Cloud Build with:
- **Subdomain routing**: `speaker.{domain}` and `listener.{domain}`
- **Environment variables**: Configurable via Cloud Build substitutions
- **Automatic deployment**: Deploys to Cloud Run after building

## Quick Start

### 1. Update Domain Configuration

Edit `cloudbuild.yaml` and replace `yourdomain.com` with your actual domain in the substitutions section:

```yaml
substitutions:
  _VITE_NODE_ENV: 'prod'
  _VITE_BACKEND_URL: 'https://api.yourdomain.com'  # Replace with your domain
  _VITE_TRANSLATION_URL: 'https://listener.yourdomain.com'  # Replace with your domain
  _VITE_INPUT_URL: 'https://speaker.yourdomain.com'  # Replace with your domain
```

### 2. Deploy via Cloud Build

#### Option A: Using Cloud Build Triggers (Recommended)
1. Set up a Cloud Build trigger for your repository
2. Push to your deployment branch (e.g., `main` or `prod`)
3. Cloud Build will automatically build and deploy

#### Option B: Manual Build
```bash
gcloud builds submit --config cloudbuild.yaml .
```

#### Option C: Custom Substitutions
```bash
gcloud builds submit --config cloudbuild.yaml . \
  --substitutions=_VITE_BACKEND_URL=https://api.mydomain.com,_VITE_TRANSLATION_URL=https://listener.mydomain.com,_VITE_INPUT_URL=https://speaker.mydomain.com
```

### 3. Configure Custom Domains

After deployment, set up custom domain mapping:

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on `scribe-frontend` service
3. Go to "Custom Domains" tab
4. Add domains:
   - `speaker.{yourdomain.com}`
   - `listener.{yourdomain.com}`

### 4. Configure DNS

Add CNAME records to your domain:
```
speaker.{yourdomain.com} → ghs.googlehosted.com
listener.{yourdomain.com} → ghs.googlehosted.com
```

## Environment Variables

The deployment sets these environment variables in Cloud Run:

- `VITE_NODE_ENV=prod`
- `VITE_BACKEND_URL=https://api.{yourdomain.com}`
- `VITE_TRANSLATION_URL=https://listener.{yourdomain.com}`
- `VITE_INPUT_URL=https://speaker.{yourdomain.com}`

## Subdomain Routing

The frontend automatically routes based on subdomain:
- `speaker.{domain}` → InputApp (for speakers)
- `listener.{domain}` → TranslationApp (for listeners)
- Any other subdomain → 404 Not Found

## Build Process

The Cloud Build process:
1. **Install dependencies** (`npm ci`)
2. **Build application** (`npm run build`) with environment variables
3. **Build Docker image** with the built application
4. **Push image** to Google Container Registry
5. **Deploy to Cloud Run** with environment variables

## Customization

### Different Environments

For staging, update the substitutions:
```yaml
substitutions:
  _VITE_NODE_ENV: 'staging'
  _VITE_BACKEND_URL: 'https://api-staging.mydomain.com'
  _VITE_TRANSLATION_URL: 'https://listener-staging.mydomain.com'
  _VITE_INPUT_URL: 'https://speaker-staging.mydomain.com'
```

### Custom Build Arguments

You can override any substitution variable when triggering the build:
```bash
gcloud builds submit --config cloudbuild.yaml . \
  --substitutions=_VITE_BACKEND_URL=https://my-custom-api.com
```

## Troubleshooting

### Build Fails
- Check that all substitution variables are set correctly
- Verify your domain URLs are accessible
- Check Cloud Build logs for specific errors

### Subdomain Not Working
- Verify DNS records are pointing to `ghs.googlehosted.com`
- Check that custom domain mapping is created in Cloud Run
- Wait 10-15 minutes for SSL certificates to be provisioned

### CORS Errors
- Ensure your backend CORS_ORIGIN includes both subdomains
- Check that environment variables are set correctly in Cloud Run

## File Structure

```
scribe-frontend/
├── cloudbuild.yaml          # Cloud Build configuration
├── Dockerfile               # Container configuration
├── src/
│   ├── main.tsx            # Subdomain routing logic
│   └── config/
│       └── urls.ts         # Environment-based URL configuration
└── DEPLOYMENT_GUIDE.md     # This guide
```

## Next Steps

After successful deployment:
1. Test both subdomains work correctly
2. Set up SSL certificates (automatic with Cloud Run)
3. Configure your backend CORS to allow the new subdomains
4. Test user registration and authentication flow
