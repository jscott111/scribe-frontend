#!/bin/bash

# Frontend Deployment Script for Scribe
# This script builds and deploys the frontend to Cloud Run with subdomain support

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Scribe Frontend Deployment${NC}"

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No project ID found. Please run 'gcloud config set project YOUR_PROJECT_ID'${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Project ID: $PROJECT_ID${NC}"

# Get the current commit SHA
COMMIT_SHA=$(git rev-parse --short HEAD)
echo -e "${YELLOW}📋 Commit SHA: $COMMIT_SHA${NC}"

# Set your domain (replace with your actual domain)
DOMAIN="yourdomain.com"
echo -e "${YELLOW}📋 Domain: $DOMAIN${NC}"

# Build the frontend
echo -e "${GREEN}🔨 Building frontend...${NC}"
gcloud builds submit --config cloudbuild.yaml .

# Deploy to Cloud Run
echo -e "${GREEN}🚀 Deploying to Cloud Run...${NC}"

# Deploy the main service
gcloud run deploy scribe-frontend \
  --image gcr.io/$PROJECT_ID/scribe-frontend:$COMMIT_SHA \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars "VITE_NODE_ENV=prod,VITE_BACKEND_URL=https://api.$DOMAIN,VITE_TRANSLATION_URL=https://listener.$DOMAIN,VITE_INPUT_URL=https://speaker.$DOMAIN"

# Get the service URL
SERVICE_URL=$(gcloud run services describe scribe-frontend --region=us-central1 --format="value(status.url)")
echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
echo -e "${YELLOW}🌐 Service URL: $SERVICE_URL${NC}"

echo -e "${GREEN}📋 Next Steps:${NC}"
echo -e "${YELLOW}1. Set up custom domain mapping in Cloud Run:${NC}"
echo -e "   - speaker.$DOMAIN → $SERVICE_URL"
echo -e "   - listener.$DOMAIN → $SERVICE_URL"
echo -e "   - api.$DOMAIN → (your backend service URL)"
echo -e ""
echo -e "${YELLOW}2. Configure DNS records:${NC}"
echo -e "   - A record: speaker.$DOMAIN → (Cloud Run IP)"
echo -e "   - A record: listener.$DOMAIN → (Cloud Run IP)"
echo -e "   - A record: api.$DOMAIN → (Cloud Run IP)"
echo -e ""
echo -e "${YELLOW}3. Set up SSL certificates for custom domains${NC}"

echo -e "${GREEN}🎉 Deployment complete!${NC}"