import React, { useContext } from "react";
import { usePost } from "../contexts/PostContext";
import "../style.css";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import { useAsyncFn } from "../hooks/useAsync";
import createComment from "../services/comment";

export default function Post() {
  const { post, rootComment } = usePost();
  const {
    loading,
    error,
    execute: submitCommentfn,
  } = useAsyncFn(createComment);

  function onCommentCreate(message) {
    submitCommentfn({ postId: post.id, message })
      .then((comment) => {
        console.log(comment);
      })
      .catch((err) => {
        console.error("Errorrrrrr");
      });
  }
  return (
    <>
      <h1>{post.title}</h1>
      <section>{post.body}</section>
      <h2 className="comment-title">Comments</h2>
      <CommentForm loading={loading} error={error} onSubmit={onCommentCreate} />
      <section>
        {rootComment != null && rootComment.length > 0 && (
          <div className="mt-4">
            <CommentList comments={rootComment} />
          </div>
        )}
      </section>
    </>
  );
}
