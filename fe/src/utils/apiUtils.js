/**
 * Utility functions for API and static resource URLs
 */

/**
 * Get the backend base URL (without /api suffix)
 * @returns {string} Backend base URL
 */
export const getBackendBaseUrl = () => {
  // Check for environment variable first
  if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim() !== '') {
    const apiUrl = process.env.REACT_APP_API_URL;
    // Remove /api suffix if present
    return apiUrl.replace(/\/api$/, '');
  }
  
  // Check if we're in production
  const hostname = window?.location?.hostname;
  if (hostname && hostname !== 'localhost' && !hostname.startsWith('192.168') && !hostname.startsWith('10.')) {
    // Production deployment
    return 'https://stock-management-system-1-p6xu.onrender.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:8080';
};

/**
 * Get the full URL for a static resource (icons, images, etc.)
 * @param {string} resourcePath - The resource path (e.g., 'icons/filename.png')
 * @returns {string} Full URL to the resource
 */
export const getStaticResourceUrl = (resourcePath) => {
  if (!resourcePath) return '';
  
  const baseUrl = getBackendBaseUrl();
  const cleanPath = resourcePath.startsWith('/') ? resourcePath.slice(1) : resourcePath;
  
  return `${baseUrl}/${cleanPath}`;
};

/**
 * Get the full URL for a category icon
 * @param {string} iconPath - The icon path (can be Cloudinary URL or local filename)
 * @returns {string} Full URL to the icon
 */
export const getCategoryIconUrl = (iconPath) => {
  if (!iconPath || iconPath === 'null' || iconPath === 'undefined') {
    return '';
  }
  
  // If it's already a full URL (Cloudinary), return as is
  if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
    return iconPath;
  }
  
  // Legacy local path handling (for development or fallback)
  return getStaticResourceUrl(`icons/${iconPath}`);
};

/**
 * Get the full URL for a product image
 * @param {string} imagePath - The image path (can be Cloudinary URL or local filename)
 * @returns {string} Full URL to the image
 */
export const getProductImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
    return '';
  }
  
  // If it's already a full URL (Cloudinary), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Legacy local path handling (for development or fallback)
  return getStaticResourceUrl(`assets/prod/${imagePath}`);
};