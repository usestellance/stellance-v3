import React, { useEffect, useState } from "react";
import CommentCard from "@/features/invoice/components/comments/CommentCard";
import { Textarea } from "@repo/ui/textarea";
import { Button } from "@repo/ui/button";
import { useCreateComment, useGetComments } from "@/features/invoice/hooks";
import { Comment } from "@/features/invoice/types";
import { useSearchParams } from "next/navigation";

const CommentsPreview = ({ invoice_id }: { invoice_id: string }) => {
  const { data, error, isLoading } = useGetComments(invoice_id);
  const params = useSearchParams();
  const token = params.get("token");
  const { mutate, isPending, isSuccess } = useCreateComment(token || "");
  const [commentText, setCommentText] = useState("");
  const comments: Comment[] = data?.comments;

  // console.log(name, error, isLoading);

  const handleCreateComment = () => {
    // console.log(invoice_id)
    mutate({
      invoice_id,
      comment_text: commentText,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setCommentText("");
    }
  }, [isSuccess]);

  return (
    <div>
      <section className="flex justify-between">
        <h3 className="text-lg sm:text-3xl">Team Comments</h3>
        <div className="min-h-[30px] min-w-[30px] sm:min-w-10 sm:min-h-10 rounded-full flex justify-center items-center bg-primary-50 font-bold text-xs sm:text-base p-2 aspect-square">
          {data?.stats?.total_comments || 0}
        </div>
      </section>

      <section className="space-y-4 mt-5 sm:space-y-8 sm:mt-12">
        {comments?.map((c, i) => (
          <CommentCard key={i} comment={c} />
        ))}
      </section>

      <section className="mt-[15px] sm:mt-10 flex flex-col">
        <Textarea
          className="max-h-40"
          placeholder="Add comment..."
          maxLength={500}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <Button
          isLoading={isPending}
          onClick={handleCreateComment}
          className="mt-5 rounded-[10px] max-w-20 text-sm sm:mt-10 sm:max-w-[244px] place-self-end"
        >
          Post
        </Button>
      </section>
    </div>
  );
};

export default CommentsPreview;
