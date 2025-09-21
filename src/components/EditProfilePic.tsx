"use client"

import { UploadButton, UploadDropzone } from "@/lib/uploadthing"
import { XIcon } from "lucide-react"
import { useState } from "react"
import { useUser } from "@clerk/nextjs" // Adjust if you use a different auth system

interface ImageUploadProps {
  onchange: (url: string) => void
  value: string
  endpoint: "postImage" | "profileImage"
}
export type { ImageUploadProps }

const EditProfilePic = ({ endpoint, onchange, value }: ImageUploadProps) => {
  const [fileKey, setFileKey] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useUser() // Get current user

  const handleDelete = async () => {
    let keyToDelete = fileKey

    // If fileKey is not set, fetch from DB using user id
    if (!keyToDelete && user?.id) {
      try {
        const res = await fetch(`/api/user/${user.id}`)
        if (res.ok) {
          const dbUser = await res.json()
          keyToDelete = dbUser.imageKey
        }
      } catch (err) {
        console.error("Failed to fetch user for imageKey", err)
      }
    }

    // Fallback: try to extract from URL
    if (!keyToDelete && value) {
      keyToDelete = value.split("/").pop()?.split("?")[0] || null
    }

    if (keyToDelete) {
      await fetch("/api/delete-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyToDelete }),
      })
      // Optionally: clear imageKey in DB here
    }
    onchange("")
    setFileKey(null)
  }

  if (value) {
    return (
      <div className="relative size-40">
        <img
          src={value}
          alt="Upload"
          className="rounded-md size-40 object-cover"
        />
        <button
          onClick={handleDelete}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Desktop/Laptop */}
      <div className="hidden md:block relative">
        <UploadDropzone
          endpoint={endpoint}
          appearance={{
            button:
              "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-5 rounded transition-colors duration-200",
            container:
              "w-full h-50 flex flex-col justify-center items-center gap-2 rounded-md border border-cyan-300 bg-slate-800 p-4 overflow-hidden text-center",
            allowedContent:
              "flex h-8 items-center justify-center px-2 text-white text-sm",
          }}
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            setIsUploading(false)
            if (res?.[0]) {
              onchange(res[0].url)
              setFileKey(res[0].key) // for deleting the file later
            }
          }}
          onUploadError={(error: Error) => {
            console.log(error)
            setIsUploading(false)
          }}
        />

        {/* Overlay to block clicks during upload */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 cursor-not-allowed">
            <span className="text-white font-semibold animate-pulse">
              Uploading...
            </span>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="block md:hidden relative">
        <UploadButton
          endpoint={endpoint}
          appearance={{
            button:
              "ut-ready:bg-green-500 rounded-r-none bg-red-500 text-white font-semibold px-4 py-2",
            container:
              "w-max flex-row rounded-md border-cyan-300 bg-slate-800",
            allowedContent:
              "flex h-8 flex-col items-center justify-center px-2 text-white",
          }}
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            setIsUploading(false)
            if (res?.[0]) {
              onchange(res[0].url)
              setFileKey(res[0].key) // for deleting the file later
            }
          }}
          onUploadError={(error: Error) => {
            console.log(error)
            setIsUploading(false)
          }}
        />

        {/* Overlay for mobile */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 cursor-not-allowed">
            <span className="text-white font-semibold animate-pulse">
              Uploading...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditProfilePic