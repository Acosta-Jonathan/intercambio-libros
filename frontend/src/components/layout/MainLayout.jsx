import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => (
  <>
    <Navbar />
    <main className="main-content" style={{ padding: "1rem" }}>
      <Outlet />
    </main>
  </>
);

export default MainLayout;
