import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">

        {/* Users Card */}
        <div className="p-10 rounded-3xl shadow-lg bg-white/80 backdrop-blur-md hover:shadow-2xl transition transform hover:-translate-y-2 duration-300 flex flex-col items-center text-center">
          <div className="text-green-500 text-6xl mb-4">👤</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Users</h2>
          <p className="text-gray-600 mb-6">
            Discover our amazing community of users with their details and profiles.
          </p>
          <Link 
            to="/users" 
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:opacity-90 transition"
          >
            View Users
          </Link>
        </div>

        {/* Posts Card */}
        <div className="p-10 rounded-3xl shadow-lg bg-white/80 backdrop-blur-md hover:shadow-2xl transition transform hover:-translate-y-2 duration-300 flex flex-col items-center text-center">
          <div className="text-blue-500 text-6xl mb-4">📝</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Posts</h2>
          <p className="text-gray-600 mb-6">
            Explore posts and see what people are sharing and writing about.
          </p>
          <Link 
            to="/posts" 
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:opacity-90 transition"
          >
            View Posts
          </Link>
        </div>

      </div>
    </div>
  )
}
