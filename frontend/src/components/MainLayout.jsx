import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CouponPopup from './CouponPopup';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <CouponPopup />
      <Footer />
    </div>
  );
};

export default MainLayout;
