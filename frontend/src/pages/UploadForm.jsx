import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      await axios.post('http://localhost:5000/api/articles', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setStatus({ type: 'success', message: 'Artikel berhasil dipublikasikan!' });
      setFormData({ title: '', content: '', image: null });
      setPreview(null);
      // Reset file input
      document.getElementById('image-upload').value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Terjadi kesalahan saat mengunggah artikel.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 border-b-4 border-primary pb-4">
          <h1 className="text-4xl font-bold text-primary uppercase flex items-center gap-3">
            <Upload className="text-secondary" size={36} /> Upload Berita
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Publikasikan kegiatan dan program kerja KKN Vidya Vardhana</p>
        </div>

        {status.message && (
          <div className={`mb-6 p-4 border-2 shadow-hard flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 border-accent text-accent' : 'bg-red-50 border-red-600 text-red-600'}`}>
            {status.type === 'success' ? <CheckCircle className="shrink-0 mt-0.5" /> : <AlertCircle className="shrink-0 mt-0.5" />}
            <span className="font-bold">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border-2 border-primary shadow-hard p-6 md:p-8">
          
          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-primary font-bold mb-2 uppercase text-sm tracking-wide flex items-center gap-2">
              <FileText size={16} /> Judul Artikel
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full border-2 border-primary px-4 py-3 focus:outline-none focus:ring-0 focus:border-secondary transition-colors font-medium"
              placeholder="Masukkan judul berita atau kegiatan..."
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-primary font-bold mb-2 uppercase text-sm tracking-wide flex items-center gap-2">
              <ImageIcon size={16} /> Foto / Gambar
            </label>
            <div className="border-2 border-dashed border-primary bg-gray-50 p-6 flex flex-col items-center justify-center relative hover:bg-gray-100 transition-colors cursor-pointer group">
              <input
                type="file"
                id="image-upload"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                <div className="w-full relative z-0">
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto object-contain border-2 border-primary" />
                  <div className="text-center mt-2 text-sm font-bold text-secondary">Klik untuk mengganti gambar</div>
                </div>
              ) : (
                <div className="text-center relative z-0">
                  <div className="bg-primary text-white p-3 inline-flex rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <p className="text-primary font-bold">Tarik & Lepas file di sini</p>
                  <p className="text-gray-500 text-sm mt-1">atau klik untuk menelusuri (JPG, PNG)</p>
                </div>
              )}
            </div>
          </div>

          {/* Content Input */}
          <div className="mb-8">
            <label htmlFor="content" className="block text-primary font-bold mb-2 uppercase text-sm tracking-wide flex items-center gap-2">
              <FileText size={16} /> Isi Artikel
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows="8"
              className="w-full border-2 border-primary px-4 py-3 focus:outline-none focus:ring-0 focus:border-secondary transition-colors font-medium resize-y"
              placeholder="Tuliskan detail kegiatan secara lengkap..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-bold text-lg uppercase tracking-wider py-4 border-2 border-primary shadow-[4px_4px_0px_0px_rgba(234,179,8,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Upload size={20} /> Publikasikan Artikel
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
