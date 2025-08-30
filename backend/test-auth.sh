#!/bin/bash

# Authentication API Test Script
BASE_URL="http://localhost:3000/api"

echo "🔐 Testing Al-Makkah Expo Authentication API"
echo "=============================================="

# 1. Test health check
echo "1. Testing health endpoint..."
curl -s "${BASE_URL}/health"
echo -e "\n"

# 2. Test API info
echo "2. Testing API root endpoint..."
curl -s "${BASE_URL}/"
echo -e "\n"

# 3. Test user registration
echo "3. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "organizer",
    "phoneNumber": "+1234567890"
  }')

echo "$REGISTER_RESPONSE"
echo -e "\n"

# Extract token from response (if successful)
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "" ]; then
  echo "✅ Registration successful! Token: ${TOKEN:0:20}..."
  echo -e "\n"
  
  # 4. Test profile retrieval
  echo "4. Testing profile retrieval..."
  curl -s -H "Authorization: Bearer $TOKEN" "${BASE_URL}/auth/me"
  echo -e "\n"
  
  # 5. Test profile update
  echo "5. Testing profile update..."
  curl -s -X PUT "${BASE_URL}/auth/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "firstName": "Updated",
      "lastName": "Name",
      "phoneNumber": "+9876543210"
    }'
  echo -e "\n"
  
  # 6. Test login with same credentials
  echo "6. Testing login..."
  curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testuser@example.com",
      "password": "password123"
    }'
  echo -e "\n"
  
else
  echo "❌ Registration failed or token not found. Trying login with existing user..."
  
  # Try login instead
  echo "6. Testing login..."
  LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testuser@example.com",
      "password": "password123"
    }')
  
  echo "$LOGIN_RESPONSE"
  echo -e "\n"
  
  # Extract token from login response
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  
  if [ -n "$TOKEN" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Login successful! Token: ${TOKEN:0:20}..."
    echo -e "\n"
    
    # Test profile retrieval with login token
    echo "7. Testing profile retrieval with login token..."
    curl -s -H "Authorization: Bearer $TOKEN" "${BASE_URL}/auth/me"
    echo -e "\n"
  fi
fi

# 7. Test invalid login
echo "8. Testing invalid login..."
curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "wrongpassword"
  }'
echo -e "\n"

# 8. Test forgot password
echo "9. Testing forgot password..."
curl -s -X POST "${BASE_URL}/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
echo -e "\n"

echo "🎉 Authentication API test completed!"
echo "Check the responses above to see if everything is working correctly."
