import React, { useEffect, useState } from "react";
import { getPosts } from "../services/posts";
import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
export default function PostLists() {
  const { error, value: posts, loading } = useAsync(getPosts);
  if (error) return <div className="error-message">{error}</div>;
  if (loading) return <h2>Loading...</h2>;
  return (
    <>
      {posts.map((post) => {
        return (
          <h1 key={post.id}>
            <Link to={`posts/${post.id}`}>{post.title}</Link>
          </h1>
        );
      })}
    </>
  );
}
