import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiChevronRight, FiShield, FiTruck, FiCheckCircle, FiGlobe } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import ProductCard from '../components/shop/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find(p => p.id === parseInt(id));
  const relatedProducts = products
    .filter(p => p.id !== parseInt(id))
    .sort((a, b) => (a.category === product?.category ? -1 : 1))
    .slice(0, 4);
  const [selectedPack, setSelectedPack] = useState(product?.packageSize || '1 kg');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product?.packageSize) {
      setSelectedPack(product.packageSize);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-primary hover:underline font-bold">Return to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Add to cart mapping Pack to 1000 since our Cart format uses "1000" for 1kg
    const packageMap = {
      '500 ml': '500',
      '1 kg': '1000',
      '5 kg': '5000',
      '2 kg': '2000',
      '10 kg': '10000',
    };
    addToCart({ ...product, packageSize: packageMap[selectedPack] || product.packageSize || '1000' });
    navigate('/cart');
  };

  const handleBuyNow = () => {
    const packageMap = {
      '500 ml': '500',
      '1 kg': '1000',
      '5 kg': '5000',
      '2 kg': '2000',
      '10 kg': '10000',
    };
    addToCart({ ...product, packageSize: packageMap[selectedPack] || product.packageSize || '1000' });
    navigate('/checkout');
  };


  return (
    <motion.div 
      className="bg-bg-shop min-h-screen font-sans pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 sm:px-6 lg:px-8 text-sm font-medium text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Home</Link> <FiChevronRight className="w-4 h-4" />
        <Link to="/shop" className="hover:text-primary">Shop</Link> <FiChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          
          {/* Left Column - Images */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="w-full aspect-square bg-white rounded-2xl flex items-center justify-center relative overflow-hidden group border border-gray-100 p-6">
               {product.image ? (
                 <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
               ) : (
                 <span className="text-gray-300 font-bold text-4xl tracking-widest rotate-[-45deg] opacity-50">NO IMAGE</span>
               )}
               <div className="absolute top-4 right-4 bg-green-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                 <span className="text-white font-extrabold text-xs text-center leading-tight">ECO<br/>Friendly</span>
               </div>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(thumb => (
                <div key={thumb} className={`w-20 h-20 bg-white rounded-xl border-2 flex flex-shrink-0 items-center justify-center cursor-pointer p-2 ${thumb === 1 ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-400 text-xs">IMG</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            <span className="text-sm font-bold text-primary uppercase tracking-wider mb-2">{product.brand || product.category}</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}: Natural, Safe Repellent</h1>
            
            {/* Ratings */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-500 underline cursor-pointer">{product.reviews} Reviews</span>
            </div>

            {/* Price block */}
            <div className="mb-8">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-extrabold text-gray-900">{product.price}</span>
                {product.originalPrice && <span className="text-lg text-gray-400 line-through mb-1">MRP {product.originalPrice}</span>}
                {product.discount && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded mb-2">{product.discount}% OFF</span>}
              </div>
              <p className="text-sm text-gray-500 font-medium">Inclusive of all taxes. <span className="text-green-600 font-bold ml-2 flex inline-flex items-center gap-1"><FiTruck/> Free Delivery</span></p>
            </div>

            {/* Target Species Checklist Badge Grid */}
            {product.targetSpecies && (
              <div className="mb-8 bg-green-50/80 border-2 border-green-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🛡️</span>
                  <h3 className="text-base font-extrabold text-gray-900">
                    Protected Against All 10 Animals & Birds:
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mb-3 font-medium">
                  One single formula safely deters all species listed below:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.targetSpecies.map((species, i) => (
                    <div 
                      key={i} 
                      className="bg-white border border-green-200 hover:border-primary rounded-lg px-3 py-2 shadow-sm text-xs font-extrabold text-gray-800 flex items-center gap-1.5 transition-all"
                    >
                      <span className="text-primary font-bold">✓</span>
                      {species}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pack Selector */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Available Pack Size</h3>
              <div 
                onClick={() => setSelectedPack(product.packageSize || '1 kg')}
                className={`w-40 border-2 rounded-xl p-4 cursor-pointer text-center relative transition-all border-primary bg-green-50`}
              >
                {product.discount && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{product.discount}% OFF</div>}
                <div className="font-bold text-gray-900 mb-1">{product.packageSize || '1 kg'}</div>
                <div className="text-sm font-extrabold text-primary">{product.price}</div>
                <div className="text-[10px] text-green-600 font-bold uppercase mt-1">Best Seller</div>
              </div>

              {product.category !== 'BONDON-B' && (
                <>
                  <h3 className="text-sm font-bold text-gray-900 mt-6 mb-3">Big Savings on Multipack</h3>
                  <div className="flex flex-wrap gap-4">
                    <div onClick={() => setSelectedPack('5 kg')} className={`flex-1 min-w-[120px] border-2 rounded-xl p-3 cursor-pointer text-center relative transition-all ${selectedPack === '5 kg' ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">14% OFF</div>
                      <div className="text-xs text-gray-600 mb-1">5 kg (pack of 1 kg x 5)</div>
                      <div className="text-sm font-extrabold text-gray-900">₹2419</div>
                    </div>
                    <div onClick={() => setSelectedPack('2 kg')} className={`flex-1 min-w-[120px] border-2 rounded-xl p-3 cursor-pointer text-center relative transition-all ${selectedPack === '2 kg' ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">5% OFF</div>
                      <div className="text-xs text-gray-600 mb-1">2 kg (pack of 1 kg x 2)</div>
                      <div className="text-sm font-extrabold text-gray-900">₹1083</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment & CTA Note */}
            <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 mb-5 mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-700 gap-3">
              <span className="font-medium">
                ✅ Cash on Delivery, GPay, PhonePe & Cards all available
              </span>
              <div className="flex items-center gap-1 text-primary font-bold animate-pulse whitespace-nowrap">
                Click Buy Now <FiChevronRight className="w-5 h-5 rotate-90 sm:rotate-0" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-auto">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-md transition-all transform hover:scale-[1.02]"
              >
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-md transition-all transform hover:scale-[1.02]"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges & Features */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl drop-shadow-sm">📅</span>
                <span className="text-xs font-bold text-gray-800">Longer Expiry</span>
              </div>
              <div className="flex flex-col items-center gap-2 border-l border-gray-100">
                <span className="text-4xl drop-shadow-sm">📦</span>
                <span className="text-xs font-bold text-gray-800">Cash on Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-2 border-l border-gray-100">
                <span className="text-4xl drop-shadow-sm">✅</span>
                <span className="text-xs font-bold text-gray-800">QR Code Verified</span>
              </div>
            </div>

            {/* List & Banner */}
            <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-800 font-medium">
                <FiGlobe className="text-green-600 w-5 h-5 flex-shrink-0" /> Country of Origin India
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-800 font-medium">
                <FiShield className="text-green-600 w-5 h-5 flex-shrink-0" /> Secure Payments
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-800 font-medium">
                <FiTruck className="text-green-600 w-5 h-5 flex-shrink-0" /> In stock, Ready to Ship
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 flex items-center justify-between border border-blue-200 shadow-sm cursor-pointer hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <span className="text-5xl drop-shadow-md">📦</span>
                <div>
                  <div className="text-blue-900 font-extrabold text-lg leading-none mb-1 tracking-tight">Buy in Bulk</div>
                  <div className="text-orange-500 font-extrabold text-xl italic drop-shadow-sm leading-none">Save More!</div>
                </div>
              </div>
              <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-colors text-sm whitespace-nowrap">
                Inquire Now
              </button>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <div className="mt-12 mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pl-2 border-l-4 border-primary">Frequently Bought Together</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rp => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>

        {/* Overview & Description block */}
        <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Overview</h2>
          
          <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mb-10">
            <table className="w-full text-sm text-left">
              <tbody>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-700 bg-gray-100/50 w-1/3">Product Name</th>
                  <td className="px-6 py-4 text-gray-600 font-medium">{product.name}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-700 bg-gray-100/50">Brand</th>
                  <td className="px-6 py-4 text-gray-600 font-medium">{product.brand || 'Agrishield'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-700 bg-gray-100/50">Category</th>
                  <td className="px-6 py-4 text-gray-600 font-medium">{product.category}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-700 bg-gray-100/50">Technical Content</th>
                  <td className="px-6 py-4 text-gray-600 font-medium">{product.technicalContent || 'N/A'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-700 bg-gray-100/50">Classification</th>
                  <td className="px-6 py-4 text-gray-600 font-medium">{product.classification || 'Bio/Organic'}</td>
                </tr>
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-700 bg-gray-100/50">Toxicity</th>
                  <td className="px-6 py-4 text-gray-600 font-medium">{product.toxicity || 'Green'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Product Description</h2>
          
          <div className="prose prose-green max-w-none text-gray-600">
            <h4 className="text-lg font-bold text-gray-900 mb-3">About {product.name}</h4>
            <p className="mb-6">{product.description || 'Premium agricultural product tailored for superior results. Safe, organic, and effective.'}</p>

            <h4 className="text-lg font-bold text-gray-900 mb-3">Key Features & Benefits</h4>
            <ul className="list-disc pl-5 mb-6 space-y-2">
              {product.features ? product.features.map((f, i) => <li key={i}>{f}</li>) : (
                <>
                  <li>Eco-friendly and sustainable</li>
                  <li>Long-lasting effects for maximum protection</li>
                  <li>Easy and safe to use</li>
                </>
              )}
            </ul>

            <h4 className="text-lg font-bold text-gray-900 mb-3">Usage & Crops</h4>
            <ul className="list-disc pl-5 mb-6 space-y-2">
              <li><strong>Recommended Crops:</strong> {product.usage?.crops || 'All Crops'}</li>
              <li><strong>Target:</strong> {product.usage?.pest || 'General'}</li>
              <li><strong>Application:</strong> {product.usage?.application || 'Follow standard operating procedures detailed on package.'}</li>
            </ul>

            <h4 className="text-lg font-bold text-gray-900 mb-3">Additional Information</h4>
            <ul className="list-disc pl-5 mb-6 space-y-2 text-sm">
              {product.additionalInfo ? product.additionalInfo.map((info, i) => <li key={i}>{info}</li>) : (
                <>
                  <li>Store in a cool, dry place away from direct sunlight.</li>
                  <li>Dispose of packaging as per local environmental regulations.</li>
                  <li>Always use protective gear when handling agricultural inputs.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
