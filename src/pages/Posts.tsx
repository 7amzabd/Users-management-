import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ userId: 1, title: "", body: "" });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // ✅ Fetch only 10 posts
  useEffect(() => {
    setLoading(true);
    fetch("https://jsonplaceholder.typicode.com/posts?")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then((data) => setPosts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // DELETE
  const handleDeletePost = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        ⏳ Loading posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow hover:scale-105 hover:from-gray-500 hover:to-gray-600 transition-all duration-200"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">📑 Posts</h1>


        {/* Posts Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border">User ID</th>
                <th className="p-3 border">Post ID</th>
                <th className="p-3 border">Title</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{post.userId}</td>
                  <td className="p-3 border">{post.id}</td>
                  <td className="p-3 border">{post.title}</td>
                  <td className="p-3 border">
                    {
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:scale-105 transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
