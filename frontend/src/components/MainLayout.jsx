import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CouponPopup from './CouponPopup';
import FloatingContact from './FloatingContact';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />
      <main id="main-content" role="main" aria-label="Main Content" className="flex-grow">
        <Outlet />
      </main>
      <CouponPopup />
      <FloatingContact />
      <Footer />
    </div>
  );
};

export default MainLayout;
