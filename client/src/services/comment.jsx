import { makeRequest } from "./makeRequest";

export default function createComment({ postId, parentId, message }) {
  makeRequest(`/posts/${postId}/comments`, {
    method: "POST",
    data: { message, parentId },
  });
}
