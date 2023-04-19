import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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

  const [comments, setComments] = useState([]);

  const commentsByParentId = useMemo(() => {
    if (comments == null) return [];
    const group = {};
    comments.forEach((comment) => {
      // if (!group[comment.parentId]) {
      //   group[comment.parentId] = [];
      // }

      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [comments]);
  useEffect(() => {
    if (post?.comments == null) return;
    setComments(post.comments);
  }, [post?.comments]);

  function createLocalComment(comment) {
    setComments((prevComments) => {
      return [comment, ...prevComments];
    });
  }

  function updateLocalComment(id, message) {
    setComments((prevComments) => {
      return prevComments.map((comments) => {
        if (comments.id === id) {
          return { ...comments, message };
        } else {
          return comments;
        }
      });
    });
  }

  function deleteLocalComment(id) {
    setComments((prevComments) => {
      return prevComments.filter((comments) => {
        return id !== comments.id;
      });
    });
  }

  function getReplie(parentId) {
    return commentsByParentId[parentId];
  }

  return (
    <Context.Provider
      value={{
        post: { id, ...post },
        getReplie,
        rootComment: commentsByParentId[null],
        createLocalComment,
        updateLocalComment,
        deleteLocalComment,
      }}
    >
      {loading ? (
        <h1>Loading...</h1>
      ) : error ? (
        <h1 className="error-msg">{error.statusText}</h1>
      ) : (
        children
      )}
    </Context.Provider>
  );
}
