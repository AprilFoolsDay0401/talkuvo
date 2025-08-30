"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import Link from "next/link";
import { Edit, Calendar, MessageSquare, ThumbsUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const username = params.username as string;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Supabase에서 사용자 프로필 가져오기
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            setError("사용자를 찾을 수 없습니다.");
          } else {
            setError("프로필을 불러오는 중 오류가 발생했습니다.");
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError("프로필을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 bg-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            사용자를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile =
    currentUser && currentProfile && currentProfile.username === username;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          {/* 배너 이미지 (나중에 추가 가능) */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-red-400"></div>

          {/* 프로필 정보 */}
          <div className="relative px-6 pb-6">
            {/* 아바타 */}
            <div className="absolute -top-12 left-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-orange-500 text-white text-4xl font-bold">
                  {getInitials(profile.username)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* 프로필 상세 정보 */}
            <div className="ml-40 pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="text-xl text-gray-600 mb-2">
                    @{profile.username}
                  </p>
                  {profile.bio && (
                    <p className="text-gray-700 mb-4 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>가입일: {formatDate(profile.created_at)}</span>
                  </div>
                </div>

                {/* 편집 버튼 (자신의 프로필인 경우) */}
                {isOwnProfile && (
                  <Link href="/settings">
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>프로필 편집</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 통계 및 활동 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">0</div>
            <div className="text-gray-600">포스트</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">0</div>
            <div className="text-gray-600">댓글</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">0</div>
            <div className="text-gray-600">받은 좋아요</div>
          </div>
        </div>

        {/* 최근 활동 (나중에 구현) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            최근 활동
          </h2>
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>아직 활동이 없습니다.</p>
            {isOwnProfile && (
              <div className="mt-4">
                <Link href="/create">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    첫 포스트 작성하기
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
