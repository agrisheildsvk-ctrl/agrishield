import React from 'react';
import { Link } from 'react-router-dom';

const PromoBanners = () => {
  return (
    <section className="py-8 sm:py-10 md:py-12 bg-[#2d8345] w-full border-t border-b border-green-800/20 shadow-inner overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-12">
          {/* Left Promo Card: Coupon APP100 */}
          <Link
            to="/shop"
            className="w-full md:w-auto flex-1 max-w-xl group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            <img
              src="/coupen.webp"
              alt="Get Rs 100 OFF on your first app order - Coupon Code APP100"
              width="600"
              height="184"
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-contain block group-hover:scale-[1.02] transition-transform duration-500"
            />
          </Link>

          {/* Right Promo Card: Free Delivery Above 499 */}
          <Link
            to="/shop"
            className="w-full md:w-auto flex-1 max-w-xl group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            <img
              src="/order.webp"
              alt="Free Delivery on orders above Rs 499"
              width="600"
              height="175"
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-contain block group-hover:scale-[1.02] transition-transform duration-500"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
