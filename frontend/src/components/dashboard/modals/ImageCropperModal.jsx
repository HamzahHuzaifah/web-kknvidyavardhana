import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Crop, Check } from 'lucide-react';

// Utility function to create an HTML Image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Utility function to get cropped image as Blob
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the cropped size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9); // high quality JPEG
  });
}

export default function ImageCropperModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  onCropDone,
  aspectRatio = 16 / 9 
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropDone(croppedBlob);
    } catch (e) {
      console.error(e);
      alert('Gagal memotong gambar.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-dark/80 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-4 border-primary-dark bg-yellow-400">
          <h3 className="font-black text-primary-dark text-lg uppercase flex items-center gap-2">
            <Crop size={20} /> Sesuaikan Gambar (Crop)
          </h3>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="text-primary-dark hover:bg-white p-1 rounded-sm transition-colors border-2 border-transparent hover:border-primary-dark disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 bg-gray-900 overflow-hidden w-full h-full">
          {imageUrl ? (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              objectFit="vertical-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              Tidak ada gambar yang dipilih
            </div>
          )}
        </div>

        {/* Footer & Controls */}
        <div className="p-4 border-t-4 border-primary-dark bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full flex items-center gap-4">
            <span className="font-bold text-sm text-primary-dark uppercase">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full max-w-xs h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary-dark"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-2 border-2 border-primary-dark font-black text-sm uppercase hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2 border-2 border-primary-dark bg-gradient-green text-white font-black text-sm uppercase hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? 'Memproses...' : <><Check size={16} /> Gunakan Gambar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
