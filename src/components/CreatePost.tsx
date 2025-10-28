"use client";

// import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, VideoIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";

interface CreatePostProps {
        userImage?: string | null
        onPostCreated?: (post: any) => void
}

const CreatePost = ({ userImage }: CreatePostProps) => {
        // const { user } = useUser()
        const [content, setContent] = useState("")
        const [imageUrl, setImageUrl] = useState("")
        const [isPosting, setIsPosting] = useState(false)
        const [showImageUpload, setShowImageUpload] = useState(false)
        const [uploadType, setUploadType] = useState<"image" | "video" | null>(null);

        const handleSubmit = async () => {
                if (!content.trim() && !imageUrl) return;

                setIsPosting(true)
                try {
                        const result = await createPost(content, imageUrl)
                        if (result?.success && result?.post) {
                                //reset the form.
                                setContent("")
                                setImageUrl("")
                                setUploadType(null);
                                setShowImageUpload(false)

                                toast.success("Post created successfully!")
                                // Notify parent component about the new post
                                window.dispatchEvent(
                                        new CustomEvent("new-post", { detail: result.post })
                                );
                        }

                } catch (error) {
                        console.error("Error creating post (CreatePost.tsx):", error);

                        toast.error("Failed to create post. Please try again.")
                } finally {
                        setIsPosting(false)
                }
        }

        return (
                <Card className="mb-6">
                        <CardContent className="pt-6">
                                <div className="space-y-4">
                                        <div className="flex space-x-5">
                                                <Avatar className="w-10 h-10">
                                                        {/* <AvatarImage src={user?.imageUrl || "/avatar.png"} /> */}
                                                        <AvatarImage src={userImage || "/avatar.png"} />
                                                </Avatar>
                                                <Textarea
                                                        placeholder="What's on your mind?"
                                                        className="min-h-[50px] resize-none border-none focus-visible:ring-0 p-4 text-base"
                                                        value={content}
                                                        onChange={(e) => setContent(e.target.value)}
                                                        disabled={isPosting}
                                                />
                                        </div>

                                        {(showImageUpload || imageUrl) && (
                                                <div className="border rounded-lg p-4 flex justify-center" >
                                                        <ImageUpload
                                                                // endpoint="postImage"
                                                                endpoint={uploadType === "video" ? "videoUploader" : "postImage"}
                                                                value={imageUrl}
                                                                onchange={(url) => {
                                                                        setImageUrl(url);
                                                                        if (!url) setShowImageUpload(false); setUploadType(null);
                                                                }}
                                                        />
                                                </div>

                                        )}




                                        <div className="flex items-center justify-between border-t pt-4">
                                                <div className="flex space-x-2">
                                                        <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-muted-foreground hover:text-primary"
                                                                onClick={() => setShowImageUpload(!showImageUpload)}
                                                                disabled={isPosting}
                                                        >
                                                                <ImageIcon className="size-4 mr-2" />
                                                                Photo
                                                        </Button>
                                                        <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className={`text-muted-foreground hover:text-primary ${uploadType === "video" && "text-muted-foreground hover:text-primary"
                                                                        }`}
                                                                onClick={() => {
                                                                        setUploadType("video");
                                                                        setShowImageUpload(true);
                                                                }}
                                                                disabled={isPosting}
                                                        >
                                                                <VideoIcon className="size-4 mr-2" />
                                                                Video
                                                        </Button>
                                                </div>
                                                <Button
                                                        className="flex items-center"
                                                        onClick={handleSubmit}
                                                        disabled={(!content.trim() && !imageUrl) || isPosting}
                                                >
                                                        {isPosting ? (
                                                                <>
                                                                        <Loader2Icon className="size-4 mr-2 animate-spin" />
                                                                        Posting...
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <SendIcon className="size-4 mr-2" />
                                                                        Post
                                                                </>
                                                        )}
                                                </Button>
                                        </div>
                                </div>
                        </CardContent>
                </Card>
        )
}

export default CreatePost