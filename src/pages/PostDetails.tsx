import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export default function PostDetails() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError("No postId provided");
      setLoading(false);
      return;
    }

    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch post");
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [postId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">
        ⏳ Loading post...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
        <p className="mb-4">⚠️ {error || "Post not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          📝 {post.title}
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed">{post.body}</p>
      </div>
    </div>
  );
}
