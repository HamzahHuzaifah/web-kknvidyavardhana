import heic2any from 'heic2any';

/**
 * Checks if a file is a HEIC/HEIF image and converts it to a JPEG File object.
 * If the file is not HEIC, it returns the original file untouched.
 * 
 * @param {File} file - The file to check and potentially convert.
 * @returns {Promise<File>} - A promise that resolves to the JPEG File or original File.
 */
export const convertHeicToJpgIfNeeded = async (file) => {
  if (!file) return file;
  
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
    try {
      // Convert HEIC to JPEG
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });

      // heic2any can return an array of blobs if it's an image sequence, 
      // but we typically just want the first one for a standard image.
      const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
      
      // Create a new File object with the .jpg extension
      const newName = file.name.replace(/\.heic|\.heif/i, '.jpg');
      return new File([blob], newName, {
        type: 'image/jpeg',
        lastModified: new Date().getTime()
      });
    } catch (error) {
      console.error('Failed to convert HEIC to JPG:', error);
      // Fallback to original file if conversion fails
      return file;
    }
  }
  
  return file;
};

/**
 * Helper to process an array or FileList of files and convert HEIC ones.
 * @param {FileList|File[]} files - The files to process.
 * @returns {Promise<File[]>} - Promise resolving to an array of processed files.
 */
export const processFilesForHeic = async (files) => {
  if (!files || files.length === 0) return [];
  const processedFiles = [];
  for (let i = 0; i < files.length; i++) {
    const processed = await convertHeicToJpgIfNeeded(files[i]);
    processedFiles.push(processed);
  }
  return processedFiles;
};
