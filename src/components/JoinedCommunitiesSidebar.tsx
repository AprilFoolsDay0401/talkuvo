"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

type JoinedCommunity = {
  id: string;
  name: string;
  slug?: string | null;
};

export default function JoinedCommunitiesSidebar() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<JoinedCommunity[]>([]);

  useEffect(() => {
    const fetchJoined = async () => {
      if (!isAuthenticated || !user?.id) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("community_members")
          .select("community_id, communities ( id, name, slug )")
          .eq("user_id", user.id);

        if (error) {
          setItems([]);
        } else {
          const mapped: JoinedCommunity[] = (data || [])
            .map((row: any) => row.communities)
            .filter(Boolean)
            .map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }));
          setItems(mapped);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchJoined();
  }, [isAuthenticated, user?.id]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
        {isAuthenticated ? "Your Communities" : "Popular Communities"}
      </h2>

      {loading ? (
        <div className="py-4 text-sm text-gray-500">Loading...</div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((community) => (
            <Link
              key={community.id}
              href={`/c/${community.slug || community.name}`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {community.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  c/{community.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-600">No joined communities yet.</div>
      )}

      <Button className="w-full mt-4" variant="outline">
        View More Communities
      </Button>
    </div>
  );
}
