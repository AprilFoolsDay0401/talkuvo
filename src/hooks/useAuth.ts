"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        // 에러 로그 제거
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // 프로필이 없는 경우 자동 생성 시도
        if (error.code === "PGRST116") {
          // 사용자 정보 가져오기
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return;
          }

          // 프로필 데이터 생성
          const emailPrefix = user.email?.split("@")[0] || "user";
          const username = `${emailPrefix}_${Date.now().toString().slice(-4)}`;

          const profileData = {
            id: user.id,
            username: username,
            email: user.email,
            full_name:
              user.user_metadata?.full_name || user.user_metadata?.name || "",
            avatar_url: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // 필수 필드 확인
          if (!profileData.id || !profileData.username || !profileData.email) {
            return;
          }

          // 실제 프로필 생성!
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .upsert(profileData, {
              onConflict: "id", // id 충돌 시 업데이트
              ignoreDuplicates: false,
            })
            .select()
            .single();

          if (insertError) {
            return;
          }

          setProfile(newProfile);
          return;
        }
      }

      setProfile(data);
    } catch (error) {
      // 에러 로그 제거
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // 에러 로그 제거
      }
    } catch (error) {
      // 에러 로그 제거
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("User not authenticated") };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      // 프로필 업데이트 후 자동으로 새로고침
      setProfile(data);

      // 추가로 최신 프로필 정보를 다시 가져오기
      await fetchProfile(user.id);

      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    user,
    profile,
    loading,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}
