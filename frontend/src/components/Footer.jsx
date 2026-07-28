import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white pt-12 pb-8 w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          <div className="flex flex-col">
            <Link to="/" aria-label="Agrishield Home" className="inline-block mb-4">
              <img 
                src="/agri%20logo.png" 
                alt="Agrishield Logo"
                width="180"
                height="56"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain bg-white/95 px-3 py-1.5 rounded-xl shadow-md transition-transform duration-300 hover:scale-105"
              />
            </Link>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-4">Premium agriculture e-commerce platform providing the best seeds, fertilizers, and farm equipment directly to farmers.</p>
            <div className="text-xs md:text-sm text-gray-200 space-y-1.5 border-t border-green-800 pt-4">
              <p className="font-bold text-white">Srii Veerabhadreshwara Krushi Kendra</p>
              <p className="text-gray-300">Alkola Circle, Sagara Road, Shivamogga-577204</p>
              <p className="text-gray-300">📞 9739230638</p>
              <p className="text-gray-300">✉️ anand.ur38@gmail.com</p>
            </div>
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-secondary">Quick Links</h2>
            <ul className="space-y-2 text-gray-200 text-sm md:text-base">
              <li><Link to="/shop" className="inline-block py-0.5 text-gray-200 hover:text-yellow-400 hover:translate-x-1.5 transition-all duration-200 select-none outline-none focus:outline-none bg-transparent hover:bg-transparent">Shop Products</Link></li>
              <li><Link to="/about" className="inline-block py-0.5 text-gray-200 hover:text-yellow-400 hover:translate-x-1.5 transition-all duration-200 select-none outline-none focus:outline-none bg-transparent hover:bg-transparent">About Us</Link></li>
              <li><Link to="/contact" className="inline-block py-0.5 text-gray-200 hover:text-yellow-400 hover:translate-x-1.5 transition-all duration-200 select-none outline-none focus:outline-none bg-transparent hover:bg-transparent">Contact</Link></li>
            </ul>
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-secondary">Customer Service</h2>
            <ul className="space-y-2 text-gray-200 text-sm md:text-base">
              <li><Link to="/faq" className="inline-block py-0.5 text-gray-200 hover:text-yellow-400 hover:translate-x-1.5 transition-all duration-200 select-none outline-none focus:outline-none bg-transparent hover:bg-transparent">FAQ</Link></li>
              <li><Link to="/shipping" className="inline-block py-0.5 text-gray-200 hover:text-yellow-400 hover:translate-x-1.5 transition-all duration-200 select-none outline-none focus:outline-none bg-transparent hover:bg-transparent">Shipping Policy</Link></li>
              <li><Link to="/returns" className="inline-block py-0.5 text-gray-200 hover:text-yellow-400 hover:translate-x-1.5 transition-all duration-200 select-none outline-none focus:outline-none bg-transparent hover:bg-transparent">Return Policy</Link></li>
            </ul>
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-secondary">Newsletter</h2>
            <p className="text-gray-300 mb-4 text-sm md:text-base">Subscribe to get updates on new products and offers.</p>
            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-0">
              <input 
                type="email" 
                placeholder="Your email" 
                aria-label="Your email address for newsletter"
                className="px-4 py-2.5 sm:py-2 w-full text-gray-900 rounded-md sm:rounded-r-none sm:rounded-l-md focus:outline-none text-sm" 
              />
              <button className="bg-secondary text-primary-dark px-4 py-2.5 sm:py-2 rounded-md sm:rounded-l-none sm:rounded-r-md font-bold hover:bg-yellow-500 transition-colors w-full sm:w-auto shrink-0 text-sm">
                Subscribe
              </button>
            </div>
          </div>

        </div>
        
        <div className="mt-12 pt-8 border-t border-green-800 text-center text-gray-200 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Agrishield. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="inline-block py-0.5 text-gray-200 hover:text-yellow-400 transition-colors select-none outline-none focus:outline-none bg-transparent hover:bg-transparent">Privacy Policy</Link>
            <Link to="/terms" className="inline-block py-0.5 text-gray-200 hover:text-yellow-400 transition-colors select-none outline-none focus:outline-none bg-transparent hover:bg-transparent">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
