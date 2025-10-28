"use client";
import { useEffect, useState } from "react";

interface PostMediaProps {
  src: string;
  className?: string;
}

export default function PostMedia({ src, className = "" }: PostMediaProps) {
  const [isVideo, setIsVideo] = useState<boolean | null>(null);

  useEffect(() => {
    if (!src) return;

    const checkType = async () => {
      try {
        const res = await fetch(src, { method: "HEAD" });
        const contentType = res.headers.get("content-type") || "";
        setIsVideo(contentType.startsWith("video/"));
      } catch {
        // fallback: if URL ends with a typical video extension
        setIsVideo(/\.(mp4|webm|ogg)$/i.test(src));
      }
    };

    checkType();
  }, [src]);

  if (!src) return null;

  if (isVideo === null) {
    return (
      <div className="w-full h-40 bg-muted/20 flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground text-sm">Loading media...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      {isVideo ? (
        <video
          src={src}
          controls
          preload="metadata"
          className="w-full h-auto rounded-lg"
        />
      ) : (
        <img
          src={src}
          alt="Post media"
          className="w-full h-auto object-cover rounded-lg"
        />
      )}
    </div>
  );
}
