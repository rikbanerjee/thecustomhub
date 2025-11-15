import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * SEO Component
 * Manages page title and meta tags for SEO optimization
 * Simple implementation without external dependencies
 */
const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogTitle, 
  ogDescription, 
  canonical 
}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = 'name') => {
      if (!content) return;
      
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update meta description
    updateMetaTag('description', description);
    
    // Update meta keywords
    updateMetaTag('keywords', keywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', ogTitle || title, 'property');
    updateMetaTag('og:description', ogDescription || description, 'property');
    updateMetaTag('og:type', 'website', 'property');
    
    // Update canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', canonical);
    }

    // Cleanup function to reset title on unmount
    return () => {
      document.title = 'The Custom Hub';
    };
  }, [title, description, keywords, ogTitle, ogDescription, canonical]);

  return null; // This component doesn't render anything
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  ogTitle: PropTypes.string,
  ogDescription: PropTypes.string,
  canonical: PropTypes.string,
};

export default SEO;

