# Frontend Deployment to Google Cloud Run

This guide explains how to deploy the Scribe frontend to Google Cloud Run.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   InputApp      │    │ TranslationApp  │
│   (Port 5173)   │    │   (Port 5174)   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌─────────────────┐
         │  Cloud Run      │
         │  (Frontend)     │
         └─────────────────┘
                     │
         ┌─────────────────┐
         │  Cloud Run      │
         │  (Backend)      │
         └─────────────────┘
```

## Deployment Options

### Option 1: Single Cloud Run Service (Recommended)
- **One service** serves both InputApp and TranslationApp
- **Different ports** handled by routing
- **Simpler management** and deployment

### Option 2: Separate Cloud Run Services
- **Two separate services** for each app
- **Independent scaling** and deployment
- **More complex** but more flexible

## Quick Deployment

```bash
# Deploy frontend (replace with your backend URL)
./deploy.sh YOUR_PROJECT_ID https://your-backend-url.run.app
```

## Manual Deployment

### 1. Update Backend URL

```bash
# Update the backend URL in your config
sed -i 's|http://127.0.0.1:3001|https://your-backend-url.run.app|g' src/config/urls.ts
```

### 2. Build and Deploy

```bash
# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Deploy
gcloud builds submit --config cloudbuild.yaml
```

## Configuration

### Environment Variables

The frontend will automatically use the backend URL from the configuration.

### CORS Configuration

Make sure your backend allows your frontend domain:

```bash
# In your backend Cloud Run service
CORS_ORIGIN=https://your-frontend-domain.com
```

## Custom Domain Setup

### 1. Configure Custom Domain

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service=scribe-frontend \
  --domain=your-domain.com \
  --region=us-central1
```

### 2. Update DNS

Point your domain's A record to the Cloud Run IP address.

## Routing Strategy

### Single Service Approach

Since both apps are React applications, you can:

1. **Serve both from same domain** with different paths
2. **Use query parameters** to determine which app to show
3. **Deploy separate builds** for each app

### Recommended: Separate Deployments

Deploy each app separately for better isolation:

```bash
# Deploy InputApp
./deploy.sh YOUR_PROJECT_ID https://your-backend-url.run.app input

# Deploy TranslationApp  
./deploy.sh YOUR_PROJECT_ID https://your-backend-url.run.app translation
```

## Monitoring

### Health Checks

- **Frontend**: `GET /` (returns HTML)
- **Backend**: `GET /api/health` (returns JSON)

### Logs

```bash
# View frontend logs
gcloud logs read --service=scribe-frontend --limit=50

# View backend logs
gcloud logs read --service=scribe-backend --limit=50
```

## Cost Optimization

### Cloud Run Pricing

- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GB-second
- **Requests**: $0.40 per million requests

### Optimization Tips

1. **Minimize memory** allocation (256Mi for frontend)
2. **Set max instances** to prevent runaway costs
3. **Use CDN** for static assets
4. **Enable auto-scaling** to scale to zero

## Security Considerations

1. **HTTPS only** - Cloud Run provides SSL automatically
2. **CORS protection** - Configure allowed origins
3. **Environment variables** - No secrets in frontend
4. **Authentication** - Handled by backend

## Troubleshooting

### Common Issues

1. **CORS errors** - Check backend CORS_ORIGIN setting
2. **Backend connection** - Verify backend URL in config
3. **Build failures** - Check Dockerfile and dependencies

### Debug Commands

```bash
# Check service status
gcloud run services describe scribe-frontend --region=us-central1

# View recent logs
gcloud logs read --service=scribe-frontend --limit=100

# Test health
curl https://your-frontend-url.run.app/
```

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend builds successfully
- [ ] CORS configured correctly
- [ ] Custom domain configured
- [ ] SSL certificate valid
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
