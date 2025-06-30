# Image Upload Deployment Guide

## Problem
The current system stores uploaded images in the local `BE/uploads` directory, which causes issues when deploying to cloud platforms like Render and Netlify because:

1. **Render**: Local file storage is ephemeral and gets wiped on each deployment
2. **Netlify**: Frontend can't access backend's local files
3. **Scalability**: Local storage doesn't work with multiple server instances

## Solutions

### Option 1: Cloud Storage (Recommended)

#### A. Using Cloudinary (Free tier available)

1. **Sign up for Cloudinary**: https://cloudinary.com/
2. **Get your credentials**: Cloud name, API key, API secret

3. **Backend Changes**:

```bash
# Add to BE/pom.xml
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http44</artifactId>
    <version>1.34.0</version>
</dependency>
```

```java
// Add to application.properties
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret
```

```java
// Create CloudinaryConfig.java
@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.cloud-name}")
    private String cloudName;
    
    @Value("${cloudinary.api-key}")
    private String apiKey;
    
    @Value("${cloudinary.api-secret}")
    private String apiSecret;
    
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));
    }
}
```

```java
// Update FileUploadService.java
@Service
public class FileUploadService {
    @Autowired
    private Cloudinary cloudinary;
    
    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image"
                ));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed", e);
        }
    }
}
```

#### B. Using AWS S3

1. **Create AWS S3 bucket**
2. **Add AWS SDK dependency**:

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.26</version>
</dependency>
```

3. **Configure S3 service**:

```java
@Service
public class S3Service {
    private final S3Client s3Client;
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    public String uploadFile(MultipartFile file, String keyName) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(keyName)
                .contentType(file.getContentType())
                .build();
                
            s3Client.putObject(putObjectRequest, 
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                
            return String.format("https://%s.s3.amazonaws.com/%s", bucketName, keyName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }
}
```

### Option 2: Database Storage (Not recommended for production)

Store images as BLOB in database:

```java
@Entity
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Lob
    private byte[] imageData;
    
    private String contentType;
    private String filename;
    
    // getters and setters
}
```

### Option 3: Render Persistent Disk (Limited)

Render offers persistent disks, but they're expensive and not recommended for file storage.

## Migration Steps

### Step 1: Backup Current Images

```bash
# Create a backup of current images
cp -r BE/uploads ./image-backup
```

### Step 2: Implement Cloud Storage

Choose one of the cloud storage options above and implement it.

### Step 3: Migrate Existing Images

Create a migration script to upload existing images to cloud storage:

```java
@Component
public class ImageMigrationService {
    
    @Autowired
    private CloudinaryService cloudinaryService; // or S3Service
    
    @Autowired
    private ProductRepository productRepository;
    
    public void migrateImages() {
        // Get all products with local image paths
        List<Product> products = productRepository.findAll();
        
        for (Product product : products) {
            if (product.getImageUrl() != null && product.getImageUrl().startsWith("/uploads/")) {
                try {
                    // Read local file
                    String localPath = "uploads" + product.getImageUrl().substring(8);
                    File localFile = new File(localPath);
                    
                    if (localFile.exists()) {
                        // Upload to cloud
                        String cloudUrl = cloudinaryService.uploadImage(localFile, "products");
                        
                        // Update database
                        product.setImageUrl(cloudUrl);
                        productRepository.save(product);
                        
                        System.out.println("Migrated: " + localPath + " -> " + cloudUrl);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to migrate image for product: " + product.getId());
                }
            }
        }
    }
}
```

### Step 4: Update Frontend

Update the frontend to handle cloud URLs:

```javascript
// utils/apiUtils.js
export const getProductImageUrl = (imagePath) => {
  if (!imagePath) return '/default-product.jpg';
  
  // If it's already a full URL (cloud storage), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Legacy local path handling (for development)
  if (imagePath.startsWith('/uploads/')) {
    return `${process.env.REACT_APP_API_BASE_URL}${imagePath}`;
  }
  
  return imagePath;
};
```

## Environment Variables

### For Render (Backend)

Add these environment variables in Render dashboard:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### For Netlify (Frontend)

Add these in Netlify dashboard:

```
REACT_APP_API_BASE_URL=https://your-render-backend-url.onrender.com
```

## Quick Migration Script

Here's a Node.js script to quickly upload your existing images to Cloudinary:

```javascript
// migrate-images.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'your-cloud-name',
  api_key: 'your-api-key',
  api_secret: 'your-api-secret'
});

async function uploadDirectory(dirPath, cloudinaryFolder) {
  const files = fs.readdirSync(dirPath);
  const uploadPromises = [];
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
      const uploadPromise = cloudinary.uploader.upload(filePath, {
        folder: cloudinaryFolder,
        public_id: path.parse(file).name,
        overwrite: true
      }).then(result => {
        console.log(`Uploaded: ${file} -> ${result.secure_url}`);
        return { file, url: result.secure_url };
      }).catch(error => {
        console.error(`Failed to upload ${file}:`, error);
        return { file, error };
      });
      
      uploadPromises.push(uploadPromise);
    }
  }
  
  return Promise.all(uploadPromises);
}

async function main() {
  try {
    console.log('Starting image migration...');
    
    // Upload product images
    const productResults = await uploadDirectory(
      './BE/uploads/product-img', 
      'stationery/products'
    );
    
    // Upload category icons
    const categoryResults = await uploadDirectory(
      './BE/uploads/cat-icons', 
      'stationery/categories'
    );
    
    console.log('Migration completed!');
    console.log('Product images:', productResults.length);
    console.log('Category icons:', categoryResults.length);
    
    // Generate URL mapping for database update
    const urlMapping = {};
    productResults.forEach(result => {
      if (result.url) {
        urlMapping[`/uploads/product-img/${result.file}`] = result.url;
      }
    });
    
    categoryResults.forEach(result => {
      if (result.url) {
        urlMapping[`/uploads/cat-icons/${result.file}`] = result.url;
      }
    });
    
    fs.writeFileSync('url-mapping.json', JSON.stringify(urlMapping, null, 2));
    console.log('URL mapping saved to url-mapping.json');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
```

Run the migration:

```bash
npm install cloudinary
node migrate-images.js
```

## Recommended Approach

1. **Use Cloudinary** (free tier: 25GB storage, 25GB bandwidth/month)
2. **Run the migration script** to upload existing images
3. **Update your backend** to use Cloudinary for new uploads
4. **Update database** with new cloud URLs
5. **Deploy to Render and Netlify**

This approach ensures your images are:
- ✅ Persistent across deployments
- ✅ Globally accessible via CDN
- ✅ Automatically optimized
- ✅ Scalable for production use

Would you like me to help you implement any of these solutions?