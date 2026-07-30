import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiChevronRight, FiShield, FiTruck, FiCheckCircle, FiGlobe } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/shop/ProductCard';
import SEO from '../components/SEO';
import { products } from '../data/products';

const ProductDetails = () => {
  const { slug, id } = useParams();
  const param = slug || id;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find(p => p.slug === param || p.id === parseInt(param) || String(p.id) === String(param));
  const relatedProducts = products
    .filter(p => p.id !== product?.id)
    .sort((a, b) => (a.category === product?.category ? -1 : 1))
    .slice(0, 4);
  const defaultVariant = product?.variants?.find(v => v.isDefault) || product?.variants?.[0] || {
    size: product?.packageSize || '1 kg',
    price: product?.price || '₹400',
    originalPrice: product?.originalPrice || '₹680',
    discount: product?.discount || 41
  };
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.image || '');
  const [selectedThumbIndex, setSelectedThumbIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      if (param !== product.slug && product.slug) {
        navigate(`/product/${product.slug}`, { replace: true });
        return;
      }
      const def = product.variants?.find(v => v.isDefault) || product.variants?.[0] || {
        size: product.packageSize || '1 kg',
        price: product.price || '₹400',
        originalPrice: product.originalPrice || '₹680',
        discount: product.discount || 41
      };
      setSelectedVariant(def);
      setQuantity(1);
      setSelectedImage(product.image || '');
      setSelectedThumbIndex(0);
    }
  }, [param, product, navigate]);

  const galleryImages = product?.images && product.images.length > 0 
    ? product.images 
    : [
        product?.image,
        product?.image,
        product?.image,
        product?.image
      ].filter(Boolean);

  const handleBulkInquiry = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const phone = '919739230638';
    const variantStr = selectedVariant?.size || product.packageSize || '1 kg';
    const message = `Hello Agrishield / Srii Veerabhadreshwara Krushi Kendra,\n\nI would like to inquire about *Bulk Purchase / Wholesale Pricing* for:\n\n🌾 *Product:* ${product.name}\n📦 *Pack Size:* ${variantStr}\n💰 *Listed Price:* ${selectedVariant?.price || product.price}\n\nPlease share details and best discount for bulk quantity.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-primary hover:underline font-bold">Return to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({ 
      ...product, 
      packageSize: selectedVariant.size, 
      price: selectedVariant.price,
      originalPrice: selectedVariant.originalPrice,
      discount: selectedVariant.discount
    }, quantity);
    navigate('/cart');
  };

  const handleBuyNow = () => {
    addToCart({ 
      ...product, 
      packageSize: selectedVariant.size, 
      price: selectedVariant.price,
      originalPrice: selectedVariant.originalPrice,
      discount: selectedVariant.discount
    }, quantity);
    navigate('/checkout');
  };


  return (
    <motion.div 
      className="bg-bg-shop min-h-screen font-sans pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {product && (
        <SEO
          title={`${product.title} (${selectedVariant.size}) | Agrishield Shop`}
          description={`Buy ${product.title} at ${selectedVariant.price} in India. ${product.shortDescription || product.description}`}
          keywords={[product.title, product.category, 'Agrishield crop protection', 'buy agriculture product online India']}
          canonical={`https://agrishield.in/product/${product.slug || product.id}`}
          image={selectedImage || product.image}
          type="product"
          schema={{
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.title,
            "image": selectedImage || product.image,
            "description": product.shortDescription || product.description,
            "sku": product.badge || `AGRI-PROD-${product.id}`,
            "brand": {
              "@type": "Brand",
              "name": "Agrishield India"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://agrishield.in/product/${product.slug || product.id}`,
              "priceCurrency": "INR",
              "price": selectedVariant.price ? selectedVariant.price.replace(/[^0-9.]/g, '') : '400',
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "Agrishield India"
              }
            }
          }}
        />
      )}
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
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className="w-full aspect-square bg-white rounded-2xl flex items-center justify-center relative overflow-hidden group border border-gray-200 p-6 cursor-zoom-in shadow-sm hover:shadow-md transition"
              title="Click to view full size image"
            >
               {selectedImage ? (
                 <img src={selectedImage} alt={product.seoAlt || `${product.name} - Agrishield Organic Crop Protection India`} title={product.seoTitle || `${product.name} | Agrishield India Agriculture Store`} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
               ) : (
                 <span className="text-gray-300 font-bold text-4xl tracking-widest rotate-[-45deg] opacity-50">NO IMAGE</span>
               )}
               <div className="absolute top-4 right-4 bg-green-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                 <span className="text-white font-extrabold text-xs text-center leading-tight">ECO<br/>Friendly</span>
               </div>
               <div className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm transition shadow">
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                 Click to Zoom
               </div>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    setSelectedImage(img);
                    setSelectedThumbIndex(idx);
                  }}
                  className={`w-20 h-20 bg-white rounded-xl border-2 flex flex-shrink-0 items-center justify-center cursor-pointer p-1.5 transition-all ${selectedThumbIndex === idx ? 'border-primary ring-2 ring-primary/30 shadow-md scale-105' : 'border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100'}`}
                >
                  {img ? (
                    <img src={img} alt={product.seoAlt ? `${product.seoAlt} - view ${idx + 1}` : `${product.name} thumbnail ${idx + 1}`} title={`${product.seoTitle || product.name} - View ${idx + 1}`} className="w-full h-full object-contain" />
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
                <span className="text-4xl font-extrabold text-gray-900">{selectedVariant.price}</span>
                {selectedVariant.originalPrice && <span className="text-lg text-gray-400 line-through mb-1">MRP {selectedVariant.originalPrice}</span>}
                {selectedVariant.discount && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded mb-2">{selectedVariant.discount}% OFF</span>}
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Inclusive of all taxes. <span className="text-green-600 font-bold ml-2 inline-flex items-center gap-1"><FiTruck/> Free Delivery</span> • <span className="text-emerald-700 font-bold ml-1">✅ In Stock</span>
              </p>
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

            {/* Pack Selector (Dropdown + Interactive Buttons Grid) */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Select Pack Size</h3>
                {product.variants && product.variants.length > 0 && (
                  <div className="relative inline-block w-48">
                    <select
                      value={selectedVariant.size}
                      onChange={(e) => {
                        const found = product.variants.find(v => v.size === e.target.value);
                        if (found) setSelectedVariant(found);
                      }}
                      className="w-full bg-white border-2 border-primary text-gray-900 font-bold text-xs rounded-xl px-3 py-2 outline-none cursor-pointer shadow-sm focus:ring-2 focus:ring-primary/20"
                    >
                      {product.variants.map((v, idx) => (
                        <option key={idx} value={v.size}>
                          {v.size} — {v.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Interactive Variant Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(product.variants || []).map((v, idx) => {
                  const isSelected = selectedVariant.size === v.size;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedVariant(v)}
                      className={`border-2 rounded-2xl p-3.5 cursor-pointer text-center relative transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-primary bg-green-50/80 shadow-md ring-2 ring-primary/20'
                          : 'border-gray-200 hover:border-primary/50 bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      {v.discount && (
                        <div className={`absolute -top-2.5 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs ${
                          isSelected ? 'bg-primary text-white' : 'bg-yellow-400 text-gray-900'
                        }`}>
                          {v.discount}% OFF
                        </div>
                      )}
                      <div className={`text-sm font-extrabold mb-0.5 ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                        {v.size}
                      </div>
                      <div className="text-base font-extrabold text-gray-900">
                        {v.price}
                      </div>
                      {v.originalPrice && (
                        <div className="text-[11px] text-gray-400 line-through">
                          ₹{String(v.originalPrice).replace(/[^0-9,.]/g, '')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-900">Quantity:</span>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-primary font-bold rounded-lg hover:bg-white transition"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-extrabold text-gray-900 text-base">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-primary font-bold rounded-lg hover:bg-white transition"
                  >
                    +
                  </button>
                </div>
              </div>
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

            <div 
              onClick={handleBulkInquiry}
              className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-200 shadow-sm cursor-pointer hover:shadow-md transition group"
              title="Click to inquire via WhatsApp"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform">📦</span>
                <div>
                  <div className="text-blue-900 font-extrabold text-lg leading-none mb-1 tracking-tight">Buy in Bulk</div>
                  <div className="text-orange-500 font-extrabold text-xl italic drop-shadow-sm leading-none">Save More!</div>
                </div>
              </div>
              <button 
                onClick={handleBulkInquiry}
                type="button"
                className="w-full sm:w-auto justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-colors text-sm whitespace-nowrap flex items-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5 shrink-0" />
                Inquire on WhatsApp
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

      {/* Lightbox Modal for Full Size Image */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center">
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-yellow-400 bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
              title="Close Zoom View"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-white text-sm font-medium tracking-wide">
              {product.name} — Preview Mode (Click outside to close)
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductDetails;
