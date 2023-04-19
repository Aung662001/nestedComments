import React, { useState } from "react";
import { IconBtn } from "./IconBtn";
import { FaHeart, FaTrash, FaReply, FaEdit } from "react-icons/fa";
import { usePost } from "../contexts/PostContext";
import CommentList from "./CommentList";
import "../style.css";
import CommentForm from "./CommentForm";
import { useAsyncFn } from "../hooks/useAsync";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../services/comment";
import { useUser } from "../hooks/useUser";
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
export default function Comment({ id, message, createdAt, parentId, user }) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { id: userId, name: userName } = user;
  const {
    post,
    getReplie,
    createLocalComment,
    updateLocalComment,
    deleteLocalComment,
  } = usePost();
  const createCommentFn = useAsyncFn(createComment);
  const commentUpdatefn = useAsyncFn(updateComment);
  const deleteCommentFn = useAsyncFn(deleteComment);
  const childComments = getReplie(id);
  const currentUser = useUser();
  let [areChildrenHidden, setAreChildrenHidden] = useState(false);
  function onCommentReply(message) {
    return createCommentFn
      .execute({ postId: post.id, message, parentId: id })
      .then((comment) => {
        setIsReplying(false);
        createLocalComment(comment);
      });
  }
  function onCommentUpdate(message) {
    return commentUpdatefn
      .execute({ postId: post.id, message, id })
      .then((comment) => {
        setIsEditing(false);
        updateLocalComment(id, comment.message);
      });
  }

  function onDeleteComment() {
    return deleteCommentFn
      .execute({ PostId: post.Id, id })
      .then((comment) => deleteLocalComment(comment.id));
  }

  return (
    <>
      <div className="comment">
        <div className="header">
          <span className="name">{userName}</span>
          <span className="time">
            {dateTimeFormatter.format(Date.parse(createdAt))}
          </span>
        </div>
        {isEditing ? (
          <CommentForm
            initialValue={message}
            autoFocus
            onSubmit={onCommentUpdate}
            loading={commentUpdatefn.loading}
            error={commentUpdatefn.error}
          />
        ) : (
          <div className="message">{message}</div>
        )}
        <div className="footer">
          <IconBtn Icon={FaHeart} aria-label="Like">
            2
          </IconBtn>
          <IconBtn
            Icon={FaReply}
            aria-label={isReplying ? "Cancel Reply" : "Reply"}
            onClick={() => setIsReplying((prev) => !prev)}
            isActive={isReplying}
          />

          {currentUser.id === user.id && (
            <>
              <IconBtn
                Icon={FaEdit}
                aria-label={isEditing ? "Cancel Edit" : "Edit"}
                onClick={() => setIsEditing((prev) => !prev)}
                isActive={isEditing}
              />
              <IconBtn
                Icon={FaTrash}
                aria-label="Delete"
                color="danger"
                onClick={onDeleteComment}
                disabled={deleteCommentFn.loading}
              />
            </>
          )}
        </div>
      </div>
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm
            autoFocus
            onSubmit={onCommentReply}
            loading={createCommentFn.loading}
            error={createCommentFn.error}
          />
        </div>
      )}

      {childComments?.length > 0 && (
        <>
          <div
            className={`nested-comments-stack ${
              areChildrenHidden ? "hide" : ""
            }`}
          >
            <button
              className="collapse-line"
              aria-label="Hide Replies"
              onClick={() => setAreChildrenHidden(true)}
            />
            <div className="nested-comments">
              <CommentList comments={childComments} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`}
            onClick={() => setAreChildrenHidden(false)}
          >
            Show Replies
          </button>
        </>
      )}
    </>
  );
}
