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
        // 파일 검증
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
        }

        if (!acceptedTypes.includes(file.type)) {
          throw new Error("지원되지 않는 이미지 형식입니다. (JPEG, PNG, WebP)");
        }

        // 파일명 생성 (사용자ID_타임스탬프.확장자)
        const timestamp = Date.now();
        const fileExtension = file.name.split(".").pop();
        const fileName = `${timestamp}.${fileExtension}`;
        const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

        // Supabase Storage에 업로드
        const { data, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`업로드 실패: ${uploadError.message}`);
        }

        // 업로드된 이미지의 공개 URL 가져오기
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          setPreviewUrl(urlData.publicUrl);
          onImageUploaded(urlData.publicUrl);
          setUploadProgress(100);
        } else {
          throw new Error("이미지 URL을 가져올 수 없습니다.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다."
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
      {/* 현재 이미지 또는 업로드 영역 */}
      {previewUrl ? (
        <div className="relative">
          <div className="w-32 h-32 mx-auto">
            <img
              src={previewUrl}
              alt="프로필 이미지"
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
              <p className="text-orange-600 font-medium">
                여기에 이미지를 놓으세요
              </p>
            ) : (
              <>
                <p className="text-gray-600">
                  <span className="font-medium text-orange-600">클릭</span>하여
                  이미지 선택
                </p>
                <p className="text-sm text-gray-500">
                  또는 이미지를 여기로 드래그하세요
                </p>
                <p className="text-xs text-gray-400">
                  {acceptedTypes.join(", ").toUpperCase()} • 최대 {maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* 업로드 진행률 */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>업로드 중...</span>
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

      {/* 에러 메시지 */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          ⚠️ {error}
        </div>
      )}

      {/* 수동 업로드 버튼 (이미지가 있을 때) */}
      {previewUrl && !uploading && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() =>
              document.querySelector('input[type="file"]')?.click()
            }
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            다른 이미지로 변경
          </Button>
        </div>
      )}
    </div>
  );
}
