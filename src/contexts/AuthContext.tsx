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

// 에러 타입 정의
interface AuthError {
  code: string;
  message: string;
  userMessage: string;
}

// 에러 메시지 매핑
const getErrorMessage = (error: any): AuthError => {
  if (error?.code) {
    switch (error.code) {
      case "PGRST116":
        return {
          code: error.code,
          message: "Profile not found",
          userMessage: "프로필을 찾을 수 없습니다.",
        };
      case "23505": // unique_violation
        return {
          code: error.code,
          message: "Username already exists",
          userMessage: "이미 사용 중인 사용자명입니다.",
        };
      case "23503": // foreign_key_violation
        return {
          code: error.code,
          message: "Referenced record not found",
          userMessage: "참조된 레코드를 찾을 수 없습니다.",
        };
      default:
        return {
          code: error.code || "UNKNOWN_ERROR",
          message: error.message || "Unknown error occurred",
          userMessage: "알 수 없는 오류가 발생했습니다.",
        };
    }
  }

  return {
    code: "UNKNOWN_ERROR",
    message: error?.message || "Unknown error occurred",
    userMessage: "알 수 없는 오류가 발생했습니다.",
  };
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ data?: Profile; error?: AuthError }>;
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
        const authError = getErrorMessage(error);
        console.error("인증 상태 확인 실패:", {
          error: authError.message,
          code: authError.code,
          timestamp: new Date().toISOString(),
        });
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        const authError = getErrorMessage(error);
        console.error("인증 상태 변경 처리 실패:", {
          event,
          error: authError.message,
          code: authError.code,
          timestamp: new Date().toISOString(),
        });
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
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
        if (error.code === "PGRST116") {
          return await createProfile(userId);
        }
        throw error;
      }

      setProfile(data);
      return data;
    } catch (error) {
      const authError = getErrorMessage(error);
      console.error("프로필 조회 실패:", {
        userId,
        error: authError.message,
        code: authError.code,
        timestamp: new Date().toISOString(),
      });

      // 에러가 발생해도 앱이 크래시되지 않도록 처리
      if (authError.code === "PGRST116") {
        // 프로필이 없는 경우 새로 생성 시도
        try {
          return await createProfile(userId);
        } catch (createError) {
          console.error("프로필 생성 실패:", createError);
          return null;
        }
      }

      return null;
    }
  };

  const createProfile = async (userId: string) => {
    try {
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

      setProfile(data);
      return data;
    } catch (error) {
      const authError = getErrorMessage(error);
      console.error("프로필 생성 실패:", {
        userId,
        error: authError.message,
        code: authError.code,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      const error: AuthError = {
        code: "NOT_AUTHENTICATED",
        message: "User not authenticated",
        userMessage: "로그인이 필요합니다.",
      };
      return { error };
    }

    try {
      console.log("프로필 업데이트 시작:", { updates, userId: user.id });

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
        const authError = getErrorMessage(error);
        console.error("프로필 업데이트 실패:", {
          userId: user.id,
          updates,
          error: authError.message,
          code: authError.code,
          timestamp: new Date().toISOString(),
        });
        return { error: authError };
      }

      console.log("프로필 업데이트 성공:", data);

      // 프로필 업데이트 후 자동으로 새로고침
      setProfile(data);

      // 추가로 최신 프로필 정보를 다시 가져오기
      await fetchProfile(user.id);

      return { data };
    } catch (error) {
      const authError = getErrorMessage(error);
      console.error("프로필 업데이트 예외 발생:", {
        userId: user.id,
        updates,
        error: authError.message,
        code: authError.code,
        timestamp: new Date().toISOString(),
      });
      return { error: authError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      const authError = getErrorMessage(error);
      console.error("Google 로그인 실패:", {
        error: authError.message,
        code: authError.code,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 1. Supabase에서 로그아웃
      const { error } = await supabase.auth.signOut();
      if (error) {
        const authError = getErrorMessage(error);
        console.error("로그아웃 실패:", {
          error: authError.message,
          code: authError.code,
          timestamp: new Date().toISOString(),
        });
        // 에러가 발생해도 로컬 상태는 초기화
      }

      // 2. 로컬 상태 초기화
      setUser(null);
      setProfile(null);

      // 3. 메인 페이지로 이동 (window.location 사용)
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      const authError = getErrorMessage(error);
      console.error("로그아웃 예외 발생:", {
        error: authError.message,
        code: authError.code,
        timestamp: new Date().toISOString(),
      });

      // 에러가 발생해도 로컬 상태는 초기화하고 페이지 이동
      setUser(null);
      setProfile(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
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
