import React from "react";
import AdminNavbar from "./AdminNavbar";
import UserNavbar from "./UserNavbar";

interface NavbarProps {
  userRole: "admin" | "bendahara";
}

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  if (userRole === "admin") {
    return <AdminNavbar />;
  } else if (userRole === "bendahara") {
    return <UserNavbar />; // Gunakan navbar khusus bendahara
  } else {
    return <UserNavbar />; // Default navbar jika ada role lain di masa depan
  }
};

export default Navbar;
