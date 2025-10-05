const { BlobServiceClient } = require('@azure/storage-blob');

class AzureStorageService {
  constructor() {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    this.containerName = process.env.AZURE_CONTAINER_NAME || 'notes-files';
    this.initializeContainer();
  }

  async initializeContainer() {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      // Create container without public access (default is private)
      await containerClient.createIfNotExists();
      console.log(`Azure Storage container "${this.containerName}" is ready`);
    } catch (error) {
      console.error('Error initializing Azure Storage container:', error.message);
    }
  }

  async uploadFile(buffer, fileName, originalName, mimeType) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobName = `${Date.now()}-${fileName}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Set appropriate content type based on file type
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: mimeType || 'application/octet-stream',
          blobContentDisposition: `attachment; filename="${originalName}"`
        },
        metadata: {
          originalName: originalName,
          uploadDate: new Date().toISOString(),
          fileType: mimeType || 'unknown'
        }
      };

      await blockBlobClient.upload(buffer, buffer.length, uploadOptions);
      
      return {
        blobName: blobName,
        url: blockBlobClient.url,
        size: buffer.length
      };
    } catch (error) {
      console.error('Error uploading file to Azure Storage:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  async downloadFile(blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const downloadResponse = await blockBlobClient.download();
      return downloadResponse;
    } catch (error) {
      console.error('Error downloading file from Azure Storage:', error);
      throw new Error('Failed to download file from storage');
    }
  }

  async deleteFile(blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      await blockBlobClient.deleteIfExists();
      return true;
    } catch (error) {
      console.error('Error deleting file from Azure Storage:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  async getFileInfo(blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const properties = await blockBlobClient.getProperties();
      return {
        size: properties.contentLength,
        lastModified: properties.lastModified,
        contentType: properties.contentType,
        metadata: properties.metadata
      };
    } catch (error) {
      console.error('Error getting file info from Azure Storage:', error);
      throw new Error('Failed to get file information');
    }
  }
}

module.exports = new AzureStorageService();