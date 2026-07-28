import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiGlobe, FiMenu, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { cartItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex flex-row justify-between items-center gap-4 w-full">
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 hover:text-primary transition-colors p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>

          {/* Logo */}
          <Link to="/" aria-label="Agrishield Home" className="flex items-center gap-2 shrink-0 group py-0.5">
            <img 
              src="/agri%20logo.png" 
              alt="Agrishield Logo"
              width="180"
              height="56"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-4 lg:space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('home')}</Link>
            <Link to="/shop" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('shop')}</Link>
            <Link to="/blog" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('blog') || 'Blog'}</Link>
            <Link to="/about" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('about')}</Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('contact')}</Link>
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden sm:block flex-grow max-w-xs lg:max-w-md w-full relative mx-2">
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              aria-label="Search agricultural products"
              className="w-full bg-gray-100 text-gray-800 border border-transparent focus:bg-white focus:border-primary rounded-full py-2 pl-4 pr-10 outline-none transition-all text-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors" aria-label="Search">
              <FiSearch size={18} />
            </button>
          </div>
          
          {/* Actions & Language */}
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5 text-gray-700 shrink-0">
            
            {/* Language Dropdown (Desktop & Mobile) */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-50 px-1 sm:px-2 py-1 sm:py-1.5 rounded-md border border-gray-200 hover:border-primary transition-colors cursor-pointer">
              <FiGlobe className="text-primary hidden sm:block" size={16} />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none text-[10px] sm:text-xs lg:text-sm outline-none cursor-pointer text-gray-700 font-bold sm:font-medium"
                aria-label="Language"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="kn">KN</option>
              </select>
            </div>

            <Link to="/cart" aria-label="Shopping Cart" className="hover:text-primary transition-colors relative flex items-center gap-1 p-1">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to={isAuthenticated ? "/profile" : "/login"} aria-label="User Account" className="hover:text-primary transition-colors flex items-center gap-1.5 p-1 font-bold text-sm">
              <FiUser size={22} />
              {isAuthenticated && user && (
                <span className="hidden sm:inline bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">
                  {user.name ? user.name.split(' ')[0] : 'Farmer'}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search (visible only on very small screens) */}
        <div className="sm:hidden mt-3 relative w-full flex">
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            aria-label="Search agricultural products"
            className="w-full bg-gray-100 text-gray-800 border border-transparent focus:bg-white focus:border-primary rounded-full py-2.5 pl-4 pr-10 outline-none transition-colors text-sm"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors" aria-label="Search">
            <FiSearch size={18} />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col space-y-4 pb-2 w-full overflow-hidden">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary font-medium px-2 py-1">{t('home')}</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary font-medium px-2 py-1">{t('shop')}</Link>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary font-medium px-2 py-1">{t('blog') || 'Blog'}</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary font-medium px-2 py-1">{t('about')}</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary font-medium px-2 py-1">{t('contact')}</Link>
          </nav>
        )}
      </div>

      {/* Secondary Scrolling Navbar with Left & Right Arrows */}
      <div className="bg-primary-dark text-white border-t border-green-800 relative shadow-inner">
        <div className="container mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-1 sm:gap-2">
          {/* Left Arrow Button */}
          <button 
            onClick={scrollLeft}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white rounded-full shadow-md transition-all active:scale-95 border border-white/20 shrink-0 z-10 focus:outline-none"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrollable Products List */}
          <ul 
            ref={scrollRef}
            className="flex items-center space-x-2.5 sm:space-x-3 overflow-x-auto whitespace-nowrap scrollbar-hide text-xs sm:text-sm font-medium scroll-smooth flex-grow py-1 px-1"
          >
            {[
              { id: 1, name: "WILD BOAR" },
              { id: 2, name: "Dr Mullu" },
              { id: 3, name: "SNAKE REPELLENT" },
              { id: 4, name: "MONKEY REPELLENT NUTS" },
              { id: 5, name: "RAT/SQUIRELL/RABBIT" },
              { id: 7, name: "SNAIL REPELLENT" },
              { id: 8, name: "RAT SPRAY" },
              { id: 9, name: "LIZZARD" }
            ].map((item, idx) => (
              <li key={idx} className="shrink-0">
                <Link 
                  to={`/product/${item.id}`} 
                  className="block px-3.5 py-2 bg-white/10 hover:bg-white/25 border border-white/25 rounded-lg transition-all shadow-sm active:bg-white/30"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Arrow Button */}
          <button 
            onClick={scrollRight}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white rounded-full shadow-md transition-all active:scale-95 border border-white/20 shrink-0 z-10 focus:outline-none"
            aria-label="Scroll right"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
