#!/bin/bash

echo "🧪 Testing Authentication API Endpoints"
echo "========================================"

# Base URL
BASE_URL="http://localhost:3000"

echo "📋 Starting API tests..."
echo ""

# Test 1: Try accessing protected endpoint without authentication
echo "1️⃣ Testing access to protected endpoint without token:"
curl -s -X GET "$BASE_URL/api/auth/profile" | jq '.' || echo "Invalid JSON response"
echo ""

# Test 2: Try to register a new user
echo "2️⃣ Testing user registration:"
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }' | jq '.' || echo "Invalid JSON response"
echo ""

# Test 3: Login with registered user
echo "3️⃣ Testing user login:"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }')

echo "$LOGIN_RESPONSE" | jq '.' || echo "Invalid JSON response"

# Extract token for authenticated requests
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')
echo ""

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "4️⃣ Testing authenticated endpoint access:"
  curl -s -X GET "$BASE_URL/api/auth/profile" \
    -H "Authorization: Bearer $TOKEN" | jq '.' || echo "Invalid JSON response"
  echo ""

  echo "5️⃣ Testing media upload with authentication:"
  curl -s -X POST "$BASE_URL/api/media" \
    -H "Authorization: Bearer $TOKEN" \
    -F "title=Test Image" \
    -F "description=A test image upload" \
    -F "media=@/Users/abdulaljubury/user-centric_application/user-centric_application/week-4/uploads/media-1763637308427-782632213.jpg" | jq '.' || echo "Invalid JSON response"
  echo ""
else
  echo "❌ Could not extract token from login response"
fi

echo "✅ Authentication API tests completed!"
