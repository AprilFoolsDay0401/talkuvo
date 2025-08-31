import { supabase } from "@/lib/supabase";

/**
 * Supabase 스토리지에서 이미지 파일을 삭제합니다.
 * @param imageUrl - 삭제할 이미지의 공개 URL
 * @param bucketName - 스토리지 버킷 이름 (기본값: "avatars")
 * @returns 삭제 성공 여부
 */
export const deleteImageFromStorage = async (
  imageUrl: string,
  bucketName: string = "avatars"
): Promise<boolean> => {
  try {
    // URL에서 파일 경로 추출
    // Supabase 스토리지 URL 구조:
    // https://xxx.supabase.co/storage/v1/object/public/avatars/user123/image.jpg
    // → "user123/image.jpg"

    // "avatars" 이후의 모든 경로를 가져옴
    const bucketIndex = imageUrl.indexOf(`/${bucketName}/`);
    if (bucketIndex === -1) {
      console.warn("버킷을 찾을 수 없음:", { imageUrl, bucketName });
      return false;
    }

    // /avatars/ 이후의 경로 추출
    const filePath = imageUrl.substring(bucketIndex + bucketName.length + 2);

    if (!filePath) {
      console.warn("파일 경로를 추출할 수 없음:", imageUrl);
      return false;
    }

    console.log("스토리지에서 이미지 삭제 시도:", {
      bucketName,
      filePath,
      originalUrl: imageUrl,
      bucketIndex,
      extractedPath: filePath,
    });

    // Supabase Storage에서 파일 삭제
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error("스토리지 이미지 삭제 실패:", error);
      return false;
    }

    console.log("스토리지 이미지 삭제 성공:", filePath);
    return true;
  } catch (error) {
    console.error("스토리지 이미지 삭제 중 예외 발생:", error);
    return false;
  }
};
