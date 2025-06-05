import { storageApi } from '../api/storage';
import { documentsApi } from '../api/documents';

/**
 * Test API connectivity and basic functionality
 */
export async function testApiConnectivity() {
  const results = {
    storage: { connected: false, error: null as string | null },
    documents: { connected: false, error: null as string | null }
  };

  // Test storage API
  try {
    await storageApi.testConnection();
    results.storage.connected = true;
    console.log('✅ Storage API connection successful');
  } catch (error) {
    results.storage.error = error instanceof Error ? error.message : 'Unknown error';
    console.log('❌ Storage API connection failed:', results.storage.error);
  }

  // Test documents API
  try {
    await documentsApi.getDocumentStats();
    results.documents.connected = true;
    console.log('✅ Documents API connection successful');
  } catch (error) {
    results.documents.error = error instanceof Error ? error.message : 'Unknown error';
    console.log('❌ Documents API connection failed:', results.documents.error);
  }

  return results;
}

/**
 * Test fetching files from storage
 */
export async function testFetchFiles() {
  try {
    console.log('📁 Testing file fetching...');
    const files = await storageApi.getFiles();
    console.log(`✅ Successfully fetched ${files.length} files`);
    
    if (files.length > 0) {
      console.log('First file:', {
        id: files[0].id,
        name: files[0].name,
        type: files[0].type,
        isFolder: files[0].isFolder
      });
    }
    
    return files;
  } catch (error) {
    console.log('❌ Failed to fetch files:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Test document operations
 */
export async function testDocumentOperations() {
  try {
    console.log('📚 Testing document operations...');
    const stats = await documentsApi.getDocumentStats();
    console.log('✅ Document stats:', stats);
    
    const documents = await documentsApi.getDocuments({ limit: 5 });
    console.log(`✅ Successfully fetched ${documents.documents.length} documents`);
    
    return { stats, documents };
  } catch (error) {
    console.log('❌ Failed to test document operations:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
} 