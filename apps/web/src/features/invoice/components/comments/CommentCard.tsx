import React from "react";
import { formatTimeAgo } from "@/lib/helpers";
import { Comment } from "@/features/invoice/types";
import { useAuthStore } from "@/features/auth/store";
import { useSearchParams } from "next/navigation";

type CommentCardProps = {
  comment: Comment;
};

const CommentCard = ({ comment }: CommentCardProps) => {
  const { credentials } = useAuthStore();
  const { commenter_name, comment_text, created_at, commenter_email } = comment;
  const params = useSearchParams();
  const name = params.get("name");
  const isCurrentUserComment = name
    ? name === commenter_name
    : credentials?.user?.profile?.email === commenter_email;

  return (
    <div
      className={`bg-neutral-comment rounded-[5px] px-2.5 py-[11px] sm:px-5 sm:py-5 ${isCurrentUserComment ? "border-l-4 border-primary-500" : ""}`}
    >
      <div className="flex justify-between items-center">
        <p className="font-medium text-xs sm:text-base text-primary-600">
          {isCurrentUserComment ? "Me" : commenter_name}
        </p>

        <p className="text-neutral-800 text-xs sm:text-sm">
          {formatTimeAgo(created_at)}
        </p>
      </div>

      <div className="text-xs mt-[5px] sm:text-xl">{comment_text}</div>
    </div>
  );
};

export default CommentCard;
