import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiGlobe, FiMenu, FiX } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { cartItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <Link to="/" className="text-xl md:text-2xl font-bold text-primary flex items-center gap-1 md:gap-2 shrink-0">
            <span className="text-2xl md:text-3xl text-primary-dark">🌿</span>
            <span className="hidden sm:inline">Agrishield</span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-4 lg:space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('home')}</Link>
            <Link to="/shop" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('shop')}</Link>
            <Link to="/about" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('about')}</Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('contact')}</Link>
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden sm:block flex-grow max-w-xs lg:max-w-md w-full relative mx-2">
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
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

            <Link to="/cart" className="hover:text-primary transition-colors relative flex items-center gap-1 p-1">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to={isAuthenticated ? "/profile" : "/login"} className="hover:text-primary transition-colors flex items-center gap-1.5 p-1 font-bold text-sm">
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
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary font-medium px-2 py-1">{t('about')}</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary font-medium px-2 py-1">{t('contact')}</Link>
          </nav>
        )}
      </div>

      {/* Secondary Scrolling Navbar */}
      <div className="bg-primary-dark text-white border-t border-green-800">
        <div className="container mx-auto">
          <ul className="flex items-center md:justify-center space-x-3 md:space-x-4 px-4 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide text-sm font-medium">
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
              <li key={idx}>
                <Link 
                  to={`/product/${item.id}`} 
                  className="block px-4 py-2 bg-white/5 hover:bg-white/20 border border-white/20 rounded-md transition-all shadow-sm"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
