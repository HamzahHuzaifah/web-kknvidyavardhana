import React, { useRef, useId, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import axios from 'axios';
import { convertHeicToJpgIfNeeded } from '../utils/heicHelper';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Tag, 
  Pilcrow, 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Undo, 
  Redo,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Eraser
} from 'lucide-react';

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Tuliskan uraian konten di sini...',
  minHeight = '240px',
  className = ''
}) {
  const quillRef = useRef(null);
  const rawId = useId().replace(/:/g, '');
  const toolbarId = `rich-toolbar-${rawId}`;

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: `#${toolbarId}`,
        handlers: {
          undo: function () {
            if (this.quill) {
              this.quill.history.undo();
            }
          },
          redo: function () {
            if (this.quill) {
              this.quill.history.redo();
            }
          },
          image: function () {
            const quillInstance = this.quill;
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*,image/heic,image/heif,image/heic-sequence,image/heif-sequence,.heic,.HEIC,.heif,.HEIF');
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              let processedFile = file;
              try {
                processedFile = await convertHeicToJpgIfNeeded(file);
              } catch (e) {
                console.warn('HEIC conversion skipped', e);
              }

              const formData = new FormData();
              formData.append('files', processedFile);
              formData.append('source', 'article_inline_image');

              try {
                const token = localStorage.getItem('token');
                const res = await axios.post('/api/files/upload', formData, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                  }
                });

                const uploadedUrl = res.data.files?.[0]?.file_url;
                if (uploadedUrl && quillInstance) {
                  const range = quillInstance.getSelection(true) || { index: quillInstance.getLength() };
                  quillInstance.insertEmbed(range.index, 'image', uploadedUrl);
                  quillInstance.setSelection(range.index + 1);
                }
              } catch (uploadErr) {
                console.warn('Image upload to server failed, using base64 fallback', uploadErr);
                const reader = new FileReader();
                reader.onload = () => {
                  if (quillInstance) {
                    const range = quillInstance.getSelection(true) || { index: quillInstance.getLength() };
                    quillInstance.insertEmbed(range.index, 'image', reader.result);
                    quillInstance.setSelection(range.index + 1);
                  }
                };
                reader.readAsDataURL(processedFile);
              }
            };
          }
        }
      },
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true
      }
    };
  }, [toolbarId]);

  return (
    <div className={`rich-editor-wrapper border-2 border-primary-dark bg-white shadow-sm ${className}`}>
      {/* CUSTOM TOOLBAR (Sesuai Referensi UI Editor: B, I, S, U, Color, ¶, H1, H2, H3, Align, List, Undo, Redo) */}
      <div 
        id={toolbarId} 
        className="custom-quill-toolbar flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 border-b-2 border-primary-dark"
      >
        {/* GROUP 1: INLINE FORMATTING */}
        <div className="flex items-center gap-1">
          <button type="button" className="ql-bold ql-btn" title="Tebal (Bold)">
            <span className="font-serif font-black text-sm">B</span>
          </button>
          <button type="button" className="ql-italic ql-btn" title="Miring (Italic)">
            <span className="font-serif italic font-bold text-sm">I</span>
          </button>
          <button type="button" className="ql-strike ql-btn" title="Coret (Strikethrough)">
            <span className="line-through font-bold text-xs">S</span>
          </button>
          <button type="button" className="ql-underline ql-btn" title="Garis Bawah (Underline)">
            <span className="underline font-bold text-xs">U</span>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-0.5" />

        {/* GROUP 2: COLORS / HIGHLIGHT */}
        <div className="flex items-center gap-1">
          <select className="ql-color ql-picker-btn" title="Warna Huruf" />
          <select className="ql-background ql-picker-btn" title="Warna Latar / Sorotan" />
        </div>

        <div className="h-6 w-px bg-gray-300 mx-0.5" />

        {/* GROUP 3: HEADINGS & PARAGRAPH */}
        <div className="flex items-center gap-1">
          <button type="button" className="ql-header ql-btn" value="" title="Paragraf Biasa">
            <span className="font-bold text-xs">¶</span>
          </button>
          <button type="button" className="ql-header ql-btn" value="1" title="Heading 1">
            <span className="font-bold text-xs">H1</span>
          </button>
          <button type="button" className="ql-header ql-btn" value="2" title="Heading 2">
            <span className="font-bold text-xs">H2</span>
          </button>
          <button type="button" className="ql-header ql-btn" value="3" title="Heading 3">
            <span className="font-bold text-xs">H3</span>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-0.5" />

        {/* GROUP 4: ALIGNMENT */}
        <div className="flex items-center gap-1">
          <button type="button" className="ql-align ql-btn" value="" title="Rata Kiri">
            <AlignLeft size={15} />
          </button>
          <button type="button" className="ql-align ql-btn" value="center" title="Rata Tengah">
            <AlignCenter size={15} />
          </button>
          <button type="button" className="ql-align ql-btn" value="right" title="Rata Kanan">
            <AlignRight size={15} />
          </button>
          <button type="button" className="ql-align ql-btn" value="justify" title="Rata Kanan-Kiri (Justify)">
            <AlignJustify size={15} />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-0.5" />

        {/* GROUP 5: LISTS & QUOTES */}
        <div className="flex items-center gap-1">
          <button type="button" className="ql-list ql-btn" value="bullet" title="Poin Bulat (Bullet List)">
            <List size={15} />
          </button>
          <button type="button" className="ql-list ql-btn" value="ordered" title="Daftar Nomor (Numbered List)">
            <ListOrdered size={15} />
          </button>
          <button type="button" className="ql-blockquote ql-btn" title="Kutipan (Blockquote)">
            <Quote size={15} />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-0.5" />

        {/* GROUP 6: MEDIA & LINKS */}
        <div className="flex items-center gap-1">
          <button type="button" className="ql-link ql-btn" title="Sisipkan Tautan (Link)">
            <LinkIcon size={14} />
          </button>
          <button type="button" className="ql-image ql-btn" title="Sisipkan Gambar">
            <ImageIcon size={14} />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-0.5" />

        {/* GROUP 7: UNDO & REDO (Sesuai Panah di Screenshot) */}
        <div className="flex items-center gap-1">
          <button type="button" className="ql-undo ql-btn" title="Urungkan (Undo)">
            <Undo size={15} />
          </button>
          <button type="button" className="ql-redo ql-btn" title="Ulangi (Redo)">
            <Redo size={15} />
          </button>
          <button type="button" className="ql-clean ql-btn" title="Hapus Format">
            <Eraser size={14} />
          </button>
        </div>
      </div>

      {/* QUILL EDITOR BODY */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        style={{ minHeight }}
      />
    </div>
  );
}
