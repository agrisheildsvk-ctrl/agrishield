import React from 'react';
import { FiCheckCircle, FiTruck, FiShield, FiHeadphones, FiRefreshCw } from 'react-icons/fi';

const features = [
  {
    icon: <FiCheckCircle className="w-8 h-8" />,
    title: 'Genuine Products',
    desc: '100% authentic agriculture supplies directly from trusted brands.'
  },
  {
    icon: <FiTruck className="w-8 h-8" />,
    title: 'Fast Delivery',
    desc: 'Expedited shipping to ensure your farm gets what it needs, on time.'
  },
  {
    icon: <FiShield className="w-8 h-8" />,
    title: 'Secure Payments',
    desc: 'Safe and encrypted transactions for your peace of mind.'
  },
  {
    icon: <FiHeadphones className="w-8 h-8" />,
    title: 'Expert Support',
    desc: 'Access to agriculture experts ready to assist you 24/7.'
  },
  {
    icon: <FiRefreshCw className="w-8 h-8" />,
    title: 'Easy Returns',
    desc: 'Hassle-free 30-day return policy on unused items.'
  }
];

const ShopFeatures = () => {
  return (
    <div className="bg-white py-16 mt-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Why Buy From Agrishield?</h2>
          <p className="mt-4 text-lg text-gray-500">We are committed to empowering farmers with the best tools and services.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="bg-green-50 text-primary p-4 rounded-full mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopFeatures;
