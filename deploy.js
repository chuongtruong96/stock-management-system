// Comprehensive deployment script for Netlify and Render
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment process...');

// Configuration
const config = {
  frontend: {
    buildDir: './fe',
    distDir: './fe/build',
    netlifyDir: './fe/netlify'
  },
  backend: {
    buildDir: './BE',
    jarFile: './BE/target/stationery-mgnt-be-0.0.1-SNAPSHOT.jar'
  }
};

// Utility functions
function runCommand(command, cwd = process.cwd()) {
  console.log(`📝 Running: ${command}`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log('✅ Command completed successfully');
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    throw error;
  }
}

function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${filePath}`);
  }
  console.log(`✅ Found: ${filePath}`);
}

// Deployment steps
async function deployFrontend() {
  console.log('\n🎨 FRONTEND DEPLOYMENT');
  console.log('======================');
  
  try {
    // Check if frontend directory exists
    checkFileExists(config.frontend.buildDir);
    
    // Navigate to frontend directory
    process.chdir(config.frontend.buildDir);
    
    // Install dependencies
    console.log('📦 Installing frontend dependencies...');
    runCommand('npm install');
    
    // Build the project
    console.log('🔨 Building frontend...');
    runCommand('npm run build');
    
    // Check if build was successful
    checkFileExists('./build');
    
    // Create Netlify configuration
    const netlifyConfig = {
      build: {
        publish: "build",
        command: "npm run build"
      },
      redirects: [
        {
          from: "/api/*",
          to: "https://your-render-backend-url.onrender.com/api/:splat",
          status: 200,
          force: true
        },
        {
          from: "/*",
          to: "/index.html",
          status: 200
        }
      ],
      headers: [
        {
          for: "/static/*",
          values: {
            "Cache-Control": "public, max-age=31536000, immutable"
          }
        }
      ]
    };
    
    fs.writeFileSync('./build/netlify.toml', `
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://your-render-backend-url.onrender.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    `);
    
    console.log('✅ Frontend build completed');
    console.log('📁 Build files are in: ./build/');
    
    // Go back to root directory
    process.chdir('..');
    
  } catch (error) {
    console.error('❌ Frontend deployment failed:', error.message);
    throw error;
  }
}

async function deployBackend() {
  console.log('\n⚙️  BACKEND DEPLOYMENT');
  console.log('======================');
  
  try {
    // Check if backend directory exists
    checkFileExists(config.backend.buildDir);
    
    // Navigate to backend directory
    process.chdir(config.backend.buildDir);
    
    // Clean and build with Maven
    console.log('🧹 Cleaning previous builds...');
    runCommand('mvn clean');
    
    console.log('🔨 Building backend with Maven...');
    runCommand('mvn package -DskipTests');
    
    // Check if JAR was created
    checkFileExists('./target/stationery-mgnt-be-0.0.1-SNAPSHOT.jar');
    
    console.log('✅ Backend build completed');
    console.log('��� JAR file: ./target/stationery-mgnt-be-0.0.1-SNAPSHOT.jar');
    
    // Go back to root directory
    process.chdir('..');
    
  } catch (error) {
    console.error('❌ Backend deployment failed:', error.message);
    throw error;
  }
}

async function createDeploymentGuide() {
  console.log('\n📚 CREATING DEPLOYMENT GUIDE');
  console.log('=============================');
  
  const guide = `
# 🚀 Deployment Guide

## Frontend (Netlify)

### Option 1: Drag & Drop
1. Go to https://app.netlify.com/
2. Drag the \`fe/build\` folder to the deploy area
3. Your site will be deployed instantly!

### Option 2: Git Integration
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Set build settings:
   - Build command: \`npm run build\`
   - Publish directory: \`build\`
   - Base directory: \`fe\`

### Environment Variables (Netlify)
Add these in Site Settings > Environment Variables:
\`\`\`
REACT_APP_API_BASE_URL=https://your-render-backend-url.onrender.com
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
\`\`\`

## Backend (Render)

### Deploy Steps:
1. Go to https://render.com/
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Environment: Java
   - Build Command: \`cd BE && mvn clean package -DskipTests\`
   - Start Command: \`java -jar BE/target/stationery-mgnt-be-0.0.1-SNAPSHOT.jar\`
   - Port: 8080

### Environment Variables (Render)
Add these in Environment tab:
\`\`\`
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=your-database-url
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
JWT_SECRET=your-jwt-secret-key
CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
\`\`\`

## Database Setup

### Option 1: Render PostgreSQL
1. Create PostgreSQL database on Render
2. Copy the connection string
3. Add to backend environment variables

### Option 2: Railway/Supabase
1. Create database on Railway or Supabase
2. Get connection string
3. Update backend configuration

## Post-Deployment Checklist

### ✅ Frontend (Netlify)
- [ ] Site builds successfully
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Redirects working for SPA

### ✅ Backend (Render)
- [ ] Service starts successfully
- [ ] Database connected
- [ ] Environment variables set
- [ ] Health check endpoint working
- [ ] CORS configured for frontend domain

### ✅ Integration
- [ ] Frontend can connect to backend
- [ ] Authentication working
- [ ] File uploads working (Cloudinary)
- [ ] All API endpoints responding

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version and dependencies
2. **API not connecting**: Verify CORS and environment variables
3. **Images not loading**: Check Cloudinary configuration
4. **Database errors**: Verify connection string and credentials

### Logs:
- Netlify: Site Settings > Functions > View logs
- Render: Service Dashboard > Logs tab

## URLs After Deployment:
- Frontend: https://your-app-name.netlify.app
- Backend: https://your-service-name.onrender.com
- Database: Check your database provider dashboard
`;

  fs.writeFileSync('./DEPLOYMENT_GUIDE.md', guide);
  console.log('✅ Deployment guide created: DEPLOYMENT_GUIDE.md');
}

// Main deployment function
async function main() {
  try {
    console.log('🎯 PMH Stationery Management System Deployment');
    console.log('===============================================\n');
    
    // Save current directory
    const originalDir = process.cwd();
    
    // Deploy frontend
    await deployFrontend();
    
    // Return to original directory
    process.chdir(originalDir);
    
    // Deploy backend
    await deployBackend();
    
    // Return to original directory
    process.chdir(originalDir);
    
    // Create deployment guide
    await createDeploymentGuide();
    
    console.log('\n🎉 DEPLOYMENT PREPARATION COMPLETED!');
    console.log('====================================');
    console.log('✅ Frontend built successfully');
    console.log('✅ Backend built successfully');
    console.log('✅ Deployment guide created');
    console.log('\nNext steps:');
    console.log('1. Upload logos to Cloudinary (run: node upload-logos-to-cloudinary.js)');
    console.log('2. Deploy frontend to Netlify (drag fe/build folder)');
    console.log('3. Deploy backend to Render (connect GitHub repo)');
    console.log('4. Configure environment variables');
    console.log('5. Test the deployed application');
    
  } catch (error) {
    console.error('\n💥 Deployment preparation failed:', error.message);
    process.exit(1);
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { deployFrontend, deployBackend, createDeploymentGuide };