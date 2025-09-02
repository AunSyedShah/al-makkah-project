#!/bin/bash

# Script to update all axios imports to use the new api utility
# This handles Codespaces dynamic URLs

echo "🔧 Updating API imports for Codespaces compatibility..."

# Files to update
FILES=(
  "src/pages/Dashboard.jsx"
  "src/pages/ExposList.jsx" 
  "src/pages/ExpoDetails.jsx"
  "src/pages/ExhibitorsList.jsx"
  "src/pages/ExhibitorDetails.jsx"
  "src/pages/BoothManagement.jsx"
  "src/pages/Applications.jsx"
  "src/pages/Communications.jsx"
  "src/pages/Analytics.jsx"
  "src/pages/Settings.jsx"
)

# Update each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Updating $file..."
    
    # Replace axios import with api import
    sed -i "s|import axios from 'axios'|import api from '../utils/api'|g" "$file"
    
    # Replace axios. calls with api. calls and remove /api prefix
    sed -i "s|axios\.get('/api/|api.get('/|g" "$file"
    sed -i "s|axios\.post('/api/|api.post('/|g" "$file"
    sed -i "s|axios\.put('/api/|api.put('/|g" "$file"
    sed -i "s|axios\.patch('/api/|api.patch('/|g" "$file"
    sed -i "s|axios\.delete('/api/|api.delete('/|g" "$file"
    
    echo "✅ Updated $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "🎉 API updates complete!"
echo "📡 Frontend will now work with both localhost and Codespaces URLs"
echo "🔗 Codespaces URLs will be automatically detected and used"
