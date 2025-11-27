#!/usr/bin/env node

/**
 * API Testing Script for Week 4 Assignment
 * Demonstrates all implemented endpoints with proper HTTP methods
 * 
 * Usage: node test-api.js
 * Note: Make sure the demo-app.js server is running first
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(title) {
  console.log(`\n${colors.bold}${colors.cyan}🧪 Testing: ${title}${colors.reset}`);
  console.log('─'.repeat(50));
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers,
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500 
    };
  }
}

async function runTests() {
  log(`${colors.bold}${colors.yellow}🚀 Starting API Tests for Week 4 Assignment${colors.reset}\n`);
  
  let testResults = [];

  // Test 1: Get all media
  logTest('GET /api/media - List all media items');
  let result = await testEndpoint('GET', '/media');
  if (result.success) {
    logSuccess(`Found ${result.data.count} media items`);
    logInfo(JSON.stringify(result.data.data[0], null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'GET /media', passed: result.success });

  await sleep(500);

  // Test 2: Get specific media item
  logTest('GET /api/media/:id - Get media item by ID');
  result = await testEndpoint('GET', '/media/1');
  if (result.success) {
    logSuccess(`Retrieved media: ${result.data.data.title}`);
    logInfo(JSON.stringify(result.data.data, null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'GET /media/1', passed: result.success });

  await sleep(500);

  // Test 3: Get all users
  logTest('GET /api/users - List all users');
  result = await testEndpoint('GET', '/users');
  if (result.success) {
    logSuccess(`Found ${result.data.count} users`);
    logInfo(JSON.stringify(result.data.data[0], null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'GET /users', passed: result.success });

  await sleep(500);

  // Test 4: Create new user
  logTest('POST /api/users - Create new user');
  const newUser = {
    username: 'testuser_' + Date.now(),
    email: `test${Date.now()}@example.com`,
    first_name: 'Test',
    last_name: 'User',
    bio: 'Created by API test script'
  };
  result = await testEndpoint('POST', '/users', newUser, {
    'Content-Type': 'application/json'
  });
  if (result.success) {
    logSuccess(`Created user: ${result.data.data.username}`);
    logInfo(JSON.stringify(result.data.data, null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'POST /users', passed: result.success });

  await sleep(500);

  // Test 5: Update user
  logTest('PUT /api/users/:id - Update user');
  const updateData = {
    bio: 'Updated biography by test script'
  };
  result = await testEndpoint('PUT', '/users/1', updateData, {
    'Content-Type': 'application/json'
  });
  if (result.success) {
    logSuccess(`Updated user successfully`);
    logInfo(JSON.stringify(result.data.data, null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'PUT /users/1', passed: result.success });

  await sleep(500);

  // Test 6: Get likes for media
  logTest('GET /api/likes/media/:id - Get likes for media item');
  result = await testEndpoint('GET', '/likes/media/1');
  if (result.success) {
    logSuccess(`Media has ${result.data.data.like_count} likes`);
    logInfo(JSON.stringify(result.data.data, null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'GET /likes/media/1', passed: result.success });

  await sleep(500);

  // Test 7: Like media
  logTest('POST /api/likes - Like media');
  const likeData = {
    user_id: 1,
    media_id: 2
  };
  result = await testEndpoint('POST', '/likes', likeData, {
    'Content-Type': 'application/json'
  });
  if (result.success) {
    logSuccess(`Action: ${result.data.action}`);
    logInfo(JSON.stringify(result.data, null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'POST /likes', passed: result.success });

  await sleep(500);

  // Test 8: Get popular media
  logTest('GET /api/likes/popular - Get most liked media');
  result = await testEndpoint('GET', '/likes/popular');
  if (result.success) {
    logSuccess(`Found popular media`);
    logInfo(JSON.stringify(result.data.data[0], null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'GET /likes/popular', passed: result.success });

  await sleep(500);

  // Test 9: Get user's likes
  logTest('GET /api/likes/user/:id - Get user\'s liked media');
  result = await testEndpoint('GET', '/likes/user/1');
  if (result.success) {
    logSuccess(`User has liked ${result.data.data.like_count} items`);
    logInfo(JSON.stringify(result.data.data, null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'GET /likes/user/1', passed: result.success });

  await sleep(500);

  // Test 10: Update media
  logTest('PUT /api/media/:id - Update media');
  const mediaUpdate = {
    title: 'Updated Title',
    description: 'Updated by test script'
  };
  result = await testEndpoint('PUT', '/media/1', mediaUpdate, {
    'Content-Type': 'application/json'
  });
  if (result.success) {
    logSuccess(`Updated media successfully`);
    logInfo(JSON.stringify(result.data.data, null, 2));
  } else {
    logError(`Failed: ${result.error}`);
  }
  testResults.push({ test: 'PUT /media/1', passed: result.success });

  await sleep(500);

  // Test Summary
  console.log(`\n${colors.bold}${colors.cyan}📊 Test Results Summary${colors.reset}`);
  console.log('═'.repeat(50));
  
  const passedTests = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;
  
  testResults.forEach(test => {
    if (test.passed) {
      logSuccess(`${test.test}`);
    } else {
      logError(`${test.test}`);
    }
  });

  console.log(`\n${colors.bold}Results: ${passedTests}/${totalTests} tests passed${colors.reset}`);
  
  if (passedTests === totalTests) {
    log(`\n🎉 All tests passed! Your API is working correctly.`, colors.green);
  } else {
    log(`\n⚠️  Some tests failed. Check server logs for details.`, colors.yellow);
  }

  console.log(`\n${colors.bold}${colors.blue}💡 Additional Tests You Can Try:${colors.reset}`);
  console.log('• File upload: Use curl or Postman to test POST /api/media with multipart/form-data');
  console.log('• Error handling: Try invalid IDs or missing required fields');
  console.log('• Edge cases: Empty requests, special characters, etc.');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:3000');
    return true;
  } catch {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    logError('Server is not running on http://localhost:3000');
    logInfo('Please start the server first:');
    logInfo('  cd week-4 && node demo-app.js');
    process.exit(1);
  }

  await runTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, testEndpoint };
