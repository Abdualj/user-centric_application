#!/bin/bash

echo "🚀 JWT Authentication & Authorization - Final Demonstration"
echo "=========================================================="
echo ""

BASE_URL="http://localhost:3000"

echo "📋 Testing Complete Authentication Flow..."
echo ""

# Test 1: Register a new user
echo "1️⃣ User Registration:"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demouser",
    "email": "demo@example.com",
    "password": "demo123",
    "first_name": "Demo",
    "last_name": "User"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Test 2: Login with the new user
echo "2️⃣ User Login:"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')
echo ""

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "3️⃣ Authenticated Profile Access:"
  curl -s -X GET "$BASE_URL/api/auth/profile" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""

  echo "4️⃣ Media Upload (Authenticated):"
  UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/media" \
    -H "Authorization: Bearer $TOKEN" \
    -F "title=Demo Upload" \
    -F "description=Testing authenticated media upload" \
    -F "media=@uploads/media-1763637308427-782632213.jpg")
  
  echo "$UPLOAD_RESPONSE" | jq '.'
  MEDIA_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.id // empty')
  echo ""

  if [ ! -z "$MEDIA_ID" ] && [ "$MEDIA_ID" != "null" ]; then
    echo "5️⃣ Update Own Media (Authorized):"
    curl -s -X PUT "$BASE_URL/api/media/$MEDIA_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"title":"Updated Demo Media","description":"Successfully updated my own media!"}' | jq '.'
    echo ""
  fi

  echo "6️⃣ Try to Update Other User's Media (Should Fail):"
  curl -s -X PUT "$BASE_URL/api/media/1" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Hacked Title","description":"This should fail!"}' | jq '.'
  echo ""
else
  echo "❌ Could not extract token from login response"
fi

# Test Admin Functionality
echo "7️⃣ Admin Login:"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo "$ADMIN_LOGIN" | jq '.'
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.token // empty')
echo ""

if [ ! -z "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
  echo "8️⃣ Admin Override - Update Any Media:"
  curl -s -X PUT "$BASE_URL/api/media/2" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Admin Updated Media","description":"Admin can update any media!"}' | jq '.'
  echo ""
fi

echo "9️⃣ Access Without Token (Should Fail):"
curl -s -X GET "$BASE_URL/api/auth/profile" | jq '.'
echo ""

echo "🔟 View All Media (Public Access):"
curl -s -X GET "$BASE_URL/api/media" | jq '.data[0:2]'
echo ""

echo "✅ Authentication & Authorization Demo Complete!"
echo ""
echo "🎯 Features Demonstrated:"
echo "   ✅ User Registration & Login"
echo "   ✅ JWT Token Generation & Verification"
echo "   ✅ Protected Route Access"
echo "   ✅ Resource Ownership Validation"
echo "   ✅ Admin Role Privileges"
echo "   ✅ Unauthorized Access Prevention"
echo "   ✅ Public API Access"
echo ""
echo "🚀 Server Status: Running at $BASE_URL"
echo "📖 Documentation: $BASE_URL (interactive API docs)"
