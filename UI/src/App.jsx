import HomePage from "./routes/homepage/homePage.jsx";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ListPage from "./routes/listPage/listPage.jsx";
import Layout from "./routes/layout/layout.jsx";
import SinglePage from "./routes/singlePage/SinglePage.jsx";
import "leaflet/dist/leaflet.css";
import ProfilePage from "./routes/profilePage/ProfilePage.jsx";
import SignIn from "./routes/signIn/SignIn.jsx";
import SignUp from "./routes/signUp/SignUp.jsx"; // Add this import
import About from "./routes/about/About.jsx";
import Contact from "./routes/contact/Contact.jsx";
import Agents from "./routes/agents/Agents.jsx";
import AgentProfile from "./routes/agents/AgentProfile.jsx";
import ForgotPassword from "./routes/forgotPassword/ForgotPassword.jsx";
import AadhaarVerify from "./routes/aadhaarVerify/AadhaarVerify.jsx";
import AdminDashboard from "./routes/admin/AdminDashboard.jsx";
import AdminLogin from "./routes/admin/AdminLogin.jsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/list",
          element: <ListPage />,
        },
        {
          path: "/about",
          element: <About />,
        },
        {
          path: "/contact",
          element: <Contact />,
        },
        {
          path: "/agents",
          element: <Agents />,
        },
        {
          path: "/agents/:id",
          element: <AgentProfile />,
        },
        {
          path: "/:id",
          element: <SinglePage />,
        },
        {
          path: "profile",
          element: <ProfilePage />
        },
        {
          path: "signin",
          element: <SignIn />
        }
        ,
        {
          path: "signup", // Add this route
          element: <SignUp />
        },
        {
          path: "forgot-password",
          element: <ForgotPassword />
        },
        {
          path: "verify-aadhaar",
          element: <AadhaarVerify />
        }
      ]
    },
    {
      path: "/admin/dashboard",
      element: <AdminDashboard />
    },
    {
      path: "/admin/login",
      element: <AdminLogin />
    }
  ]);

  return (
    <RouterProvider router = {router} />
  )
}

export default App