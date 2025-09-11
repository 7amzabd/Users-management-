import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex gap-6">
      <Link to="/" className="font-bold text-blue-600">Home</Link>
      <Link to="/users" className="text-gray-700">Users</Link>
      <Link to="/posts" className="text-gray-700">Posts</Link>
    </nav>
  );
}
