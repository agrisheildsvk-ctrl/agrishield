import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiPhone, FiMail, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import SEO from '../components/SEO';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = (data) => {
    const phone = '919739230638';
    const message = `*New Farmer Inquiry from Agrishield Website*\n\n` +
      `👤 *Name:* ${data.name}\n` +
      `📞 *Phone:* ${data.phone}\n` +
      `📍 *Place:* ${data.place}\n` +
      `📧 *Email:* ${data.email || 'N/A'}\n\n` +
      `💬 *Message:*\n${data.message}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    reset();
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 pb-16 overflow-hidden">
      <SEO
        title="Contact Agrishield India | Customer Support & Agricultural Advisory"
        description="Get in touch with Agrishield customer service, agricultural expert support, and bulk order advisory for crop protection products."
        keywords={['contact Agrishield', 'Agrishield customer care number', 'agricultural advisory support India', 'crop protection help']}
        canonical="https://agrishield.in/contact"
      />
      {/* Hero Section */}
      <section className="relative w-full bg-primary-dark text-white py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <img src="/header3.webp" alt="Agrishield Contact Customer Support Agriculture Banner" title="Agrishield Contact Customer Support & Agriculture Advisory" width="600" height="326" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto"
          >
            Have a question about our products or need agricultural advice? We're here to help you grow.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 mt-[-40px] relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Get In Touch</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Whether you need assistance with an order, want to learn more about our fertilizers, or need expert farming advice, our team is ready to assist you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-4 rounded-full text-primary">
                    <FiMapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Our Office</h4>
                    <p className="text-gray-600 mt-1">Srii Veerabhadreshwara Krushi Kendra<br/>Alkola Circle, Sagara Road,<br/>Shivamogga-577204</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-4 rounded-full text-primary">
                    <FiPhone size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Phone</h4>
                    <p className="text-gray-600 mt-1">9739230638<br/>Mon-Sat, 9AM to 6PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-4 rounded-full text-primary">
                    <FiMail size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Email</h4>
                    <p className="text-gray-600 mt-1">anand.ur38@gmail.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 p-8 rounded-xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    {...register("name", { required: "Name is required" })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input 
                      type="tel" 
                      {...register("phone", { 
                        required: "Phone number is required",
                        pattern: { value: /^[0-9+\s-]{10,15}$/, message: "Enter a valid 10-digit mobile number" }
                      })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                      placeholder="+91 9876543210"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Place / Location *</label>
                    <input 
                      type="text" 
                      {...register("place", { required: "Place/Village is required" })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                      placeholder="Village / City / District"
                    />
                    {errors.place && <p className="text-red-500 text-sm mt-1">{errors.place.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    {...register("email")}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                    placeholder="john@example.com (Optional)"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea 
                    {...register("message", { required: "Message is required" })}
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <FaWhatsapp className="w-5 h-5 shrink-0" /> Send Message via WhatsApp
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
