import React from "react";
import Comment from "./Comment";

export default function CommentList({ comments }) {
  console.log(comments);
  return (
    <>
      {comments !== null &&
        comments.map((comment) => {
          return (
            <div key={comment.id} className="comment-stack">
              <Comment {...comment} />
            </div>
          );
        })}
    </>
  );
}
