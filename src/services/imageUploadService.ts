/**
 * Image Upload Service for Supabase Storage
 * Handles uploading images to Supabase Storage and returns public URLs
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

const BUCKET_NAME = 'offline-requests';

/**
 * Initialize storage bucket (creates if doesn't exist)
 */
export async function initializeBucket() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      // Create bucket with public access
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      }
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Optional folder path (e.g., 'products' or 'references')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(file: File, folder: string = 'general'): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns true if valid, error message if invalid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }
  
  return { valid: true };
}
