package com.example.stationerymgntbe.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Upload image to Cloudinary
     * @param file MultipartFile to upload
     * @param folder Cloudinary folder (e.g., "stationery-mgmt/products")
     * @return Cloudinary secure URL
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
            ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image",
                "quality", "auto",
                "fetch_format", "auto"
            ));
        return uploadResult.get("secure_url").toString();
    }

    /**
     * Upload image with custom public ID
     * @param file MultipartFile to upload
     * @param folder Cloudinary folder
     * @param publicId Custom public ID for the image
     * @return Cloudinary secure URL
     */
    public String uploadImage(MultipartFile file, String folder, String publicId) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
            ObjectUtils.asMap(
                "folder", folder,
                "public_id", publicId,
                "resource_type", "image",
                "quality", "auto",
                "fetch_format", "auto",
                "overwrite", true
            ));
        return uploadResult.get("secure_url").toString();
    }

    /**
     * Delete image from Cloudinary
     * @param publicId Public ID of the image to delete
     * @return Deletion result
     */
    public Map deleteImage(String publicId) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    /**
     * Extract public ID from Cloudinary URL
     * @param cloudinaryUrl Full Cloudinary URL
     * @return Public ID
     */
    public String extractPublicId(String cloudinaryUrl) {
        if (cloudinaryUrl == null || !cloudinaryUrl.contains("cloudinary.com")) {
            return null;
        }
        
        // Extract public ID from URL like:
        // https://res.cloudinary.com/dha0szuzq/image/upload/v1234567890/stationery-mgmt/products/1.jpg
        String[] parts = cloudinaryUrl.split("/");
        if (parts.length >= 3) {
            // Get everything after the version number
            StringBuilder publicId = new StringBuilder();
            boolean foundVersion = false;
            for (String part : parts) {
                if (foundVersion) {
                    if (publicId.length() > 0) {
                        publicId.append("/");
                    }
                    publicId.append(part);
                } else if (part.startsWith("v") && part.length() > 1 && part.substring(1).matches("\\d+")) {
                    foundVersion = true;
                }
            }
            
            // Remove file extension
            String result = publicId.toString();
            int lastDot = result.lastIndexOf('.');
            if (lastDot > 0) {
                result = result.substring(0, lastDot);
            }
            return result;
        }
        
        return null;
    }
}