import React, { createContext, useContext, useMemo } from "react";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";
import { useParams } from "react-router-dom";
const Context = createContext();
export function usePost() {
  return useContext(Context);
}
export function PostProvider({ children }) {
  const { id } = useParams();
  const {
    value: post,
    loading,
    error,
    execute,
  } = useAsync(() => getPost(id), [id]);

  const commentsByParentId = useMemo(() => {
    if (post?.comments == null) return [];
    const group = {};
    post.comments.forEach((comment) => {
      // if (!group[comment.parentId]) {
      //   group[comment.parentId] = [];
      // }

      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [post?.comments]);

  function getReplie(parentId) {
    return commentsByParentId[parentId];
  }

  return (
    <Context.Provider
      value={{
        post: { id, ...post },
        getReplie,
        rootComment: commentsByParentId[null],
      }}
    >
      {loading ? (
        <h1>Loading...</h1>
      ) : error ? (
        <h1 className="error-msg">Error</h1>
      ) : (
        children
      )}
    </Context.Provider>
  );
}
