#!/bin/bash

# 🚀 KajoTai Rehab Clinic - Production Deployment Script

echo "🏥 Starting KajoTai Rehab Clinic deployment..."

# Check if environment variables are set
if [ -z "$VITE_ZALO_APP_ID" ]; then
    echo "❌ Error: VITE_ZALO_APP_ID is not set"
    echo "Please copy .env.example to .env.local and fill in your values"
    exit 1
fi

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ Error: VITE_SUPABASE_URL is not set"
    echo "Please copy .env.example to .env.local and fill in your values"
    exit 1
fi

echo "✅ Environment variables configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
zmp build

# Deploy to Zalo
echo "🚀 Deploying to Zalo Mini App..."
zmp deploy

echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Mini App URL: https://zalo.me/s/your-app-id"
echo "🏥 Reception System: Upload reception-clean.html to your web server"
echo "💾 Database: Ensure production-deploy.sql is run in Supabase"
