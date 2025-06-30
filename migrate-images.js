#!/usr/bin/env node

/**
 * Image Migration Script for Stationery Management System
 * 
 * This script uploads your local images to Cloudinary and generates
 * a mapping file for database updates.
 * 
 * Prerequisites:
 * 1. Sign up for Cloudinary: https://cloudinary.com/
 * 2. Get your credentials from Cloudinary dashboard
 * 3. Install dependencies: npm install cloudinary
 * 4. Set environment variables or update the config below
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dha0szuzq',
  api_key: process.env.CLOUDINARY_API_KEY || '849416719383161',
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Paths configuration
const PATHS = {
  productImages: './BE/uploads/product-img',
  categoryIcons: './BE/uploads/cat-icons',
  signedOrders: './BE/uploads/signed-orders'
};

// Cloudinary folders
const CLOUDINARY_FOLDERS = {
  products: 'stationery-mgmt/products',
  categories: 'stationery-mgmt/categories',
  orders: 'stationery-mgmt/orders'
};

/**
 * Upload a single file to Cloudinary
 */
async function uploadFile(filePath, cloudinaryFolder, publicId = null) {
  try {
    const options = {
      folder: cloudinaryFolder,
      resource_type: 'auto',
      overwrite: true
    };
    
    if (publicId) {
      options.public_id = publicId;
    }
    
    const result = await cloudinary.uploader.upload(filePath, options);
    return {
      success: true,
      originalPath: filePath,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    return {
      success: false,
      originalPath: filePath,
      error: error.message
    };
  }
}

/**
 * Upload all files in a directory
 */
async function uploadDirectory(dirPath, cloudinaryFolder, description = '') {
  console.log(`\n📁 Processing ${description}...`);
  
  if (!fs.existsSync(dirPath)) {
    console.log(`❌ Directory not found: ${dirPath}`);
    return [];
  }
  
  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(file)
  );
  
  if (imageFiles.length === 0) {
    console.log(`ℹ️  No image files found in ${dirPath}`);
    return [];
  }
  
  console.log(`📤 Uploading ${imageFiles.length} files...`);
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of imageFiles) {
    const filePath = path.join(dirPath, file);
    const publicId = path.parse(file).name; // Use filename without extension as public ID
    
    process.stdout.write(`   Uploading ${file}... `);
    
    const result = await uploadFile(filePath, cloudinaryFolder, publicId);
    results.push(result);
    
    if (result.success) {
      console.log('✅');
      successCount++;
    } else {
      console.log(`❌ ${result.error}`);
      errorCount++;
    }
  }
  
  console.log(`✨ ${description} completed: ${successCount} success, ${errorCount} errors`);
  return results;
}

/**
 * Generate URL mapping for database updates
 */
function generateUrlMapping(allResults) {
  const mapping = {
    products: {},
    categories: {},
    orders: {},
    summary: {
      totalFiles: 0,
      successfulUploads: 0,
      failedUploads: 0
    }
  };
  
  allResults.forEach(categoryResults => {
    categoryResults.forEach(result => {
      mapping.summary.totalFiles++;
      
      if (result.success) {
        mapping.summary.successfulUploads++;
        
        const originalPath = result.originalPath.replace(/\\/g, '/');
        const relativePath = originalPath.replace('./BE', '');
        
        // Determine category
        if (originalPath.includes('product-img')) {
          mapping.products[relativePath] = result.cloudinaryUrl;
        } else if (originalPath.includes('cat-icons')) {
          mapping.categories[relativePath] = result.cloudinaryUrl;
        } else if (originalPath.includes('signed-orders')) {
          mapping.orders[relativePath] = result.cloudinaryUrl;
        }
      } else {
        mapping.summary.failedUploads++;
      }
    });
  });
  
  return mapping;
}

/**
 * Generate SQL update statements
 */
function generateSqlUpdates(mapping) {
  const sqlStatements = [];
  
  // Product images
  Object.entries(mapping.products).forEach(([oldPath, newUrl]) => {
    sqlStatements.push(
      `UPDATE products SET image_url = '${newUrl}' WHERE image_url = '${oldPath}';`
    );
  });
  
  // Category icons
  Object.entries(mapping.categories).forEach(([oldPath, newUrl]) => {
    sqlStatements.push(
      `UPDATE categories SET icon_url = '${newUrl}' WHERE icon_url = '${oldPath}';`
    );
  });
  
  return sqlStatements;
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting Image Migration to Cloudinary...\n');
  
  // Verify Cloudinary configuration
  try {
    await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful');
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    console.log('\n📝 Please check your Cloudinary configuration:');
    console.log('   1. Sign up at https://cloudinary.com/');
    console.log('   2. Get your credentials from the dashboard');
    console.log('   3. Set environment variables:');
    console.log('      CLOUDINARY_CLOUD_NAME=your-cloud-name');
    console.log('      CLOUDINARY_API_KEY=your-api-key');
    console.log('      CLOUDINARY_API_SECRET=your-api-secret');
    console.log('   4. Or update the config in this script directly');
    return;
  }
  
  const startTime = Date.now();
  
  try {
    // Upload all directories
    const allResults = await Promise.all([
      uploadDirectory(PATHS.productImages, CLOUDINARY_FOLDERS.products, 'Product Images'),
      uploadDirectory(PATHS.categoryIcons, CLOUDINARY_FOLDERS.categories, 'Category Icons'),
      uploadDirectory(PATHS.signedOrders, CLOUDINARY_FOLDERS.orders, 'Signed Orders')
    ]);
    
    // Generate mapping and SQL updates
    const mapping = generateUrlMapping(allResults);
    const sqlUpdates = generateSqlUpdates(mapping);
    
    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const mappingFile = `image-migration-mapping-${timestamp}.json`;
    const sqlFile = `image-migration-updates-${timestamp}.sql`;
    
    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    fs.writeFileSync(sqlFile, sqlUpdates.join('\n'));
    
    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Migration Completed!');
    console.log('═'.repeat(50));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📊 Total files: ${mapping.summary.totalFiles}`);
    console.log(`✅ Successful uploads: ${mapping.summary.successfulUploads}`);
    console.log(`❌ Failed uploads: ${mapping.summary.failedUploads}`);
    console.log(`📄 Mapping saved to: ${mappingFile}`);
    console.log(`🗃️  SQL updates saved to: ${sqlFile}`);
    
    if (mapping.summary.successfulUploads > 0) {
      console.log('\n📋 Next Steps:');
      console.log('1. Review the generated SQL file');
      console.log('2. Run the SQL updates on your database');
      console.log('3. Update your backend to use Cloudinary for new uploads');
      console.log('4. Deploy your application');
      
      console.log('\n🔗 Sample URLs:');
      const sampleUrls = Object.values(mapping.products).slice(0, 3);
      sampleUrls.forEach(url => console.log(`   ${url}`));
    }
    
    if (mapping.summary.failedUploads > 0) {
      console.log('\n⚠️  Some uploads failed. Check the error messages above.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  }
}

// Handle command line execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadFile, uploadDirectory, generateUrlMapping };