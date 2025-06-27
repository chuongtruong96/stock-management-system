// Temporary utility to test category API calls
import { categoryApi } from "services/api";

export const testCategoryApi = async () => {
  console.log('🧪 Testing Category API...');
  
  try {
    // Test fetching all categories
    console.log('🧪 Testing categoryApi.all()...');
    const allCategories = await categoryApi.all();
    console.log('✅ categoryApi.all() result:', allCategories);
    console.log('✅ categoryApi.all() type:', typeof allCategories);
    console.log('✅ categoryApi.all() is array:', Array.isArray(allCategories));
    
    // Test creating a category
    console.log('🧪 Testing categoryApi.create()...');
    const testPayload = {
      nameVn: "Test Category VN",
      nameEn: "Test Category EN", 
      code: "TEST_" + Date.now()
    };
    
    const createResult = await categoryApi.create(testPayload);
    console.log('✅ categoryApi.create() result:', createResult);
    console.log('✅ categoryApi.create() type:', typeof createResult);
    console.log('✅ categoryApi.create() keys:', createResult ? Object.keys(createResult) : 'N/A');
    
    // Clean up - delete the test category
    if (createResult?.categoryId || createResult?.id) {
      const idToDelete = createResult.categoryId || createResult.id;
      console.log('🧪 Cleaning up test category:', idToDelete);
      await categoryApi.delete(idToDelete);
      console.log('✅ Test category deleted');
    }
    
  } catch (error) {
    console.error('❌ Category API test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
};

// Add to window for easy access from console
if (typeof window !== 'undefined') {
  window.testCategoryApi = testCategoryApi;
  console.log('🔧 Category API test function available as window.testCategoryApi()');
}

export default testCategoryApi;