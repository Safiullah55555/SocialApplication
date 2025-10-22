// // "use client";

// // import { Ellipsis, Loader2Icon, Trash2Icon } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import {
// //         AlertDialog,
// //         AlertDialogAction,
// //         AlertDialogCancel,
// //         AlertDialogContent,
// //         AlertDialogDescription,
// //         AlertDialogFooter,
// //         AlertDialogHeader,
// //         AlertDialogTitle,
// //         AlertDialogTrigger,
// // } from "@/components/ui/alert-dialog";

// // interface DeleteAlertDialogProps {
// //         isDeleting: boolean;
// //         onDelete: () => Promise<void>;
// //         title?: string;
// //         description?: string;
// // }

// // export function DeleteAlertDialog({
// //         isDeleting,
// //         onDelete,
// //         title = "Delete Post",
// //         description = "This action cannot be undone.",
// // }: DeleteAlertDialogProps) {
// //         return (
// //                 <AlertDialog>
// //                         <AlertDialogTrigger asChild>
// //                                 <Button
// //                                         variant="ghost"
// //                                         size="sm"
// //                                         className="text-muted-foreground hover:text-red-500 -mr-2"
// //                                 >
// //                                         {isDeleting ? (
// //                                                 <Loader2Icon className="size-4 animate-spin" />
// //                                         ) : (
// //                                                 <Trash2Icon className="size-4" />
// //                                         )}
// //                                 </Button>
// //                         </AlertDialogTrigger>
// //                         <AlertDialogContent>
// //                                 <AlertDialogHeader>
// //                                         <AlertDialogTitle>{title}</AlertDialogTitle>
// //                                         <AlertDialogDescription>{description}</AlertDialogDescription>
// //                                 </AlertDialogHeader>
// //                                 <AlertDialogFooter>
// //                                         <AlertDialogCancel>Cancel</AlertDialogCancel>
// //                                         <AlertDialogAction
// //                                                 onClick={onDelete}
// //                                                 className="bg-red-500 hover:bg-red-600"
// //                                                 disabled={isDeleting}
// //                                         >
// //                                                 {isDeleting ? "Deleting..." : "Delete"}
// //                                         </AlertDialogAction>
// //                                 </AlertDialogFooter>
// //                         </AlertDialogContent>
// //                 </AlertDialog>
// //         );
// // }

// ..............................>>>>>>>>>>>>confirm code.
"use client";

import { useState } from "react";
import { Edit2Icon, Ellipsis, Loader2Icon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DeleteAlertDialogProps {
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  title?: string;
  description?: string;
}
// Add this prop to the interface
interface DeleteAlertDialogProps {
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onEdit?: () => void; // New optional prop
  title?: string;
  description?: string;
}

export function DeleteAlertDialog({
  isDeleting,
  onDelete,
  onEdit,
  title = "Delete Post",
  description = "This action cannot be undone.",
}: DeleteAlertDialogProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <>
      {/* Ellipsis menu */}
      <Popover open={openMenu} onOpenChange={setOpenMenu}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
          >
            <Ellipsis className="size-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto text-center content-center p-0 space-y-1 bg-slate-800">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={() => {
              setOpenMenu(false);
              setOpenDialog(true);
            }}
          >
            <Trash2Icon className="size-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:text-primary"
            onClick={() => {
              setOpenMenu(false);
              if (onEdit) onEdit();
            }}
          >
            <Edit2Icon className="size-4 mr-2" />
            Edit
          </Button>
        </PopoverContent>
      </Popover>

      {/* Delete confirmation dialog */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
// ....................>>>>>>>>>>>>confirm code .