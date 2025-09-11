import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Post {
  id: number;
  userId: number;
  title: string;
}

export default function UserPostsPage() {
  const { id } = useParams(); // userId from URL
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    fetch(`https://jsonplaceholder.typicode.com/posts?userId=${id}`)
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-4">Posts by User {id}</h1>

        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="bg-white shadow rounded-lg p-4 border hover:shadow-lg transition"
            >
              <h2 className="font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500">Post ID: {post.id}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
