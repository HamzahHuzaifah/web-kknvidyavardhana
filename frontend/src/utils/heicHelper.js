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
