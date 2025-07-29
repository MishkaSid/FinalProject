import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import Footer from '../components/footer/Footer';
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from '../context/AuthContext';

/**
 * The main layout component for the app.
 * This component renders the Header, Navbar, main content (via Outlet) and Footer.
 * It is used as the root component for all routes.

 * @returns {JSX.Element} The rendered Layout component.
 */

const Layout = () => {
  const { user: loggedInUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const userType = loggedInUser?.role || (location.pathname.includes('manager') ? 'Admin' 
  : location.pathname.includes('teacher') ? 'Teacher' 
  : 'Examinee');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header/>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userType={userType} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;

