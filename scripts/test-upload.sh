#!/bin/bash

# File Upload Test Script for Week 4 Assignment
# Tests the Multer file upload implementation

echo "🧪 Testing File Upload Functionality"
echo "════════════════════════════════════"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}Checking if server is running...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start it first:${NC}"
    echo -e "${YELLOW}   cd week-4 && node demo-app.js${NC}"
    exit 1
fi

# Create a test image file if it doesn't exist
TEST_IMAGE="test-upload.txt"
if [ ! -f "$TEST_IMAGE" ]; then
    echo -e "${BLUE}Creating test file...${NC}"
    echo "This is a test file for upload testing" > "$TEST_IMAGE"
fi

echo ""
echo -e "${BLUE}🔄 Testing file upload (will fail due to file type restriction)...${NC}"
echo "────────────────────────────────────────────────────────────"

# Test 1: Upload with wrong file type (should fail)
echo -e "${YELLOW}Test 1: Upload text file (should fail)${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X POST http://localhost:3000/api/media \
    -F "media=@$TEST_IMAGE" \
    -F "title=Test Upload" \
    -F "description=Testing file upload")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" = "500" ] || [ "$HTTP_STATUS" = "400" ]; then
    echo -e "${GREEN}✅ Correctly rejected non-image file${NC}"
else
    echo -e "${RED}❌ Should have rejected non-image file${NC}"
fi
echo -e "${BLUE}Response:${NC} $BODY"

echo ""
echo -e "${YELLOW}Test 2: Testing with valid endpoints${NC}"
echo "────────────────────────────────────────"

# Test 2: Get current media count
echo -e "${BLUE}Getting current media count...${NC}"
MEDIA_COUNT=$(curl -s http://localhost:3000/api/media | jq '.count' 2>/dev/null || echo "Could not parse")
echo -e "${GREEN}Current media items: $MEDIA_COUNT${NC}"

# Test 3: Test other endpoints
echo ""
echo -e "${BLUE}Testing successful endpoints...${NC}"

echo -e "${YELLOW}• GET /api/media${NC}"
curl -s http://localhost:3000/api/media | jq '.data[0] // "No data"' 2>/dev/null || echo "Response received"

echo ""
echo -e "${YELLOW}• GET /api/users${NC}"
curl -s http://localhost:3000/api/users | jq '.data[0] // "No data"' 2>/dev/null || echo "Response received"

echo ""
echo -e "${YELLOW}• GET /api/likes/popular${NC}"
curl -s http://localhost:3000/api/likes/popular | jq '.data[0] // "No data"' 2>/dev/null || echo "Response received"

echo ""
echo "════════════════════════════════════"
echo -e "${GREEN}✅ Upload functionality test completed${NC}"
echo -e "${BLUE}Note: To test with real images, use:${NC}"
echo -e "${YELLOW}curl -X POST http://localhost:3000/api/media \\${NC}"
echo -e "${YELLOW}  -F \"media=@image.jpg\" \\${NC}"
echo -e "${YELLOW}  -F \"title=My Photo\" \\${NC}"
echo -e "${YELLOW}  -F \"description=Test upload\"${NC}"

# Cleanup
rm -f "$TEST_IMAGE"
