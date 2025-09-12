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
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    // ✅ Fetch posts
    useEffect(() => {
        setLoading(true);
        fetch("https://jsonplaceholder.typicode.com/posts")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch posts");
                return res.json();
            })
            .then((data) => setPosts(data.slice()))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // ✅ DELETE
    const handleDeletePost = (id: number) => {
        if (confirm("Are you sure you want to delete this post?")) {
            setPosts(posts.filter((p) => p.id !== id));
        }
    };

    // ✅ UPDATE
    const handleUpdatePost = () => {
        if (!editingPost) return;
        if (!editingPost.title.trim()) {
            alert("Title cannot be empty");
            return;
        }
        setPosts(posts.map((p) => (p.id === editingPost.id ? editingPost : p)));
        setEditingPost(null);
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
                                <td className="p-3 border">
                                    {editingPost?.id === post.id ? (
                                        <input
                                            type="text"
                                            value={editingPost.title}
                                            onChange={(e) =>
                                                setEditingPost({ ...editingPost, title: e.target.value })
                                            }
                                            className="border p-2 rounded w-full"
                                        />
                                    ) : (
                                        post.title
                                    )}
                                </td>
                                <td className="p-3 border">
                                    <div className="flex gap-2">
                                        {editingPost?.id === post.id ? (
                                            <>
                                                <button
                                                    onClick={handleUpdatePost}
                                                    className="px-3 py-1 bg-green-500 text-white rounded-lg shadow hover:scale-105 transition"
                                                >
                                                    💾 Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingPost(null)}
                                                    className="px-3 py-1 bg-gray-400 text-white rounded-lg shadow hover:scale-105 transition"
                                                >
                                                    ✖️ Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setEditingPost(post)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:scale-105 transition"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:scale-105 transition"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
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
