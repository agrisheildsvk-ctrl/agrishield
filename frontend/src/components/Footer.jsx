const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white pt-12 pb-8 w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          <div className="flex flex-col">
            <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">🌿 Agrishield</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">Premium agriculture e-commerce platform providing the best seeds, fertilizers, and farm equipment directly to farmers.</p>
            <div className="text-xs md:text-sm text-gray-300 space-y-1.5 border-t border-green-800 pt-4">
              <p className="font-bold text-white">Srii Veerabhadreshwara Krushi Kendra</p>
              <p className="text-gray-400">Alkola Circle, Sagara Road, Shivamogga-577204</p>
              <p className="text-gray-400">📞 9739230638</p>
              <p className="text-gray-400">✉️ anand.ur38@gmail.com</p>
            </div>
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-lg font-bold mb-4 text-secondary">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li><a href="/shop" className="hover:text-white transition-colors">Shop Products</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-lg font-bold mb-4 text-secondary">Customer Service</h4>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="/returns" className="hover:text-white transition-colors">Return Policy</a></li>
            </ul>
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-lg font-bold mb-4 text-secondary">Newsletter</h4>
            <p className="text-gray-300 mb-4 text-sm md:text-base">Subscribe to get updates on new products and offers.</p>
            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-0">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2.5 sm:py-2 w-full text-gray-900 rounded-md sm:rounded-r-none sm:rounded-l-md focus:outline-none text-sm" 
              />
              <button className="bg-secondary text-primary-dark px-4 py-2.5 sm:py-2 rounded-md sm:rounded-l-none sm:rounded-r-md font-bold hover:bg-yellow-500 transition-colors w-full sm:w-auto shrink-0 text-sm">
                Subscribe
              </button>
            </div>
          </div>

        </div>
        
        <div className="mt-12 pt-8 border-t border-green-800 text-center text-gray-400 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Agrishield. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
