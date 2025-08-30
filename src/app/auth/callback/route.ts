import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
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
              // 에러 로그 제거
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // 에러 로그 제거
            }
          },
        },
      }
    );

    try {
      // PKCE 없이 세션 교환 시도
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        // PKCE 에러인 경우 다른 방법 시도
        if (error.message.includes("code verifier")) {
          // 간단한 리디렉트로 처리
          return NextResponse.redirect(`${origin}${next}`);
        }

        return NextResponse.redirect(
          `${origin}/login?error=oauth_failed&message=${encodeURIComponent(
            error.message
          )}`
        );
      }

      // OAuth 로그인 성공 후 사용자 정보 가져오기
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        return NextResponse.redirect(
          `${origin}/login?error=user_fetch_failed&message=${encodeURIComponent(
            userError.message
          )}`
        );
      }

      if (user) {
        // 기존 프로필이 있는지 확인
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          // 에러 로그 제거
        }

        if (!existingProfile) {
          // Google OAuth 사용자의 경우 프로필 자동 생성
          let username = user.user_metadata?.username;

          // username이 없거나 중복인 경우 이메일 기반으로 생성
          if (!username) {
            const emailPrefix = user.email?.split("@")[0] || "user";
            username = `${emailPrefix}_${Date.now().toString().slice(-4)}`;
          }

          // username 중복 확인 및 수정
          let finalUsername = username;
          let counter = 1;
          let maxAttempts = 10;

          while (counter <= maxAttempts) {
            const { data: duplicateCheck, error: duplicateError } =
              await supabase
                .from("profiles")
                .select("username")
                .eq("username", finalUsername)
                .maybeSingle();

            if (duplicateError) {
              // 에러 로그 제거
              break;
            }

            if (!duplicateCheck) {
              break;
            }

            finalUsername = `${username}_${counter}`;
            counter++;
          }

          // 프로필 생성
          const profileData = {
            id: user.id,
            username: finalUsername,
            email: user.email,
            full_name:
              user.user_metadata?.full_name || user.user_metadata?.name || "",
            avatar_url: user.user_metadata?.avatar_url || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert(profileData)
            .select()
            .single();

          if (insertError) {
            // 에러 로그 제거
          } else {
            // 로그 제거
          }
        } else {
          // 로그 제거
        }
      } else {
        // 로그 제거
      }
    } catch (error) {
      // 에러가 발생해도 홈페이지로 리디렉트 시도
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else {
    // 코드가 없어도 홈페이지로 리디렉트
    return NextResponse.redirect(`${origin}${next}`);
  }

  // 리디렉트
  const redirectUrl = `${origin}${next}`;
  return NextResponse.redirect(redirectUrl);
}
