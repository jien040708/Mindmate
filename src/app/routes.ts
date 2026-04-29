import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import PersonaSetting from "./pages/PersonaSetting";
import Chat from "./pages/Chat";
import History from "./pages/History";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/persona",
    Component: PersonaSetting,
  },
  {
    path: "/chat",
    Component: Chat,
  },
  {
    path: "/history",
    Component: History,
  },
]);
