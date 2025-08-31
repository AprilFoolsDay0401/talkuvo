"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

type AuthContextType = {
  user: Profile | null; // DB에서 가져온 유저 정보
  session: any; // supabase 세션
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ data?: Profile; error?: any }>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null); // DB에서 가져온 유저 정보
  const [session, setSession] = useState<any>(null); // supabase 세션
  const [loading, setLoading] = useState(true);

  // DB에서 유저 가져오기 / 없으면 삽입
  const getOrCreateUser = useCallback(async (user: User) => {
    const { id, email } = user;

    // 1️⃣ DB에서 존재 확인
    const { data: existingUser, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = row not found
      console.error("Error fetching user:", error);
      return null;
    }

    if (existingUser) {
      return existingUser;
    }

    // 2️⃣ 없으면 새로 삽입
    const profileData = {
      id,
      email,
      username: email?.split("@")[0] || "user",
      full_name:
        user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || "",
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newUser, error: insertError } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating user:", insertError);
      return null;
    }

    return newUser;
  }, []);

  // Google 로그인
  const signInWithGoogle = useCallback(async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        // options: {
        //   redirectTo: `${window.location.origin}/auth/callback`,
        // },
      });
    } catch (error) {
      console.error("Google 로그인 실패:", error);
      throw error;
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);

      // 메인 페이지로 이동
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 에러가 발생해도 로컬 상태는 초기화
      setUser(null);
      setSession(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, []);

  // 프로필 업데이트
  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        return { error: new Error("User not authenticated") };
      }

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
          console.error("프로필 업데이트 실패:", error);
          return { error };
        }

        setUser(data);
        return { data };
      } catch (error) {
        console.error("프로필 업데이트 예외 발생:", error);
        return { error: error as Error };
      }
    },
    [user]
  );

  useEffect(() => {
    const fetchSessionAndUser = async () => {
      // 1️⃣ 현재 세션 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      if (session?.user) {
        // 2️⃣ DB에서 유저 정보 가져오기 또는 새로 삽입
        const dbUser = await getOrCreateUser(session.user);
        setUser(dbUser);
      }
    };

    fetchSessionAndUser();

    // 3️⃣ 세션 상태 변화 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        const dbUser = await getOrCreateUser(session.user);
        setUser(dbUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [getOrCreateUser]);
  // isAuthenticated 계산
  const isAuthenticated = !!session;

  // console.log("user", user);
  // console.log("session", session);
  // console.log("loading", loading);
  // console.log("isAuthenticated", isAuthenticated);

  const value = {
    session,
    user,
    loading,
    signInWithGoogle,
    logout,
    updateProfile,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
