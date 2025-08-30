import Link from "next/link";
import {
  TrendingUp,
  Users,
  MessageSquare,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// 임시 데이터 (나중에 Supabase에서 가져올 예정)
const mockCommunities = [
  {
    id: "1",
    name: "programming",
    description: "프로그래밍에 관한 모든 것",
    memberCount: 12500,
    postCount: 8900,
    avatarUrl: null,
  },
  {
    id: "2",
    name: "korea",
    description: "한국에 관한 이야기",
    memberCount: 8900,
    postCount: 5600,
    avatarUrl: null,
  },
  {
    id: "3",
    name: "technology",
    description: "최신 기술 트렌드",
    memberCount: 15600,
    postCount: 12300,
    avatarUrl: null,
  },
  {
    id: "4",
    name: "food",
    description: "맛있는 음식 이야기",
    memberCount: 7800,
    postCount: 4500,
    avatarUrl: null,
  },
];

const mockPosts = [
  {
    id: "1",
    title: "Next.js 15의 새로운 기능들",
    content: "Next.js 15에서 추가된 새로운 기능들을 정리해보았습니다...",
    author: "dev_user",
    community: "programming",
    upvotes: 156,
    downvotes: 12,
    commentCount: 23,
    createdAt: "2시간 전",
    postType: "text" as const,
  },
  {
    id: "2",
    title: "한국의 전통 음식 문화",
    content: "한국의 전통 음식 문화에 대해 알아보겠습니다...",
    author: "foodie_kr",
    community: "food",
    upvotes: 89,
    downvotes: 5,
    commentCount: 15,
    createdAt: "4시간 전",
    postType: "text" as const,
  },
  {
    id: "3",
    title: "AI 기술의 미래",
    content: "인공지능 기술이 우리 삶을 어떻게 바꿀 것인지...",
    author: "tech_enthusiast",
    community: "technology",
    upvotes: 234,
    downvotes: 18,
    commentCount: 45,
    createdAt: "6시간 전",
    postType: "text" as const,
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - 커뮤니티 목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              인기 커뮤니티
            </h2>
            <div className="space-y-3">
              {mockCommunities.map((community) => (
                <Link
                  key={community.id}
                  href={`/c/${community.name}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {community.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      c/{community.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {community.memberCount.toLocaleString()}명
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              커뮤니티 더 보기
            </Button>
          </div>
        </div>

        {/* Main Content - 포스트 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            {/* 포스트 생성 버튼 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="무엇을 이야기하고 싶으신가요?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 포스트 목록 */}
            <div className="divide-y divide-gray-200">
              {mockPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex space-x-3">
                    {/* 투표 버튼 */}
                    <div className="flex flex-col items-center space-y-1">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <ArrowUp className="w-5 h-5 text-gray-400 hover:text-orange-500" />
                      </button>
                      <span className="text-sm font-medium text-gray-900">
                        {post.upvotes - post.downvotes}
                      </span>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <ArrowDown className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                      </button>
                    </div>

                    {/* 포스트 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                        <Link
                          href={`/c/${post.community}`}
                          className="hover:underline"
                        >
                          c/{post.community}
                        </Link>
                        <span>•</span>
                        <span>u/{post.author}</span>
                        <span>•</span>
                        <span>{post.createdAt}</span>
                      </div>

                      <Link href={`/post/${post.id}`}>
                        <h3 className="text-lg font-medium text-gray-900 mb-2 hover:underline">
                          {post.title}
                        </h3>
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {post.content}
                        </p>
                      </Link>

                      <div className="flex items-center space-x-4 mt-3">
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">
                            {post.commentCount} 댓글
                          </span>
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                          공유
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                          저장
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - 정보 및 광고 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
            <h3 className="text-lg font-semibold mb-4">TalkUvo 소개</h3>
            <p className="text-sm text-gray-600 mb-4">
              TalkUvo는 다양한 주제에 대해 이야기하고 토론하는 커뮤니티
              플랫폼입니다. 관심 있는 주제의 커뮤니티에 참여하고 의견을
              나누어보세요.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">총 커뮤니티</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">총 사용자</span>
                <span className="font-medium">45,678</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">오늘 포스트</span>
                <span className="font-medium">567</span>
              </div>
            </div>

            <Button className="w-full mt-4">커뮤니티 만들기</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
