
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Posts from "./pages/Posts";
import PostDetails from "./pages/PostDetails";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:userId/posts" element={<Posts />} />
        <Route path="/posts/:postId" element={<PostDetails />} />
        <Route path="/posts" element={<Posts />} />
      </Routes>
    </Router>
  );
}
