import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  id: string;
  messageId?: string;
  type: 'image' | 'voice' | 'document';
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  duration?: number; // For voice messages
  uploadedBy: string;
  uploadedAt: Date;
}

@Injectable()
export class AttachmentService {
  private files: Map<string, UploadedFile> = new Map();
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  /**
   * Get signed URL for upload
   */
  async getUploadUrl(data: {
    fileType: 'image' | 'voice' | 'document';
    fileName: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
  }): Promise<{ uploadUrl: string; fileId: string; fields: any }> {
    if (data.size > this.maxFileSize) {
      throw new Error('File too large');
    }

    const fileId = uuidv4();
    const key = `messages/${data.uploadedBy}/${fileId}`;

    // Would integrate with S3/CloudFront
    const uploadUrl = `https://lastmile-bucket.s3.amazonaws.com/${key}`;

    return {
      uploadUrl,
      fileId,
      fields: {
        key,
        'Content-Type': data.mimeType,
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
      },
    };
  }

  /**
   * Record uploaded file
   */
  async recordUpload(data: {
    fileId: string;
    messageId?: string;
    type: 'image' | 'voice' | 'document';
    originalName: string;
    url: string;
    thumbnailUrl?: string;
    size: number;
    mimeType: string;
    duration?: number;
    uploadedBy: string;
  }): Promise<UploadedFile> {
    const file: UploadedFile = {
      id: data.fileId,
      messageId: data.messageId,
      type: data.type,
      originalName: data.originalName,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      size: data.size,
      mimeType: data.mimeType,
      duration: data.duration,
      uploadedBy: data.uploadedBy,
      uploadedAt: new Date(),
    };

    this.files.set(file.id, file);
    return file;
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<UploadedFile | null> {
    return this.files.get(fileId) || null;
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const file = this.files.get(fileId);
    
    if (!file || file.uploadedBy !== userId) {
      return false;
    }

    this.files.delete(fileId);
    // Would delete from S3
    return true;
  }

  /**
   * Generate thumbnail for image
   */
  async generateThumbnail(imageUrl: string): Promise<string> {
    // Would use Sharp or similar
    return imageUrl + '?thumbnail=1';
  }

  /**
   * Process voice message (get duration)
   */
  async processVoiceMessage(file: Express.Multer.File): Promise<number> {
    // Would use ffmpeg or audio library
    return 30; // seconds
  }

  /**
   * Validate file type
   */
  validateFileType(mimeType: string): boolean {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'audio/mpeg',
      'audio/webm',
      'audio/mp4',
      'application/pdf',
    ];
    return allowed.includes(mimeType);
  }

  /**
   * Get file download URL
   */
  async getDownloadUrl(fileId: string): Promise<string | null> {
    const file = this.files.get(fileId);
    return file?.url || null;
  }
}