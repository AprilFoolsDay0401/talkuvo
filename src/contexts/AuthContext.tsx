"use client";

import { useEffect, useState, createContext, useContext } from "react";
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

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // 로그아웃 + 네비게이션
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ data?: Profile; error?: any }>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 기존 useAuth 로직을 여기로 이동
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
        // 에러 처리
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
      console.log("fetchProfile 시작:", { userId });

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("프로필 조회 결과:", { data, error });

      if (error) {
        console.log("프로필 조회 에러:", {
          errorCode: error.code,
          errorMessage: error.message,
        });

        if (error.code === "PGRST116") {
          console.log("프로필이 없음, 새로 생성 시작");
          return await createProfile(userId);
        }
        throw error;
      }

      console.log("기존 프로필 찾음:", data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error("프로필 조회 실패:", error);
      throw error;
    }
  };

  const createProfile = async (userId: string) => {
    try {
      console.log("createProfile 시작:", { userId });
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not found or error fetching user");
      }

      // 간단한 사용자명 생성 (이메일 앞부분 사용)
      const emailPrefix = user.email?.split("@")[0] || "user";
      const username = emailPrefix;

      const profileData = {
        id: userId,
        username: username,
        email: user.email,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || "",
        avatar_url: user.user_metadata?.avatar_url || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("프로필 데이터:", profileData);

      // upsert로 프로필 생성 또는 업데이트
      const { data, error } = await supabase
        .from("profiles")
        .upsert(profileData, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("프로필 upsert 성공:", data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error("createProfile 예외 발생:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("User not authenticated") };

    try {
      console.log("updateProfile 호출됨:", { updates, userId: user.id });

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
        console.error("프로필 업데이트 에러:", error);
        return { error };
      }

      console.log("프로필 업데이트 성공:", data);

      // 프로필 업데이트 후 자동으로 새로고침
      setProfile(data);

      // 추가로 최신 프로필 정보를 다시 가져오기
      await fetchProfile(user.id);

      return { data };
    } catch (error) {
      console.error("updateProfile 예외 발생:", error);
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
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

  const logout = async () => {
    try {
      // 1. Supabase에서 로그아웃
      const { error } = await supabase.auth.signOut();
      if (error) {
        // 에러 로그 제거
        return;
      }

      // 2. 로컬 상태 초기화
      setUser(null);
      setProfile(null);

      // 3. 메인 페이지로 이동 (window.location 사용)
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      // 에러 로그 제거
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signOut,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
