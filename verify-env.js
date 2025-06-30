#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Environment Setup Verification\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
console.log('1. Checking .env file...');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  
  // Read and parse .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('   📄 .env file contents:');
  
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        console.log(`   ${key}=${value.length > 10 ? value.substring(0, 10) + '...' : value}`);
      }
    }
  });
} else {
  console.log('   ❌ .env file not found');
  console.log('   📝 Please create a .env file in the project root');
  return;
}

console.log('\n2. Loading environment variables...');
require('dotenv').config();

const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET'
];

let allPresent = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${value.length > 10 ? value.substring(0, 10) + '...' : value}`);
  } else {
    console.log(`   ❌ ${varName}: Missing`);
    allPresent = false;
  }
});

if (allPresent) {
  console.log('\n✅ All environment variables are set correctly!');
  console.log('🚀 You can now run: npm run test-cloudinary');
} else {
  console.log('\n❌ Some environment variables are missing.');
  console.log('📝 Please check your .env file.');
}