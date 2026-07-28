import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShield, FiLock, FiEye, FiUserCheck, FiShare2, FiHelpCircle, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "information-collection",
      icon: <FiEye className="w-6 h-6 text-primary" />,
      title: "1. Information We Collect",
      content: (
        <>
          <p className="mb-3">
            At <strong>Agrishield</strong> (operated by <em>Srii Veerabhadreshwara Krushi Kendra</em>), we collect personal information that you voluntarily provide when placing an order, registering an account, or contacting our customer support.
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-gray-700">
            <li><strong>Personal Details:</strong> Full Name, Billing/Shipping Address, Phone Number, and Email Address.</li>
            <li><strong>Order Information:</strong> Products purchased, pack sizes, delivery notes, and transaction timestamps.</li>
            <li><strong>Device & Browsing Data:</strong> Basic browser type, IP address, and interaction data to optimize our platform's performance and security.</li>
          </ul>
        </>
      )
    },
    {
      id: "use-of-information",
      icon: <FiUserCheck className="w-6 h-6 text-primary" />,
      title: "2. How We Use Your Information",
      content: (
        <>
          <p className="mb-3">
            We use the collected information strictly for fulfilling your agricultural product orders and providing reliable customer service:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-gray-700">
            <li><strong>Order Fulfillment:</strong> Processing payments, preparing shipments, and tracking packages.</li>
            <li><strong>Customer Communication:</strong> Sending order confirmations, shipping alerts via SMS/WhatsApp, and addressing support queries.</li>
            <li><strong>Platform Improvement:</strong> Enhancing our product range and user experience based on farming needs in Karnataka and across India.</li>
          </ul>
        </>
      )
    },
    {
      id: "payment-security",
      icon: <FiLock className="w-6 h-6 text-primary" />,
      title: "3. Payment Security & Razorpay Integration",
      content: (
        <>
          <p className="mb-3">
            We prioritize secure transactions. All online payments on Agrishield are processed through certified PCI-DSS compliant payment gateways, including <strong>Razorpay</strong>.
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-gray-700">
            <li>We do not store your Debit/Credit card numbers, UPI PINs, or Net Banking credentials on our servers.</li>
            <li>All payment data is encrypted using 128-bit SSL technology during transmission to Razorpay's secure servers.</li>
            <li>Automatic payment capture is verified via cryptographic signatures to ensure zero transaction tampering.</li>
          </ul>
        </>
      )
    },
    {
      id: "sharing-data",
      icon: <FiShare2 className="w-6 h-6 text-primary" />,
      title: "4. Sharing of Information",
      content: (
        <>
          <p className="mb-3">
            <strong>We never sell, rent, or trade your personal data</strong> to third-party marketing companies. We only share information with trusted operational partners under strict confidentiality:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-gray-700">
            <li><strong>Logistics & Courier Partners:</strong> Name, phone number, and delivery address to ensure prompt doorstep delivery.</li>
            <li><strong>Payment Gateways:</strong> Order value and transaction reference to process secure online payments.</li>
            <li><strong>Legal & Regulatory Authorities:</strong> If required by Indian law or judicial process.</li>
          </ul>
        </>
      )
    },
    {
      id: "data-protection",
      icon: <FiShield className="w-6 h-6 text-primary" />,
      title: "5. Data Protection & Security",
      content: (
        <>
          <p className="mb-3">
            We implement administrative, technical, and physical safeguards designed to protect your personal information against accidental, unlawful, or unauthorized destruction, loss, alteration, access, or disclosure.
          </p>
          <p>
            While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet is 100% secure. We continually upgrade our security protocols to maintain data integrity.
          </p>
        </>
      )
    },
    {
      id: "user-rights",
      icon: <FiHelpCircle className="w-6 h-6 text-primary" />,
      title: "6. Your Rights & Choices",
      content: (
        <>
          <p className="mb-3">
            You retain full control over your personal data:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-gray-700">
            <li><strong>Access & Update:</strong> You can review and update your profile information anytime through your account dashboard.</li>
            <li><strong>Data Deletion:</strong> You may request the deletion of your account and personal data by contacting our support email.</li>
            <li><strong>Opt-out:</strong> You can opt out of promotional SMS/email notifications while still receiving essential order updates.</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <motion.div 
      className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SEO
        title="Privacy Policy & Terms | Agrishield India"
        description="Read Agrishield India's privacy policy, data collection terms, and customer security guidelines for agricultural crop protection purchases."
        canonical="https://agrishield.in/privacy"
      />
      <div className="max-w-4xl mx-auto">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary-dark to-primary rounded-3xl p-8 sm:p-12 text-white shadow-lg mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
            <FiShield className="w-4 h-4" /> Official Policy
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-green-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            Your trust is our priority. Learn how <strong>Agrishield</strong> and <strong>Srii Veerabhadreshwara Krushi Kendra</strong> collect, protect, and responsibly use your personal information.
          </p>
          <div className="mt-6 inline-block text-xs font-medium text-green-200 border border-green-400/30 px-3 py-1 rounded-lg bg-black/10">
            Effective Date: July 2026 • Applies to all users of Agrishield
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Welcome to <strong>Agrishield</strong>. This Privacy Policy describes how Srii Veerabhadreshwara Krushi Kendra ("we," "our," or "us") collects, uses, and shares information in connection with your use of our website, e-commerce store, and agricultural services. By using Agrishield, you agree to the practices described in this policy.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {sections.map((sec, index) => (
            <motion.div 
              key={sec.id}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-gray-100">
                <div className="p-2.5 bg-green-50 rounded-xl">
                  {sec.icon}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {sec.title}
                </h2>
              </div>
              <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {sec.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Support Card */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Have Questions About Your Privacy?
            </h3>
            <p className="text-gray-600 text-sm max-w-xl">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please get in touch with our office.
            </p>
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <FiMapPin className="text-primary" /> <strong>Srii Veerabhadreshwara Krushi Kendra</strong>, Alkola Circle, Sagara Road, Shivamogga-577204
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <FiPhone className="text-primary" /> +91 9739230638
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <FiMail className="text-primary" /> anand.ur38@gmail.com
              </p>
            </div>
          </div>
          <Link 
            to="/contact" 
            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl shadow transition-colors shrink-0 text-sm"
          >
            Contact Us
          </Link>
        </div>

      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
