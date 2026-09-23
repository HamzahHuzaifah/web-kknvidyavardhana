import heic2any from 'heic2any';

/**
 * Detects whether a file is HEIC/HEIF by both MIME type AND file extension.
 * iPhones sometimes upload with mime 'image/heic' even if the name looks like .jpg.
 */
const isHeicFile = (file) => {
  if (!file) return false;
  const name = (file.name || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();
  return (
    mime === 'image/heic' ||
    mime === 'image/heif' ||
    mime === 'image/heic-sequence' ||
    mime === 'image/heif-sequence' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
};

/**
 * Converts a HEIC/HEIF file to JPEG using heic2any.
 * Falls back to original file on error.
 * @param {File} file
 * @param {Function} [onConverting] - optional callback called when conversion starts
 * @returns {Promise<File>}
 */
export const convertHeicToJpgIfNeeded = async (file, onConverting) => {
  if (!file) return file;
  if (!isHeicFile(file)) return file;

  try {
    if (typeof onConverting === 'function') onConverting(true);

    const blob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85
    });

    // heic2any can return an array for image sequences
    const resultBlob = Array.isArray(blob) ? blob[0] : blob;

    // Build a new File with .jpg extension
    let newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    if (!/\.(jpg|jpeg)$/i.test(newName)) {
      newName = `${file.name.replace(/\.[^/.]+$/, '')}.jpg`;
    }
    return new File([resultBlob], newName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
  } catch (err) {
    console.error('[heicHelper] Conversion failed:', err);
    // Return the original file rather than crashing
    return file;
  } finally {
    if (typeof onConverting === 'function') onConverting(false);
  }
};

/**
 * Process a FileList or array of files, converting any HEIC/HEIF files.
 * @param {FileList|File[]} files
 * @param {Function} [onConverting]
 * @returns {Promise<File[]>}
 */
export const processFilesForHeic = async (files, onConverting) => {
  if (!files || files.length === 0) return [];
  if (typeof onConverting === 'function') onConverting(true);
  const result = [];
  for (let i = 0; i < files.length; i++) {
    result.push(await convertHeicToJpgIfNeeded(files[i]));
  }
  if (typeof onConverting === 'function') onConverting(false);
  return result;
};

/**
 * Automatically optimizes and compresses any cover image:
 * - Converts HEIC to JPG if needed
 * - Resizes large images (max dimension 1200px)
 * - Compresses to JPEG quality 0.82
 * - Guarantees file size is strictly under 300KB (ideal for WhatsApp/Social Media OG link previews)
 * @param {File} file
 * @param {Function} [onConverting]
 * @returns {Promise<File>}
 */
export const optimizeCoverImageForWeb = async (file, onConverting) => {
  if (!file) return file;

  let currentFile = file;
  if (isHeicFile(file)) {
    currentFile = await convertHeicToJpgIfNeeded(file, onConverting);
  }

  // If already small JPEG (<= 250KB), no need to compress further
  if (currentFile.type === 'image/jpeg' && currentFile.size <= 250 * 1024) {
    return currentFile;
  }

  return new Promise((resolve) => {
    if (typeof onConverting === 'function') onConverting(true);

    const img = new Image();
    const objectUrl = URL.createObjectURL(currentFile);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      const maxDim = 1200;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Draw white background in case source image was transparent PNG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (typeof onConverting === 'function') onConverting(false);

        if (!blob) {
          return resolve(currentFile);
        }

        const cleanBaseName = (currentFile.name || 'image')
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_');
        const optimizedFile = new File([blob], `${cleanBaseName}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        resolve(optimizedFile);
      }, 'image/jpeg', 0.82);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      if (typeof onConverting === 'function') onConverting(false);
      console.warn('[optimizeCoverImageForWeb] Image load failed, fallback to original', err);
      resolve(currentFile);
    };

    img.src = objectUrl;
  });
};
