"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";

interface Community {
  id: string;
  name: string;
  description: string | null;
}

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [postType, setPostType] = useState<"text" | "link" | "image">("text");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!user || !profile) {
    router.push("/login");
    return null;
  }

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from("communities")
        .select("id, name, description")
        .order("name");

      if (error) {
        console.error("Error fetching communities:", error);
        return;
      }

      setCommunities(data || []);
    } catch (error) {
      console.error("Error in fetchCommunities:", error);
    } finally {
      setCommunitiesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedCommunity) {
        toast({
          title: "커뮤니티 선택 필요",
          description: "포스트를 작성할 커뮤니티를 선택해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 포스트 생성
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert([
          {
            title,
            content: postType === "text" ? content : null,
            author_id: user.id,
            community_id: selectedCommunity,
            post_type: postType,
            url: postType === "link" ? url : null,
            image_url: postType === "image" ? imageUrl : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (postError) {
        toast({
          title: "포스트 생성 실패",
          description: postError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "포스트 작성 성공!",
        description: "포스트가 성공적으로 작성되었습니다.",
      });

      // 새로 작성된 포스트로 이동
      router.push(`/post/${post.id}`);
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "포스트 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPostTypeFields = () => {
    switch (postType) {
      case "text":
        return (
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              내용 *
            </label>
            <textarea
              id="content"
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="포스트 내용을 입력하세요..."
            />
          </div>
        );
      case "link":
        return (
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              링크 URL *
            </label>
            <input
              id="url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
        );
      case "image":
        return (
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              이미지 URL *
            </label>
            <input
              id="imageUrl"
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">포스트 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 커뮤니티 선택 */}
            <div>
              <label
                htmlFor="community"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                커뮤니티 선택 *
              </label>
              <select
                id="community"
                required
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">커뮤니티를 선택하세요</option>
                {communitiesLoading ? (
                  <option disabled>로딩 중...</option>
                ) : (
                  communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      c/{community.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* 포스트 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                포스트 타입 *
              </label>
              <div className="flex space-x-4">
                {[
                  { value: "text", label: "텍스트", icon: "📝" },
                  { value: "link", label: "링크", icon: "🔗" },
                  { value: "image", label: "이미지", icon: "🖼️" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setPostType(type.value as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                      postType === type.value
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                제목 *
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="포스트 제목을 입력하세요"
                maxLength={300}
              />
            </div>

            {/* 포스트 타입별 필드 */}
            {renderPostTypeFields()}

            {/* 작성 가이드라인 */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                포스트 작성 가이드라인
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 커뮤니티 주제와 관련된 내용을 작성해주세요.</li>
                <li>• 다른 사용자를 존중하고 건설적인 토론을 유도하세요.</li>
                <li>• 스팸이나 부적절한 내용은 금지됩니다.</li>
                <li>• 저작권을 침해하는 내용은 업로드하지 마세요.</li>
              </ul>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading || !title.trim() || !selectedCommunity}
              >
                {loading ? "작성 중..." : "포스트 작성"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
