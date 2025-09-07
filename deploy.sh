#!/bin/bash

# Banana Diary - Cloud Run Deployment Script

echo "🍌 Deploying Banana Diary to Google Cloud Run..."

# Set your project variables
PROJECT_ID="your-project-id"
SERVICE_NAME="banana-diary"
REGION="us-central1"

# Build and deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production" \
  --quiet

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at: https://$SERVICE_NAME-[hash]-$REGION.a.run.app"
