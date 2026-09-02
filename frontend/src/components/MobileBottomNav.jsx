import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiPackage, FiBookOpen } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const currentPath = location.pathname;

  const navItems = [
    {
      id: 'home',
      label: t('home') || 'Home',
      icon: FiHome,
      path: '/',
      isActive: currentPath === '/'
    },
    {
      id: 'categories',
      label: t('categories') || 'Categories',
      icon: FiGrid,
      path: '/shop',
      isActive: currentPath === '/shop'
    },
    {
      id: 'my_orders',
      label: t('my_orders') || 'My Orders',
      icon: FiPackage,
      path: '/profile',
      isActive: currentPath === '/profile' || currentPath === '/cart'
    },
    {
      id: 'blogs',
      label: t('blog') || 'Blogs',
      icon: FiBookOpen,
      path: '/blog',
      isActive: currentPath.startsWith('/blog')
    }
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] h-[60px] flex items-center justify-around px-1"
    >
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const active = item.isActive;
        return (
          <Link
            key={item.id}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              active 
                ? 'text-primary font-bold scale-105' 
                : 'text-gray-500 hover:text-primary font-medium'
            }`}
          >
            <IconComponent className={`w-5 h-5 mb-0.5 ${active ? 'stroke-[2.5px] text-primary' : 'stroke-[1.8px]'}`} />
            <span className="text-[11px] leading-tight tracking-tight text-center truncate max-w-[64px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
