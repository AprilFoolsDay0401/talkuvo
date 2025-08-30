"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export function Header() {
  const router = useRouter();
  const { user, profile, loading, logout, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    await logout(); // logout 함수가 모든 것을 처리 (로그아웃 + 페이지 이동)
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TalkUvo</span>
          </Link>

          {/* 검색바 */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                aria-hidden="true"
              >
                <path d="m21 21-4.34-4.34"></path>
                <circle cx="11" cy="11" r="8"></circle>
              </svg>
              <input
                type="text"
                placeholder="TalkUvo 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isAuthenticated && user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
                        {getInitials(profile.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block group-hover:text-gray-900 transition-colors">
                      {profile.username}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border border-gray-200 shadow-lg"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-900">
                        {profile.username}
                      </p>
                      <p className="text-xs leading-none text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <Link href={`/u/${profile.username}`}>프로필</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <Link href="/settings">설정</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <Link href="/create">포스트 작성</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <Link href="/create-community">커뮤니티 만들기</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="hover:bg-gray-100 cursor-pointer text-red-600 hover:text-red-700"
                  >
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" size="sm">
                    가입하기
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
