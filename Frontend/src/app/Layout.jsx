import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Navbar from '../components/sidebar/Sidebar';
import Footer from '../components/footer/Footer';

/**
 * The main layout component for the app.
 * This component renders the Header, Navbar, main content (via Outlet) and Footer.
 * It is used as the root component for all routes.

 * @returns {JSX.Element} The rendered Layout component.
 */
const Layout = () => {
  return (
    <>
      <Header />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
