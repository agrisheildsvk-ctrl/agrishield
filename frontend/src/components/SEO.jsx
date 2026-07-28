import React, { useEffect } from 'react';

const SEO = ({
  title = 'Agrishield India | Advanced Crop Protection & Organic Farming Products',
  description = "Shop India's trusted organic crop protection products, wild animal deterrents, solar alarm strobes, and pest control repellents at Agrishield.",
  keywords = 'Agrishield, crop protection India, wild boar repellent, solar alarm light, organic snake repellent, farm fence, pest control products for agriculture',
  canonical = 'https://agrishield.in',
  image = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  type = 'website',
  schema = null,
}) => {
  useEffect(() => {
    // 1. Document Title
    if (title) {
      document.title = title;
    }

    // Helper to update/create meta tag
    const setMetaTag = (selector, attribute, value, contentValue) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', contentValue);
    };

    // 2. Meta Description
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // 3. Meta Keywords
    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywordsStr);

    // 4. Canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonical);

    // 5. Open Graph (og:*) Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);

    // 6. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    // 7. JSON-LD Schema
    if (schema) {
      let scriptTag = document.querySelector('script[id="dynamic-seo-schema"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        scriptTag.setAttribute('id', 'dynamic-seo-schema');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    }
  }, [title, description, keywords, canonical, image, type, schema]);

  return null;
};

export default SEO;
