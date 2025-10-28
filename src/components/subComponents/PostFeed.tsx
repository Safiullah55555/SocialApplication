"use client";

import { useState, useCallback, useEffect } from "react";
import PostCard, { type Post } from "../PostCard";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

type PostFeedProps = {
  initialPosts: Post[];
  dbUserId: string | null;
};

export default function PostFeed({ initialPosts, dbUserId }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialPosts.length === 20);
  const [loading, setLoading] = useState(false);

  // Listen for new posts from CreatePost
  useEffect(() => {
    const handler = (e: any) => {
      const newPost = e.detail as Post;
      setPosts((p) => [newPost, ...p]);
      setHasMore(true);
    };
    window.addEventListener("new-post", handler);
    return () => window.removeEventListener("new-post", handler);
  }, []);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${page}&limit=20`);
      const newPosts: Post[] = await res.json();
      setPosts((p) => [...p, ...newPosts]);
      setPage((p) => p + 1);
      setHasMore(newPosts.length === 20);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  const updatePost = (id: string, content: string) => {
    setPosts((p) =>
      p.map((post) => (post.id === id ? { ...post, content } : post))
    );
  };

  const removePost = (id: string) => {
    setPosts((p) => p.filter((post) => post.id !== id));
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          dbUserId={dbUserId}
          onEdit={updatePost}
          onDelete={removePost}
        />
      ))}

      {hasMore ? (
        <div className="flex justify-center py-4">
          <Button onClick={loadMore} disabled={loading} variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more 20 posts"
            )}
          </Button>
        </div>
      ) : posts.length > 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No more posts to load
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No posts found
        </div>
      )}
    </div>
  );
}