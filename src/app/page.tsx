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
    description: "Everything about programming",
    memberCount: 12500,
    postCount: 8900,
    avatarUrl: null,
  },
  {
    id: "2",
    name: "korea",
    description: "Stories about Korea",
    memberCount: 8900,
    postCount: 5600,
    avatarUrl: null,
  },
  {
    id: "3",
    name: "technology",
    description: "Latest technology trends",
    memberCount: 15600,
    postCount: 12300,
    avatarUrl: null,
  },
  {
    id: "4",
    name: "food",
    description: "Delicious food stories",
    memberCount: 7800,
    postCount: 4500,
    avatarUrl: null,
  },
];

const mockPosts = [
  {
    id: "1",
    title: "New Features in Next.js 15",
    content: "Here's a summary of the new features added in Next.js 15...",
    author: "dev_user",
    community: "programming",
    upvotes: 156,
    downvotes: 12,
    commentCount: 23,
    createdAt: "2 hours ago",
    postType: "text" as const,
  },
  {
    id: "2",
    title: "Traditional Korean Food Culture",
    content: "Let's explore traditional Korean food culture...",
    author: "foodie_kr",
    community: "food",
    upvotes: 89,
    downvotes: 5,
    commentCount: 15,
    createdAt: "4 hours ago",
    postType: "text" as const,
  },
  {
    id: "3",
    title: "The Future of AI Technology",
    content: "How artificial intelligence technology will change our lives...",
    author: "tech_enthusiast",
    community: "technology",
    upvotes: 234,
    downvotes: 18,
    commentCount: 45,
    createdAt: "6 hours ago",
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
              Popular Communities
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
                      {community.memberCount.toLocaleString()} members
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              View More Communities
            </Button>
          </div>
        </div>

        {/* Main Content - 포스트 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Post Creation Button */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What would you like to talk about?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Post List */}
            <div className="divide-y divide-gray-200">
              {mockPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex space-x-3">
                    {/* Voting Buttons */}
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

                    {/* Post Content */}
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
                            {post.commentCount} comments
                          </span>
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                          Share
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Information & Ads */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
            <h3 className="text-lg font-semibold mb-4">About TalkUvo</h3>
            <p className="text-sm text-gray-600 mb-4">
              TalkUvo is a community platform for discussing and debating
              various topics. Join communities of interest and share your
              opinions.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Communities</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Users</span>
                <span className="font-medium">45,678</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Today's Posts</span>
                <span className="font-medium">567</span>
              </div>
            </div>

            <Button className="w-full mt-4">Create Community</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
