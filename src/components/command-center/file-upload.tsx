'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileCode, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface FileAttachment {
  type: 'image' | 'text';
  content: string;
  metadata: {
    filename: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  };
}

interface FileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void;
  attachments: FileAttachment[];
  onRemoveAttachment: (index: number) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesUploaded, attachments, onRemoveAttachment, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(async (files: FileList) => {
    setError(null);
    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<{ data: FileAttachment }>(
          '/api/command-center/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        return response.data;
      });

      const results = await Promise.all(uploadPromises);
      onFilesUploaded(results);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  }, [onFilesUploaded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
    // Reset input
    e.target.value = '';
  }, [uploadFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  }, [uploadFiles]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 transition-colors',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && !isDragging && 'hover:border-primary/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm">
              Drag & drop or{' '}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.js,.ts,.tsx,.jsx,.json,.html,.css,.md,.txt,.xml,.yaml,.yml"
                  onChange={handleFileInput}
                  disabled={disabled || isUploading}
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground">
              Images, code files · Max 10MB per file
            </p>
          </div>
          {isUploading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-2 rounded-lg border bg-card hover:bg-accent transition-colors group"
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {file.type === 'image' ? (
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileCode className="h-4 w-4 text-green-500" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {file.metadata.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.metadata.size)} · {file.metadata.mimeType}
                </p>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={() => onRemoveAttachment(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
