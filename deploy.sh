#!/bin/bash

# Deploy script for Scribe Frontend to Google Cloud Run
# Usage: ./deploy.sh [PROJECT_ID] [BACKEND_URL]

set -e

# Get project ID from argument or gcloud config
PROJECT_ID=${1:-$(gcloud config get-value project)}
BACKEND_URL=${2:-"https://scribe-backend-xxxxx-uc.a.run.app"}

if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project ID provided. Usage: ./deploy.sh [PROJECT_ID] [BACKEND_URL]"
    echo "   Or set default project: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "🚀 Deploying frontend to project: $PROJECT_ID"
echo "🔗 Backend URL: $BACKEND_URL"

# Update the backend URL in the config
echo "📝 Updating backend URL in configuration..."
sed -i.bak "s|http://127.0.0.1:3001|$BACKEND_URL|g" src/config/urls.ts

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Submit build to Cloud Build
echo "🔨 Building and deploying frontend..."
gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID

# Get the service URL
SERVICE_URL=$(gcloud run services describe scribe-frontend --region=us-central1 --project=$PROJECT_ID --format='value(status.url)')

echo "✅ Frontend deployment complete!"
echo "🌐 Frontend URL: $SERVICE_URL"

# Test the deployment
echo "🧪 Testing frontend deployment..."
curl -s "$SERVICE_URL" | head -5 || echo "❌ Frontend test failed"

# Restore original config
echo "🔄 Restoring original configuration..."
mv src/config/urls.ts.bak src/config/urls.ts

echo ""
echo "📝 Next steps:"
echo "1. Update your domain DNS to point to: $SERVICE_URL"
echo "2. Configure custom domain in Cloud Run console"
echo "3. Test both InputApp and TranslationApp URLs"
echo ""
echo "🔗 URLs:"
echo "   InputApp: $SERVICE_URL"
echo "   TranslationApp: $SERVICE_URL?port=5174"
