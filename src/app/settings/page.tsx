"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { deleteImageFromStorage } from "@/lib/storage";

export default function SettingsPage() {
  const { user, session, updateProfile, loading, isAuthenticated } = useAuth();
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

  // Redirect unauthenticated users to login page
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Load profile data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        full_name: user.full_name || "",
        bio: user.bio || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    console.log("Image upload completed:", imageUrl);
    setFormData((prev) => ({ ...prev, avatar_url: imageUrl }));
    console.log("formData updated:", { ...formData, avatar_url: imageUrl });
  };

  const handleImageRemoved = () => {
    setFormData((prev) => ({ ...prev, avatar_url: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    console.log("Form submission started, current formData:", formData);

    try {
      // Check if image has changed (removed or replaced with different image)
      if (user?.avatar_url && formData.avatar_url !== user.avatar_url) {
        console.log(
          "Image changed, attempting to delete old image from storage"
        );
        console.log("Old image:", user.avatar_url);
        console.log("New image:", formData.avatar_url);

        const deleteSuccess = await deleteImageFromStorage(user.avatar_url);
        if (deleteSuccess) {
          console.log("Successfully deleted old image from storage");
        } else {
          console.warn(
            "Failed to delete old image from storage (profile update will continue)"
          );
        }
      }

      // Update profile (excluding username)
      const updateData = {
        full_name: formData.full_name,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
      };

      console.log("Data to update:", updateData);

      const result = await updateProfile(updateData);

      console.log("updateProfile result:", result);

      if (result.error) {
        console.error("프로필 업데이트 에러:", result.error);
        toast({
          title: "Profile Update Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        console.log("Profile update successful:", result.data);
        toast({
          title: "Profile Updated Successfully!",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);

        // Refresh page after profile update to update header avatar
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("handleSubmit error:", error);
      toast({
        title: "Error Occurred",
        description: "An error occurred while updating your profile.",
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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Profile Settings
          </h1>

          {/* Profile Preview */}
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
                Username
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
                Username cannot be changed
              </p>
            </div>

            {/* 실명 */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
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
                placeholder="Enter your full name"
              />
            </div>

            {/* 자기소개 */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bio
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
                placeholder="Tell us about yourself"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.bio.length}/200 characters
              </p>
            </div>

            {/* 아바타 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
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
                      You can change the image in edit mode.
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                JPEG, PNG, WebP formats • Max 5MB
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-500 hover:bg-orange-600 relative overflow-hidden group cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:shadow-orange-200 hover:border-orange-400 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100"
                >
                  <span className="relative z-10 transition-all duration-300 group-hover:text-orange-600">
                    Edit
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-all duration-300 ease-out rounded-md"></div>
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // Restore original data
                      setFormData({
                        username: user.username || "",
                        full_name: user.full_name || "",
                        bio: user.bio || "",
                        avatar_url: user.avatar_url || "",
                      });
                    }}
                    className="relative overflow-hidden group cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:shadow-gray-200 hover:border-gray-400 hover:text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                  >
                    <span className="relative z-10 transition-all duration-300 group-hover:text-gray-600">
                      Cancel
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-10 transition-all duration-300 ease-out rounded-md"></div>
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600 relative overflow-hidden group cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:shadow-orange-200 hover:border-orange-400 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 transition-all duration-300 group-hover:text-orange-600">
                      {saving ? "Saving..." : "Save"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-all duration-300 ease-out rounded-md"></div>
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
