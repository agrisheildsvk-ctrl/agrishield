import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import TrustBadges from '../components/TrustBadges';
import PromoBanners from '../components/PromoBanners';
import ProductCard from '../components/shop/ProductCard';

const Home = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  
  const faqs = [
    { q: "How fast is the delivery?", a: "We offer next-day delivery on all agricultural products within our core service areas." },
    { q: "Are your repellents organic?", a: "Yes, the majority of our repellents are 100% organic, eco-friendly, and safe for crops." },
    { q: "Do you offer bulk discounts?", a: "Absolutely! Please contact our sales team for special pricing on bulk orders." },
    { q: "What is your return policy?", a: "We have a 7-day no-questions-asked return policy for unopened products." }
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      {/* Desktop Hero Banner Section */}
      <section className="relative w-full hidden md:block">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          className="w-full h-auto pb-10"
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <SwiperSlide key={`desktop-${num}`}>
              <img 
                src={`/Desktop%20header${num}.png`} 
                alt={`Desktop Banner ${num}`} 
                className="w-full h-auto object-contain block" 
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Mobile Hero Banner Section */}
      <section className="relative w-full md:hidden block">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          className="w-full h-auto pb-10"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <SwiperSlide key={`mobile-${num}`}>
              <img 
                src={`/header${num}.png`} 
                alt={`Mobile Banner ${num}`} 
                className="w-full h-auto object-contain block" 
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Trust Badges / Why Agrishield - Before About */}
      <TrustBadges />

      {/* About Agrishield - Ultra Modern Design */}
      <section className="py-10 md:py-20 bg-gradient-to-b from-white via-green-50/25 to-white w-full border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            
            {/* Image/Visual Column (7 cols) */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-900 group">
                {/* Main Full-Cover Farm Image */}
                <img 
                  src="/About.png" 
                  alt="Farmer checking crops with Agrishield" 
                  className="w-full h-[420px] sm:h-[540px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                {/* Top Right Certification Tag */}
                <div className="absolute top-6 right-6 bg-gray-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20 shadow-md">
                  ★ APEDA & NPOP Certified
                </div>

                {/* Bottom Left Glassmorphism Floating Stats Card */}
                <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-xl border border-white flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg text-2xl font-bold flex-shrink-0">
                    🌱
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-2xl text-gray-900">100%</p>
                      <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">Quality Assured</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Eco-friendly crop protection for maximum harvest yield.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full text-sm mb-4 md:mb-6 w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                THE AGRISHIELD PROMISE
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight">
                Protecting Crops. <br />
                <span className="text-primary">Empowering Farmers.</span>
              </h2>

              <p className="text-gray-600 text-base sm:text-lg mb-6 md:mb-8 leading-relaxed">
                We bridge traditional agriculture with modern, non-toxic bio-repellents and premium solutions. Our mission is simple: keep your harvest 100% safe from wild animals, pests, and environmental stress.
              </p>
              
              {/* Feature Box Stack */}
              <div className="space-y-4 mb-6 md:mb-10">
                {[
                  {
                    title: 'Organic & Non-Toxic Formulas',
                    desc: 'Safe for crops, soil organisms, and livestock.'
                  },
                  {
                    title: 'Multi-Species Wildlife Repellency',
                    desc: 'Effective against wild boars, monkeys, snakes & birds.'
                  },
                  {
                    title: 'Direct-to-Farm Express Support',
                    desc: 'Trusted by over 10,000+ happy farmers nationwide.'
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-green-50/50 hover:border-green-200 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link 
                  to="/shop" 
                  className="flex-1 sm:flex-initial text-center bg-primary hover:bg-primary-dark text-white font-bold px-3 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm sm:text-base whitespace-nowrap"
                >
                  Explore Products
                </Link>
                <Link 
                  to="/about" 
                  className="flex-1 sm:flex-initial text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 sm:px-7 py-3.5 sm:py-4 rounded-xl transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  Our Story
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-8 md:py-14 lg:py-20 bg-gray-50 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-12 text-primary-dark">Featured Products</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
              {products.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
           </div>
          <div className="text-center mt-10 md:mt-14">
            <Link to="/shop" className="inline-block border-2 border-primary text-primary font-bold py-3 px-8 md:px-10 rounded-full hover:bg-primary hover:text-white transition-colors text-sm md:text-base">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Promo Banners Strip (Coupons & Free Delivery) */}
      <PromoBanners />

      {/* BONDON-B Multi-Species All-In-One Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-green-50/40 w-full border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col items-center justify-center mb-10 md:mb-14 text-center">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2">All-In-One Protection</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">BONDON-B Multi-Species Repellent</h2>
            <p className="text-gray-600 max-w-2xl mt-3 text-base md:text-lg">
              One single 500 ml formula designed to safeguard your farm from 10+ wild animals and birds safely.
            </p>
            <div className="w-24 h-1 bg-primary rounded-full mt-6"></div>
          </div>
          
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
              {/* Left: Single Product Card Preview */}
              <div className="md:col-span-5 flex flex-col items-center text-center bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="aspect-square w-48 bg-white rounded-xl shadow-sm flex items-center justify-center relative mb-4 border border-gray-100 p-4">
                  <img src="/BONDON-B.png" alt="BONDON-B All-in-One" className="w-full h-full object-contain" />
                  <div className="absolute top-2 right-2 bg-green-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow">
                    50% OFF
                  </div>
                </div>
                <h3 className="font-extrabold text-gray-900 text-xl mb-1">BONDON-B (500 ml)</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">All Animals & Birds Repellent</p>
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-yellow-200">
                    <span>4.9</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">(142 reviews)</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-3xl font-extrabold text-primary">₹530</span>
                  <span className="text-base text-gray-400 line-through font-medium">₹1050</span>
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200 ml-1">Save 50%</span>
                </div>
                <Link 
                  to="/product/10"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <span>View Product Details</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
              </div>

              {/* Right: All 10 Animals & Birds List */}
              <div className="md:col-span-7 flex flex-col justify-center">
                <div className="inline-block bg-primary/10 text-primary font-extrabold px-3.5 py-1 rounded-full text-xs w-max mb-3">
                  100% Bio-Organic & Eco-Friendly
                </div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-4">
                  Protected Against All 10 Species:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  {[
                    "1. ELEPHANT", "2. WILDBOAR", "3. PEACOCK", "4. MONKEY",
                    "5. WILD BUFFALO", "6. BEAR", "7. PARROT", "8. SQUIRELL",
                    "9. FOX", "10. DEER"
                  ].map((animal, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-green-50/70 border border-green-200 rounded-xl px-3.5 py-2.5 shadow-sm">
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </div>
                      <span className="font-extrabold text-gray-800 text-sm tracking-wide">{animal}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between text-sm text-gray-600 gap-2">
                  <span>Standard Pack: <strong className="text-gray-900 font-bold">500 ml</strong></span>
                  <span>MRP: <strong className="text-gray-400 line-through">₹1050</strong> | Price: <strong className="text-primary font-extrabold text-base">₹530</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-10 md:py-20 bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Everything you need to know about Agrishield products and services.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 ${activeFaq === index ? 'shadow-md bg-gray-50' : 'hover:shadow-sm bg-white'}`}
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-bold text-gray-900 text-lg pr-4">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full bg-green-100 text-primary flex items-center justify-center shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <motion.div 
                  initial={false}
                  animate={{ height: activeFaq === index ? 'auto' : 0, opacity: activeFaq === index ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4 mt-2">{faq.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-10 md:py-20 bg-gray-900 w-full text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Contact Info */}
            <div className="w-full lg:w-1/3">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Get in Touch</h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                Have questions about our products or need agricultural advice? Our experts are here to help you achieve the best yield.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Phone</h4>
                    <p className="text-gray-400">9739230638</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Email</h4>
                    <p className="text-gray-400">anand.ur38@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Office</h4>
                    <p className="text-gray-400">Srii Veerabhadreshwara Krushi Kendra,<br/>Alkola Circle, Sagara Road,<br/>Shivamogga-577204</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will contact you soon.'); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                      <input type="text" required className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                      <input type="text" required className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input type="email" required className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Message</label>
                    <textarea required rows="4" className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="How can we help you?"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-1 transform duration-300">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
