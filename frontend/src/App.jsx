import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Notfound from "./pages/Notfound";
import Home from "./pages/Home";
import PrivateRoute from "./pages/PrivateRoute";
import Category from "./components/Category";
import Client from "./components/Client";
import Services from "./components/Services";
import { Toaster } from "react-hot-toast";
import Billing from "./components/Billing";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Notfound />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/clients" element={<Client />} />
          <Route path="/billing" element={<Billing />} />

          <Route path="/services" element={<Services />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
