#!/bin/bash

# Initialize Git repository
git init

# Add all files to Git
git add .

# Commit changes
git commit -m "Initial commit"

# Rename the default branch to main
git branch -M main

# Prompt for GitHub username
read -p "Enter your GitHub username: " username

# Create a new repository on GitHub
echo "Please create a new repository on GitHub:"
echo "1. Go to https://github.com/new"
echo "2. Name your repository 'web-scraper'"
echo "3. Choose public or private visibility"
echo "4. Click 'Create repository'"
echo "5. Press Enter when done"
read -p "Press Enter to continue..."

# Add GitHub remote
git remote add origin "https://github.com/$username/web-scraper.git"

# Push to GitHub
git push -u origin main

echo "Repository has been pushed to GitHub!"
