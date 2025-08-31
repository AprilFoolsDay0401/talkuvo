"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Search, X } from "lucide-react";
import { useState } from "react";

export function NavBar() {
  const router = useRouter();
  const { user, session, loading, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      // logout 함수에서 이미 리다이렉트 처리
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 검색 페이지로 이동 (나중에 구현)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (showMobileSearch) {
      setSearchQuery("");
    }
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* 로고 및 메인 네비게이션 */}
          <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                <span className="text-white font-bold text-base">T</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                TalkUvo
              </span>
            </Link>
          </div>

          {/* 검색바 (중앙) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search communities or posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-10 pr-10 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* 모바일 검색 아이콘 */}
            <button
              onClick={toggleMobileSearch}
              className="md:hidden p-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {loading ? (
              <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center  hover:bg-gray-100 rounded-full p-1 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer focus:outline-none  sm:space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm px-1 font-medium text-gray-700 hidden sm:block group-hover:text-gray-900 transition-colors">
                      {user.username}
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
                        {user.username}
                      </p>
                      <p className="text-xs leading-none text-gray-500">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <Link href={`/u/${user.username}`}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <Link href="/create">Write Post</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <Link href="/create-community">Create Community</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="hover:bg-gray-100 cursor-pointer text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm relative overflow-hidden group cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:shadow-orange-200 hover:border-orange-400 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100"
                >
                  <span className="relative z-10 transition-all duration-300 group-hover:text-orange-600">
                    Sign In
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-all duration-300 ease-out rounded-md"></div>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 모바일 검색바 (애니메이션과 함께 나타남) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            showMobileSearch
              ? "max-h-20 opacity-100 py-3"
              : "max-h-0 opacity-0 py-0"
          } border-t border-gray-100`}
        >
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search communities or posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
}
