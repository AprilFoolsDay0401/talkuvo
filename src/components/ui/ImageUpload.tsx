"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./Button";
import { supabase } from "@/lib/supabase";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved: () => void;
  bucketName?: string;
  folderPath?: string;
  maxSize?: number; // MB
  acceptedTypes?: string[];
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  bucketName = "avatars",
  folderPath,
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setUploading(true);
      setUploadProgress(0);

      try {
        // File validation
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File size must be ${maxSize}MB or less.`);
        }

        if (!acceptedTypes.includes(file.type)) {
          throw new Error("Unsupported image format. (JPEG, PNG, WebP)");
        }

        // Generate filename (userId_timestamp.extension)
        const timestamp = Date.now();
        const fileExtension = file.name.split(".").pop();
        const fileName = `${timestamp}.${fileExtension}`;
        const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL of uploaded image
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        console.log("Storage upload result:", { data, urlData });

        if (urlData?.publicUrl) {
          console.log("Public URL generated:", urlData.publicUrl);
          setPreviewUrl(urlData.publicUrl);
          onImageUploaded(urlData.publicUrl);
          setUploadProgress(100);
        } else {
          throw new Error("Unable to get image URL.");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during upload."
        );
        setPreviewUrl(null);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [bucketName, folderPath, maxSize, acceptedTypes, onImageUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": acceptedTypes,
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: false,
  });

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageRemoved();
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Current image or upload area */}
      {previewUrl ? (
        <div className="relative">
          <div className="w-32 h-32 mx-auto">
            <img
              src={previewUrl}
              alt="Profile image"
              className="w-full h-full object-cover rounded-full border-2 border-gray-200"
            />
          </div>
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-orange-400 bg-orange-50"
              : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
            {isDragActive ? (
              <p className="text-orange-600 font-medium">Drop image here</p>
            ) : (
              <>
                <p className="text-gray-600">
                  <span className="font-medium text-orange-600">Click</span> to
                  select image
                </p>
                <p className="text-sm text-gray-500">
                  or drag and drop image here
                </p>
                <p className="text-xs text-gray-400">
                  {acceptedTypes.join(", ").toUpperCase()} • Max {maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          ⚠️ {error}
        </div>
      )}

      {/* Manual upload button (when image exists) */}
      {previewUrl && !uploading && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() =>
              (
                document.querySelector('input[type="file"]') as HTMLInputElement
              )?.click()
            }
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Change Image
          </Button>
        </div>
      )}
    </div>
  );
}
