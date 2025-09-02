"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Community = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export default function CommunityPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const slug = params?.slug;
      if (!slug) return;

      setLoading(true);
      setError(null);
      try {
        // Query by slug (fallback to name for older rows)
        const { data, error } = await supabase
          .from("communities")
          .select(
            "id, name, slug, description, created_by, created_at, updated_at"
          )
          .eq("slug", slug)
          .single();

        if (error) {
          if ((error as any).code === "PGRST116") {
            // fallback: try by name if slug not found
            const fb = await supabase
              .from("communities")
              .select(
                "id, name, description, created_by, created_at, updated_at"
              )
              .eq("name", slug)
              .single();
            if (fb.error) {
              if ((fb.error as any).code === "PGRST116") setCommunity(null);
              else setError(fb.error.message);
            } else {
              setCommunity(fb.data as any);
            }
          } else {
            setError(error.message);
          }
        } else {
          setCommunity(data as any);
        }
      } catch (e) {
        setError("Failed to load community.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-gray-300 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Community not found</h1>
        <p className="text-gray-600 mt-2">
          The community you are looking for does not exist.
        </p>
        <button
          className="mt-4 px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
          onClick={() => router.push("/")}
        >
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Default gradient banner with overlay title/description */}
      <div className="mb-6">
        <div className="relative h-36 sm:h-44 w-full rounded-lg overflow-hidden bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500">
          {/* subtle bottom gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute inset-x-4 bottom-3 sm:inset-x-6 sm:bottom-4 text-white drop-shadow">
            <div className="text-xs sm:text-sm opacity-90">
              c/{community.name}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight mt-0.5">
              {community.name}
            </h1>
            {community.description && (
              <p className="text-xs sm:text-sm opacity-90 mt-0.5 line-clamp-2">
                {community.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Placeholder for future content: posts, sidebar, etc. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-md border p-4 text-gray-600">
            No posts yet. Be the first to post!
          </div>
        </div>
        <aside className="rounded-md border p-4">
          <h2 className="font-semibold">About this community</h2>
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            <li>
              Created at: {new Date(community.created_at).toLocaleString()}
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
