"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";

export default function CreateCommunityPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 로그인하지 않은 사용자는 홈페이지로 리다이렉트
  if (!user || !profile) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 커뮤니티 이름 중복 확인
      const { data: existingCommunity } = await supabase
        .from("communities")
        .select("id")
        .eq("name", name)
        .single();

      if (existingCommunity) {
        toast({
          title: "커뮤니티 생성 실패",
          description: "이미 존재하는 커뮤니티 이름입니다.",
          variant: "destructive",
        });
        return;
      }

      // 커뮤니티 생성
      const { data: community, error: communityError } = await supabase
        .from("communities")
        .insert([
          {
            name,
            description,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (communityError) {
        toast({
          title: "커뮤니티 생성 실패",
          description: communityError.message,
          variant: "destructive",
        });
        return;
      }

      // 커뮤니티 생성자를 관리자로 추가
      const { error: memberError } = await supabase
        .from("community_members")
        .insert([
          {
            user_id: user.id,
            community_id: community.id,
            role: "admin",
            joined_at: new Date().toISOString(),
          },
        ]);

      if (memberError) {
        toast({
          title: "멤버 추가 실패",
          description: memberError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "커뮤니티 생성 성공!",
        description: `${name} 커뮤니티가 생성되었습니다.`,
      });

      // 새로 생성된 커뮤니티로 이동
      router.push(`/c/${name}`);
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "커뮤니티 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            커뮤니티 만들기
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                커뮤니티 이름 *
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 text-lg mr-2">c/</span>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="커뮤니티 이름을 입력하세요"
                  minLength={3}
                  maxLength={21}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                커뮤니티 이름은 3-21자 사이여야 하며, 영문, 숫자, 언더스코어만
                사용할 수 있습니다.
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                설명
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="커뮤니티에 대한 간단한 설명을 입력하세요"
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">
                {description.length}/500자
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                커뮤니티 생성 시 주의사항
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 커뮤니티 이름은 한 번 설정하면 변경할 수 없습니다.</li>
                <li>• 커뮤니티를 생성하면 자동으로 관리자가 됩니다.</li>
                <li>
                  • 커뮤니티 규칙과 가이드라인을 설정하는 것을 권장합니다.
                </li>
                <li>
                  • 부적절한 내용이나 스팸을 방지하기 위한 정책을 수립하세요.
                </li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button type="submit" disabled={loading || name.length < 3}>
                {loading ? "생성 중..." : "커뮤니티 만들기"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
