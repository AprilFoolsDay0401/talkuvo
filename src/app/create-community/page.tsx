"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { slugify } from "@/lib/utils";

export default function CreateCommunityPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, session, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Auth guard: redirect unauthenticated users to login
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);
  if (isAuthenticated === false) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check duplicate community by name
      const { data: existingCommunity } = await supabase
        .from("communities")
        .select("id")
        .eq("name", name)
        .single();

      if (existingCommunity) {
        toast({
          title: "Create community failed",
          description: "A community with this name already exists.",
          variant: "destructive",
        });
        return;
      }

      // Create community with slug
      const slug = slugify(name);
      const { data: community, error: communityError } = await supabase
        .from("communities")
        .insert([
          {
            name,
            description,
            slug,
            created_by: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (communityError) {
        toast({
          title: "Create community failed",
          description: communityError.message,
          variant: "destructive",
        });
        return;
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from("community_members")
        .insert([
          {
            user_id: user?.id,
            community_id: community.id,
            role: "admin",
            joined_at: new Date().toISOString(),
          },
        ]);

      if (memberError) {
        toast({
          title: "Failed to add member",
          description: memberError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Community created",
        description: `${name} has been created successfully.`,
      });

      // Navigate to the new community by slug
      router.push(`/c/${slug}`);
    } catch (error) {
      toast({
        title: "Unexpected error",
        description: "An error occurred while creating the community.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create Community
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Community name *
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 text-lg mr-2">c/</span>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter a community name"
                  minLength={3}
                  maxLength={21}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                3-21 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Write a short description"
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">
                {description.length}/500
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Notes when creating a community
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• The name cannot be changed later.</li>
                <li>• You become the admin automatically.</li>
                <li>• Consider setting rules and guidelines.</li>
                <li>• Establish policies to prevent spam or abuse.</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="cursor-pointer transition-transform hover:scale-[1.02]"
                disabled={loading || name.length < 3}
              >
                {loading ? "Creating..." : "Create Community"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
