import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import PersonaSetting from "./pages/PersonaSetting";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/persona",
    element: (
      <ProtectedRoute>
        <PersonaSetting />
      </ProtectedRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: "/history",
    element: (
      <ProtectedRoute>
        <History />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
]);
