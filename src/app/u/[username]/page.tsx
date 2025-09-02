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
  const { user: currentUser, loading: authLoading } = useAuth();
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
            setError("User not found.");
          } else {
            setError("Error loading profile.");
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError("Error loading profile.");
      } finally {
        setLoading(false);
      }
    };

    if (username && !authLoading) {
      fetchProfile();

      // 안전장치: 10초 후에도 로딩이 안 끝나면 에러 처리
      const timeoutId = setTimeout(() => {
        if (loading) {
          setError("Loading timeout. Please try again.");
          setLoading(false);
        }
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [username, authLoading, loading]);

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

  // AuthContext가 아직 로딩 중이거나 프로파일을 가져오는 중일 때
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            User Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === username;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          {/* 배너 이미지 (나중에 추가 가능) */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-orange-400 to-red-400"></div>

          {/* 프로필 정보 */}
          <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
            {/* 아바타 */}
            <div className="absolute -top-8 sm:-top-12 left-4 sm:left-6">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-orange-500 text-white text-2xl sm:text-4xl font-bold">
                  {getInitials(profile.username)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* 프로필 상세 정보 */}
            <div className="ml-28 sm:ml-40 pt-2 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 mb-2">
                    @{profile.username}
                  </p>
                  {profile.bio && (
                    <p className="text-gray-700 mb-4 max-w-2xl text-sm sm:text-base">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined: {formatDate(profile.created_at)}</span>
                  </div>
                </div>

                {/* 편집 버튼 (자신의 프로필인 경우) */}
                {isOwnProfile && (
                  <div className="flex-shrink-0">
                    <Link href="/settings">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 w-full sm:w-auto"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Profile</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 통계 및 활동 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-2">
              0
            </div>
            <div className="text-sm sm:text-base text-gray-600">Posts</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-500 mb-2">
              0
            </div>
            <div className="text-sm sm:text-base text-gray-600">Comments</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-2">
              0
            </div>
            <div className="text-sm sm:text-base text-gray-600">
              Likes Received
            </div>
          </div>
        </div>

        {/* 최근 활동 (나중에 구현) */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No activity yet.</p>
            {isOwnProfile && (
              <div className="mt-4">
                <Link href="/create">
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
                  >
                    Write Your First Post
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
