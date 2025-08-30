#!/bin/bash

# Simple API test script for Al-Makkah Expo Management System

BASE_URL="http://localhost:3000/api"

echo "🚀 Testing Al-Makkah Expo API..."
echo "=================================="

# Test health check
echo "1. Testing health check..."
curl -s "${BASE_URL}/health" | python3 -m json.tool
echo -e "\n"

# Test API info
echo "2. Testing API info..."
curl -s "${BASE_URL}/" | python3 -m json.tool
echo -e "\n"

# Test user registration
echo "3. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "organizer"
  }')

echo $REGISTER_RESPONSE | python3 -m json.tool
TOKEN=$(echo $REGISTER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
echo -e "\n"

if [ -n "$TOKEN" ]; then
  echo "4. Testing authenticated route..."
  curl -s "${BASE_URL}/auth/me" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
  echo -e "\n"
  
  echo "5. Testing expo creation..."
  curl -s -X POST "${BASE_URL}/expos" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Test Expo 2025",
      "description": "A test expo for API validation",
      "startDate": "2025-06-01T09:00:00Z",
      "endDate": "2025-06-03T18:00:00Z",
      "location": {
        "venue": "Test Convention Center",
        "address": "123 Test Street",
        "city": "Test City",
        "country": "Test Country"
      }
    }' | python3 -m json.tool
  echo -e "\n"
fi

echo "✅ API test completed!"
echo "If you see JSON responses above, your API is working correctly."
echo "Make sure your server is running with: bun run server.js"
