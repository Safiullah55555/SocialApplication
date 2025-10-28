"use client"
import { createComment, deletePost, getPosts, toggleLike, editPost, editComment, deleteComment } from '@/actions/post.action';
import { SignInButton, useUser } from '@clerk/nextjs';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { Card, CardContent } from './ui/card';
import Link from 'next/link';
import { Avatar, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from "date-fns"
import { DeleteAlertDialog } from './DeleteAlertDialog';
import { Button } from './ui/button';
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon, Edit2Icon, Ellipsis, Trash2Icon } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2Icon } from "lucide-react";
import PostMedia from './subComponents/PostMedia';


// type Posts = Awaited<ReturnType<typeof getPosts>>
// type Post = Posts[number]

export type Post = {
  id: string;
  content: string | null;
  createdAt: string;
  image?: string | null;
  author: {
    id: string;
    name: string | null;
    username: string;
    image?: string | null;
  };
  likes: { userId: string }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string | null;
      username: string;
      image?: string | null;
    };
  }[];
  _count: {
    likes: number;
    comments: number;
  };
};


const PostCard = ({
  post,
  dbUserId,
  onEdit,
  onDelete,
}: {
  post: Post;
  dbUserId: string | null;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
}) => {
  const { user } = useUser()

  const [newComment, setNewComment] = useState("")
  const [isCommenting, setIsCommenting] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasLiked, setHasLiked] = useState(post.likes.some(like => like.userId === dbUserId))
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes)
  const [showComments, setShowComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [deleteDialogCommentId, setDeleteDialogCommentId] = useState<string | null>(null);

  // delete comment handler.
  const handleDeleteComment = async (commentId: string | null) => {
    if (!commentId || isDeletingComment) return;
    try {
      setIsDeletingComment(true);
      const result = await deleteComment(commentId);
      if (result?.success) {
        toast.success("Comment deleted successfully");
        // Optimistically remove comment from UI
        post.comments = post.comments.filter(c => c.id !== commentId);
        setDeleteDialogCommentId(null);
      } else {
        toast.error(result?.error || "Failed to delete comment");
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeletingComment(false);
    }
  };


  // edit comment handler
  const handleEditComment = async (commentId: string) => {
    if (isUpdatingComment) return;
    try {
      setIsUpdatingComment(true);
      const result = await editComment(commentId, editCommentContent);
      if (result?.success) {
        toast.success("Comment updated successfully");
        setEditingCommentId(null);
        // Optimistically update local comment
        const comment = post.comments.find(c => c.id === commentId);
        if (comment) comment.content = editCommentContent;

      } else {
        toast.error(result?.error || "Failed to update comment");
      }
    } catch (error) {
      toast.error("Failed to update comment");
    } finally {
      setIsUpdatingComment(false);
    }
  };
  // Edit handler. 
  const handleEditPost = async () => {
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      const result = await editPost(post.id, editContent);
      if (result?.success) {
        toast.success("Post updated successfully");
        setIsEditing(false);
        // Optimistically update local state (scalable for no full re-render)
        post.content = editContent;
        onEdit?.(post.id, editContent);
        // post.image = editImageUrl;
      } else {
        toast.error(result?.error || "Failed to update post");
      }
    } catch (error) {
      toast.error("Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return
    try {
      setIsLiking(true)
      setHasLiked(prev => !prev)
      setOptimisticLikes(prev => prev + (hasLiked ? -1 : 1))
      await toggleLike(post.id)

    } catch (error) {
      setOptimisticLikes(post._count.likes)
      setHasLiked(post.likes.some(like => like.userId === dbUserId))

    } finally {
      setIsLiking(false)
    }
  }

  // const handleAddComment = async () => {
  //   if (!newComment.trim() || isCommenting) return;
  //   try {
  //     setIsCommenting(true);
  //     const result = await createComment(post.id, newComment);
  //     if (result?.success) {
  //       toast.success("Comment posted successfully");
  //       setNewComment("");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to add comment");
  //   } finally {
  //     setIsCommenting(false);
  //   }
  // }
  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;

    const optimisticComment = {
      id: "temp-" + Date.now(), // temporary ID
      content: newComment,
      createdAt: new Date().toISOString(),
      author: {
        id: dbUserId!,
        name: user?.fullName || "You",
        username: user?.username || "you",
        image: user?.imageUrl || "/avatar.png",
      },
    };

    // Add instantly to UI
    post.comments = [optimisticComment, ...post.comments];

    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success && result.comment) {
        // Replace temp comment with real one
        post.comments = post.comments.map(c =>
          c.id === optimisticComment.id ? result.comment : c
        );
        toast.success("Comment posted!");
      } else {
        // Revert on failure
        post.comments = post.comments.filter(c => c.id !== optimisticComment.id);
        toast.error(result?.error || "Failed");
      }
    } catch (error) {
      post.comments = post.comments.filter(c => c.id !== optimisticComment.id);
      toast.error("Failed to post comment");
    } finally {
      setIsCommenting(false);
      setNewComment("");
    }
  };
  const handleDeletePost = async () => {

    if (isDeleting) return;
    try {
      setIsDeleting(true);
      //delete from db
      const result = await deletePost(post.id);
      // if (result.success) toast.success("Post deleted successfully");
      // else throw new Error(result.error);

      //delete from uploadthing
      if (post.image) {
        const key = post.image.split("/").pop(); // extract only the file key
        if (key) {
          await fetch("/api/delete-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key }),
          });
        }
      }

      toast.success("Post deleted successfully");
      onDelete?.(post.id);

    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  }



  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ? post.author.image : "/avatar.png"} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {dbUserId === post.author.id && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} onEdit={() => setIsEditing(true)} />

                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[50px] resize-none"
                    placeholder="Edit your post..."
                  />
                  {/* {editImageUrl && (
                    <div className="border rounded-lg p-4 flex justify-center">
                      <ImageUpload
                        endpoint="postImage"
                        value={editImageUrl}
                        onchange={(url) => setEditImageUrl(url)}
                      />
                    </div>
                  } */}
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleEditPost} disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>
              )}
            </div>
          </div>

          {/* POST IMAGE
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
            </div>
          )} */}
          {post.image && <PostMedia src={post.image} className="mt-2" />}


          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                  }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4">
                {/* DISPLAY COMMENTS */}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage src={comment.author.image ? comment.author.image : "/avatar.png"} />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      {/* flex-1 min-w-0 */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>

                      {/* header is above, show content row with right-aligned 3-dot menu */}
                      <div className="flex items-start justify-between mt-1">
                        {/* comment text (take remaining width) */}
                        <div className="flex-1 min-w-0">
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                                className="min-h-[50px] resize-none"
                                placeholder="Edit your comment..."
                              />
                              <div className="flex justify-end space-x-2">
                                <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                <Button size="sm" onClick={() => handleEditComment(comment.id)} disabled={isUpdatingComment}>
                                  {isUpdatingComment ? "Updating..." : "Save"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm break-words">{comment.content}</p>
                          )}
                        </div>

                        {/* three-dot menu always aligned to the right of the comment row */}
                        {dbUserId === comment.author.id && editingCommentId !== comment.id && (
                          <div className="ml-2 flex-shrink-0">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-primary p-0"
                                >
                                  <Ellipsis className="size-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-red-500 hover:text-red-600"
                                  onClick={() => setDeleteDialogCommentId(comment.id)}
                                  disabled={isDeletingComment}
                                >
                                  <Trash2Icon className="size-4 mr-2" />
                                  Delete
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-white hover:text-primary"
                                  onClick={() => {
                                    setEditingCommentId(comment.id)
                                    setEditCommentContent(comment.content)
                                  }}
                                >
                                  <Edit2Icon className="size-4 mr-2" />
                                  Edit
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Comment delete confirmation dialog (shared for all comments) */}
                <AlertDialog
                  open={!!deleteDialogCommentId}
                  onOpenChange={(open) => {
                    if (!open) setDeleteDialogCommentId(null);
                  }}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeletingComment}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleDeleteComment(deleteDialogCommentId)}
                        disabled={isDeletingComment}
                      >
                        {isDeletingComment ? <Loader2Icon className="size-4 animate-spin" /> : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {user ? (
                <div className="flex space-x-3">
                  {/* <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar> */}
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PostCard
