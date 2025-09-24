import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from '../context/AuthContext';
import styles from '../pages/manager/adminPages.module.css';

/**
 * The main layout component for the app.
 * This component renders the Header, Navbar, main content (via Outlet) and Footer.
 * It is used as the root component for all routes.

 * @returns {JSX.Element} The rendered Layout component.
 */
const Layout = () => {
  const { user: loggedInUser } = useAuth();
  const location = useLocation();
  const userType =
    loggedInUser?.role ||
    (location.pathname.includes("manager")
      ? "Admin"
      : location.pathname.includes("teacher")
      ? "Teacher"
      : "Examinee");

  // Check if current page is an admin page
  const isAdminPage = location.pathname.includes('/manager') || location.pathname.includes('/admin');

  return (
    <>
      {isAdminPage && <div className={styles.adminBackground} />}
      <Header/>
      <Navbar userType={userType} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
