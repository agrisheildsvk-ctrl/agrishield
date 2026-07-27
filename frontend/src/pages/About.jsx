import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiShield, FiTrendingUp, FiUsers } from 'react-icons/fi';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 pb-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full bg-primary-dark text-white py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <img src="/header2.png" alt="Agriculture background" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6"
          >
            About Agrishield
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto"
          >
            Empowering farmers with premium agricultural solutions, seeds, and advanced machinery for a prosperous harvest.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 mt-[-40px] md:mt-[-60px] relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4 leading-relaxed text-lg">
                Agrishield started with a simple vision: to bridge the gap between traditional farming and modern agricultural technology. We understand the challenges farmers face every day, from unpredictable weather to pests and soil degradation.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                That's why we have curated a selection of the highest-quality seeds, organic fertilizers, reliable repellents, and heavy-duty machinery. We don't just sell products; we provide complete protection and shielding for your crops, ensuring maximum yield and profitability.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-900 group"
            >
              <img src="/About.png" alt="About Agrishield" className="w-full h-[380px] md:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-white">
                <p className="font-extrabold text-lg text-gray-900">10,000+ Happy Farmers</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Across India</p>
              </div>
            </motion.div>
          </div>

          <hr className="border-gray-100 mb-16" />

          {/* Why Choose Us */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose Agrishield?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">We stand by the quality of our products and the success of our farmers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FiShield className="text-4xl text-primary mb-4" />,
                title: "Quality Guaranteed",
                desc: "100% authentic and tested products for maximum crop protection."
              },
              {
                icon: <FiCheckCircle className="text-4xl text-primary mb-4" />,
                title: "Expert Support",
                desc: "Our agricultural experts are always ready to guide you."
              },
              {
                icon: <FiTrendingUp className="text-4xl text-primary mb-4" />,
                title: "High Yield",
                desc: "Boost your production with our advanced seeds and fertilizers."
              },
              {
                icon: <FiUsers className="text-4xl text-primary mb-4" />,
                title: "Farmer First",
                desc: "Built by people who understand the soil and respect the farmer."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (idx * 0.1) }}
                className="bg-gray-50 p-8 rounded-xl text-center border border-gray-100 hover:shadow-md transition-shadow hover:border-primary/30 group"
              >
                <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
};

export default About;
