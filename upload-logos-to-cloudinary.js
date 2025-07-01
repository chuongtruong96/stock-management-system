// Script to upload logo images to Cloudinary
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary (replace with your credentials)
cloudinary.config({
  cloud_name: 'your-cloud-name',     // Replace with your Cloudinary cloud name
  api_key: 'your-api-key',           // Replace with your API key
  api_secret: 'your-api-secret'      // Replace with your API secret
});

async function uploadLogos() {
  try {
    console.log('🚀 Starting logo upload to Cloudinary...');
    
    const logoFiles = [
      {
        localPath: './fe/public/assets/images/logo-ct.png',
        cloudinaryPath: 'stationery/logos/logo-ct',
        description: 'Main logo for dark backgrounds'
      },
      {
        localPath: './fe/public/assets/images/logo-ct-dark.png',
        cloudinaryPath: 'stationery/logos/logo-ct-dark',
        description: 'Dark logo for light backgrounds'
      },
      {
        localPath: './fe/public/LOGO-PMH-02.png',
        cloudinaryPath: 'stationery/logos/logo-pmh-main',
        description: 'PMH main logo'
      }
    ];

    const uploadResults = [];

    for (const logo of logoFiles) {
      if (fs.existsSync(logo.localPath)) {
        try {
          console.log(`📤 Uploading ${logo.description}...`);
          
          const result = await cloudinary.uploader.upload(logo.localPath, {
            public_id: logo.cloudinaryPath,
            folder: 'stationery/logos',
            overwrite: true,
            resource_type: 'image',
            format: 'png', // Ensure PNG format for transparency
            quality: 'auto:best'
          });

          uploadResults.push({
            file: logo.localPath,
            url: result.secure_url,
            public_id: result.public_id,
            description: logo.description
          });

          console.log(`✅ Uploaded: ${logo.description}`);
          console.log(`   URL: ${result.secure_url}`);
          
        } catch (error) {
          console.error(`❌ Failed to upload ${logo.localPath}:`, error.message);
        }
      } else {
        console.warn(`⚠️  File not found: ${logo.localPath}`);
      }
    }

    // Generate updated App.js configuration
    console.log('\n📋 Update your App.js with these Cloudinary URLs:');
    console.log('=====================================');
    
    const logoCtUrl = uploadResults.find(r => r.public_id.includes('logo-ct') && !r.public_id.includes('dark'))?.url;
    const logoCtDarkUrl = uploadResults.find(r => r.public_id.includes('logo-ct-dark'))?.url;
    
    if (logoCtUrl && logoCtDarkUrl) {
      console.log(`
// Replace the brand prop in App.js with:
brand={
  (transparentSidenav && !darkMode) || whiteSidenav
    ? "${logoCtDarkUrl}"
    : "${logoCtUrl}"
}
      `);
    }

    // Save results to file
    fs.writeFileSync('cloudinary-logo-urls.json', JSON.stringify(uploadResults, null, 2));
    console.log('\n💾 Results saved to cloudinary-logo-urls.json');

    return uploadResults;

  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

// Run the upload
if (require.main === module) {
  uploadLogos()
    .then(() => {
      console.log('\n🎉 Logo upload completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Upload failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadLogos };