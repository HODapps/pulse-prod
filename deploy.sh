#!/bin/bash

# Project Pulse - Quick Deploy Script
# Usage: ./deploy.sh "Your commit message"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment process...${NC}"

# Check if commit message provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide a commit message"
    echo "Usage: ./deploy.sh \"Your commit message\""
    exit 1
fi

# Add all changes
echo -e "${BLUE}📦 Adding changes...${NC}"
git add .

# Commit with provided message
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$1"

# Push to GitHub
echo -e "${BLUE}⬆️  Pushing to GitHub...${NC}"
git push

echo -e "${GREEN}✅ Pushed to GitHub successfully!${NC}"
echo -e "${GREEN}🌐 Vercel will auto-deploy in ~1-2 minutes${NC}"
echo -e "${BLUE}📊 Check deployment status: https://vercel.com/hodapps${NC}"
