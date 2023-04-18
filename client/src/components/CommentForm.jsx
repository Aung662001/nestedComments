import React, { useState } from "react";

export default function CommentForm({
  loading,
  error,
  autoFocus,
  onSubmit,
  initialValue = "",
}) {
  function submitHandler(e) {
    e.preventDefault();
    onSubmit(message).then(() => setMessage(""));
  }
  const [message, setMessage] = useState(initialValue);
  return (
    <form onSubmit={(e) => submitHandler(e)}>
      <div className="comment-form-row">
        <textarea
          autoFocus={autoFocus}
          value={message}
          className="message-input"
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <button className="btn " disabled={loading} type="submit">
          {loading ? "Loading..." : "Post"}
        </button>
      </div>
      <div className="error-msg">{error}</div>
    </form>
  );
}
