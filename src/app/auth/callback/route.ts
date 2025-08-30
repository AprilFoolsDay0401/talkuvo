import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // 인증 코드가 없으면 홈페이지로 리다이렉트
  if (!code) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 쿠키 설정 실패 시 조용히 처리
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // 쿠키 제거 실패 시 조용히 처리
          }
        },
      },
    }
  );

  try {
    // 인증 코드를 세션으로 교환 (핵심 기능)
    await supabase.auth.exchangeCodeForSession(code);

    // 성공적으로 로그인 완료 후 리다이렉트
    // 프로필 생성은 AuthContext에서 자동으로 처리됨
    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    // 에러가 발생해도 홈페이지로 리다이렉트 (안전한 fallback)
    return NextResponse.redirect(`${origin}${next}`);
  }
}
