#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

const { v2: cloudinary } = require('cloudinary');

// Debug: Show what environment variables are loaded
console.log('🔍 Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test connection
async function testConnection() {
  try {
    console.log('\n🔌 Testing Cloudinary connection...');
    await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('🎉 You can now run the migration: npm run migrate');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file exists in the project root');
    console.log('2. Make sure you have the correct API secret from Cloudinary dashboard');
    console.log('3. Verify there are no extra spaces in your .env file');
  }
}

testConnection();