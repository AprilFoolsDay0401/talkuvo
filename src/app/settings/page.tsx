"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function SettingsPage() {
  const { user, profile, updateProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    avatar_url: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.push("/login");
    }
  }, [user, profile, loading, router]);

  // 프로필 데이터 로드
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, avatar_url: imageUrl }));
  };

  const handleImageRemoved = () => {
    setFormData((prev) => ({ ...prev, avatar_url: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 프로필 업데이트 (사용자명 제외)
      const result = await updateProfile({
        full_name: formData.full_name,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
      });

      if (result.error) {
        toast({
          title: "프로필 업데이트 실패",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "프로필 업데이트 성공!",
          description: "프로필이 성공적으로 업데이트되었습니다.",
        });
        setIsEditing(false);

        // 프로필 업데이트 후 페이지 새로고침으로 헤더 아바타 업데이트
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 bg-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">프로필 설정</h1>

          {/* 프로필 미리보기 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={formData.avatar_url || undefined} />
                <AvatarFallback className="bg-orange-500 text-white text-xl font-medium">
                  {getInitials(formData.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formData.full_name || formData.username}
                </h3>
                <p className="text-gray-600">@{formData.username}</p>
                {formData.bio && (
                  <p className="text-sm text-gray-500 mt-2">{formData.bio}</p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 사용자명 (읽기 전용) */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                사용자명
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 text-lg mr-2">@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  disabled={true}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                사용자명은 변경할 수 없습니다
              </p>
            </div>

            {/* 실명 */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                실명
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                maxLength={50}
                placeholder="실명을 입력하세요"
              />
            </div>

            {/* 자기소개 */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                자기소개
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                maxLength={200}
                placeholder="자기소개를 입력하세요"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.bio.length}/200자
              </p>
            </div>

            {/* 아바타 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로필 이미지
              </label>
              {isEditing ? (
                <ImageUpload
                  currentImageUrl={formData.avatar_url}
                  onImageUploaded={handleImageUploaded}
                  onImageRemoved={handleImageRemoved}
                  bucketName="avatars"
                  folderPath={user.id}
                  maxSize={5}
                  acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                />
              ) : (
                <div className="flex items-center space-x-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={formData.avatar_url || undefined} />
                    <AvatarFallback className="bg-orange-500 text-white text-4xl font-medium">
                      {getInitials(formData.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-gray-500">
                    <p className="text-sm">
                      편집 모드에서 이미지를 변경할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                JPEG, PNG, WebP 형식 • 최대 5MB
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  편집하기
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // 원래 데이터로 복원
                      setFormData({
                        username: profile.username || "",
                        full_name: profile.full_name || "",
                        bio: profile.bio || "",
                        avatar_url: profile.avatar_url || "",
                      });
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {saving ? "저장 중..." : "저장하기"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
