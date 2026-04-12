import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Feed from "./pages/Feed.jsx";
import Profile from "./pages/Profile.jsx";
import Chat from "./pages/Chat.jsx";
import ChatPlaceholder from "./pages/ChatPlaceholder.jsx";
import ChatThread from "./pages/ChatThread.jsx";
import Notifications from "./pages/Notifications.jsx";
import PostPage from "./pages/PostPage.jsx";

function Protected({ children }) {
  const token = useSelector((s) => s.auth.accessToken);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <Protected>
                <Feed />
              </Protected>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          <Route
            path="/post/:id"
            element={
              <Protected>
                <PostPage />
              </Protected>
            }
          />
          <Route
            path="/notifications"
            element={
              <Protected>
                <Notifications />
              </Protected>
            }
          />
          <Route
            path="/chat"
            element={
              <Protected>
                <Chat />
              </Protected>
            }
          >
            <Route index element={<ChatPlaceholder />} />
            <Route path=":conversationId" element={<ChatThread />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
