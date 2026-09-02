import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingContact = () => {
  const location = useLocation();
  const isProductPage = location.pathname.startsWith('/product');
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const phone = '919739230638';
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent('Hello Agrishield / Srii Veerabhadreshwara Krushi Kendra, I need information regarding organic crop protection repellents.')}`;
  const callUrl = `tel:+${phone}`;

  return (
    <div className={`fixed left-3 sm:left-6 ${isProductPage ? 'bottom-32' : 'bottom-20'} md:bottom-8 z-40 flex flex-col gap-3 items-start pointer-events-auto`}>
      {/* Call Phone Button */}
      <div 
        className="relative flex items-center group"
        onMouseEnter={() => setHoveredBtn('call')}
        onMouseLeave={() => setHoveredBtn(null)}
      >
        <a
          href={callUrl}
          aria-label="Call Agrishield Farmer Helpline"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 border-2 border-white/20"
        >
          <FaPhoneAlt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </a>
        <AnimatePresence>
          {hoveredBtn === 'call' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-14 sm:left-16 bg-gray-900 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap z-50 ml-2 border border-gray-700"
            >
              📞 Call Farmer Helpline (+91 9739230638)
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WhatsApp Chat Button */}
      <div 
        className="relative flex items-center group"
        onMouseEnter={() => setHoveredBtn('whatsapp')}
        onMouseLeave={() => setHoveredBtn(null)}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Agrishield on WhatsApp"
          className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#25D366] to-[#1EBE5D] hover:from-[#28E06C] hover:to-[#22C763] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 border-2 border-white/20 relative"
        >
          {/* Subtle pulse animation for high visibility */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none"></span>
          <FaWhatsapp className="w-6 h-6 sm:w-8 sm:h-8 text-white relative z-10" />
        </a>
        <AnimatePresence>
          {hoveredBtn === 'whatsapp' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-14 sm:left-16 bg-gray-900 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap z-50 ml-2 border border-gray-700"
            >
              💬 Chat on WhatsApp (+91 9739230638)
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FloatingContact;
