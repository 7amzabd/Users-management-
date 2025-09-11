import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: "", username: "", email: "" });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addPost, setAddPost] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // CREATE user
  const handleAddUser = () => {
    if (!newUser.name || !newUser.username || !newUser.email) {
      alert("All fields are required.");
      return;
    }
    const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newEntry = { id, ...newUser };
    setUsers([...users, newEntry]);
    setNewUser({ name: "", username: "", email: "" });
    setIsAdding(false);
  };

  // UPDATE user
  const handleUpdateUser = () => {
    if (!editingUser) return;
    if (!editingUser.name || !editingUser.username || !editingUser.email) {
      alert("All fields are required.");
      return;
    }
    setUsers(users.map((user) => (user.id === editingUser.id ? editingUser : user)));
    setEditingUser(null);
  };

  // DELETE user
  const handleDeleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  // Close modal with Escape
  useEffect(() => {
    if (!isAdding) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAdding(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdding]);

  // فتح البوستات الخاصة بالمستخدم
  const handleViewPosts = (user: User) => {
    setSelectedUser(user);
    setPostsLoading(true);
    fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .finally(() => setPostsLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* رجوع */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow hover:scale-105 hover:from-gray-500 hover:to-gray-600 transition-all duration-200"
        >
          ← Back
        </button>

        {/* العنوان + زر إضافة */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Directory</h1>
          <button
            onClick={() => {
              setNewUser({ name: "", username: "", email: "" });
              setIsAdding(true);
            }}
              className="
            px-4 py-2 rounded-lg
            bg-[#575759] text-white font-semibold shadow
            transition-all duration-200
            hover:scale-105
            hover:bg-[#401F0C]
            ">

            ➕ Add User
          </button>
        </div>

        {/* Loading & Error */}
        {loading && <p className="text-gray-600">Loading users...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {/* User List */}
        {!loading && !error && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
              >
                {editingUser?.id === user.id ? (
                  // ✨ Edit Mode
                  <>
                    <p className="text-sm text-gray-500 mb-2">ID: {editingUser.id}</p>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, name: e.target.value })
                      }
                      className="border p-2 rounded w-full mb-2"
                    />
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, username: e.target.value })
                      }
                      className="border p-2 rounded w-full mb-2"
                    />
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, email: e.target.value })
                      }
                      className="border p-2 rounded w-full mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleUpdateUser}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-gray-300 to-gray-500 text-black shadow hover:bg-green-600 hover:scale-105 transition"
                      >
                         Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow hover:scale-105 transition"
                      >
                         Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  // ✨ Normal Mode
                  <>
                    {/* Avatar Circle */}
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg shadow">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <h2 className="text-lg font-semibold text-gray-800">
                          {user.name}
                        </h2>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <p className="text-sm text-blue-600 mb-4">{user.email}</p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="flex-1 px-3 py-1 rounded-lg bg-yellow-400 text-white shadow hover:scale-105 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex-1 px-3 py-1 rounded-lg bg-red-500 text-white shadow hover:scale-105 transition"
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={() => handleViewPosts(user)}
                        className="w-full px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow hover:scale-105 transition"
                      >
                        📑 View Posts
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add User Modal */}
      {isAdding && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <input
              type="text"
              placeholder="Full name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="email"
              placeholder="you@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow hover:scale-105 hover:from-gray-500 hover:to-gray-600 transition-all duration-200"
              >
                ✖️ Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:opacity-90 transition"
              >
                ✅ Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Popup */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              📑 Posts by {selectedUser.name}
            </h2>
            {postsLoading ? (
              <p className="text-gray-500">⏳ Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-400">No posts found.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto space-y-3">
                {posts.map((post) => (
                  <li
                    key={post.id}
                    className="border rounded-lg p-3 hover:bg-gray-50"
                  >
                    <p className="text-sm text-gray-400">Post #{post.id}</p>
                    <h3 className="font-semibold text-gray-800">{post.title}</h3>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow hover:scale-105 hover:from-gray-500 hover:to-gray-600 transition-all duration-200"
              >
                ← Back
              </button>
              <button
                onClick={() => navigate(`/users/${selectedUser.id}/posts`)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-indigo-600 hover:to-blue-700 transition-all duration-200"
              >
                Go to Posts Page →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
