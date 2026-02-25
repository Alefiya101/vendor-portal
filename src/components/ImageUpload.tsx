import React, { useState, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import { uploadImage, validateImageFile } from '../services/imageUploadService';
import { toast } from 'sonner@2.0.3';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
  folder?: string;
  label?: string;
  className?: string;
  multiple?: boolean;
}

export function ImageUpload({ 
  onImageUploaded, 
  currentImage, 
  onRemove,
  folder = 'general',
  label = 'Upload Image',
  className = '',
  multiple = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // For now, handle single file
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadImage(file, folder);
      onImageUploaded(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      
      {currentImage ? (
        <div className="relative group">
          <img 
            src={currentImage} 
            alt="Preview" 
            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            multiple={multiple}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Drop image here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP or GIF (max 5MB)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MultiImageUploadProps {
  images: string[];
  onImageAdded: (url: string) => void;
  onImageRemoved: (index: number) => void;
  folder?: string;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({
  images,
  onImageAdded,
  onImageRemoved,
  folder = 'general',
  label = 'Product Images',
  maxImages = 5
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const file = files[0];
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadImage(file, folder);
      onImageAdded(url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative group aspect-square">
            <img 
              src={img} 
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => onImageRemoved(idx)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs text-gray-600">Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Upload className="w-4 h-4" />
              <span className="text-xs font-medium">Add Image ({images.length}/{maxImages})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
