import { useState, useEffect } from 'react';
import SEO from '../../components/SEO';
import { getAllProducts } from '../../utils/dataHelpers';

/**
 * Contact Page Component
 * Complete contact form with validation, loading states, and product selection
 */
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderType: '',
    quantity: '',
    eventName: '',
    designIdea: '',
    productOfInterest: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products for dropdown
    const allProducts = getAllProducts();
    setProducts(allProducts);
  }, []);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'Name is required';
        }
        if (value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        return '';

      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';

      case 'phone':
        // Optional field, but validate format if provided
        if (value && value.trim()) {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value)) {
            return 'Please enter a valid phone number';
          }
          if (value.replace(/\D/g, '').length < 10) {
            return 'Phone number must be at least 10 digits';
          }
        }
        return '';

      case 'message':
        if (!value.trim()) {
          return 'Message is required';
        }
        if (value.trim().length < 10) {
          return 'Message must be at least 10 characters';
        }
        return '';

      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'productOfInterest' && key !== 'phone' && key !== 'quantity' && key !== 'eventName' && key !== 'designIdea' && key !== 'orderType') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    // Validate orderType if it's required
    if (!formData.orderType || !formData.orderType.trim()) {
      newErrors.orderType = 'Please select an order type';
    }

    // Validate optional phone if provided
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) {
        newErrors.phone = phoneError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Validate field on change if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({
        ...errors,
        [name]: error
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched({
      ...touched,
      [name]: true
    });

    // Validate on blur
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;

    // Validate entire form
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allTouched = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    // Simulate form submission
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In Phase 2, this would be an actual API call:
      // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
      // Or Firebase function, email service, etc.
      
      console.log('✅ Form submitted successfully:', formData);
      console.log('Timestamp:', new Date().toISOString());
      
      // Success!
      setSubmitStatus('success');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          orderType: '',
          quantity: '',
          eventName: '',
          designIdea: '',
          productOfInterest: '',
          message: ''
        });
        setErrors({});
        setTouched({});
        setSubmitStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get input class names with error state
  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 border rounded-lg transition-all duration-200";
    const focusClass = "focus:ring-2 focus:ring-primary-500 focus:outline-none";
    
    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClass} border-red-500 focus:border-red-500 ${focusClass}`;
    }
    
    return `${baseClass} border-gray-300 focus:border-primary-500 ${focusClass}`;
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO 
        title="Contact Us - The CustomHub"
        description="Get in touch with The CustomHub for questions about Indian cultural merchandise, custom orders for sports teams, school events, family vacations, or bulk purchases. We're here to help!"
        keywords="contact, customer service, custom orders, bulk orders, Indian merchandise inquiry, custom t-shirts, sports team apparel"
        canonical="https://thecustomhub.com/contact"
      />

      <div className="min-h-screen py-8 bg-primary-50 page-transition">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Contact Us
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Have questions about our Indian cultural merchandise or need help with a custom design for your sports team, 
                family event, or concert group? We'd love to hear from you!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Form - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="card p-6 md:p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <h2 className="text-2xl font-semibold mb-2 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send us a message
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Fill out the form below and we'll get back to you within 24 hours
                  </p>
                  
                  {/* Success Message */}
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-start animate-fade-in">
                      <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Message sent successfully!</p>
                        <p className="text-sm mt-1">Thank you for contacting us. We'll get back to you soon.</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start animate-fade-in">
                      <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Submission failed</p>
                        <p className="text-sm mt-1">Please try again or contact us directly via email.</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('name')}
                        placeholder="John Doe"
                        aria-required="true"
                        aria-invalid={errors.name && touched.name ? 'true' : 'false'}
                        aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
                        disabled={isSubmitting}
                      />
                      {errors.name && touched.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('email')}
                        placeholder="john@example.com"
                        aria-required="true"
                        aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                        aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                        disabled={isSubmitting}
                      />
                      {errors.email && touched.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('phone')}
                        placeholder="+1 (508) 733-4489"
                        aria-invalid={errors.phone && touched.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
                        disabled={isSubmitting}
                      />
                      {errors.phone && touched.phone && (
                        <p id="phone-error" className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Order Type Dropdown */}
                    <div>
                      <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-2">
                        What type of order are you interested in? <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="orderType"
                        name="orderType"
                        value={formData.orderType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('orderType')}
                        disabled={isSubmitting}
                        required
                        aria-required="true"
                      >
                        <option value="">Select...</option>
                        <optgroup label="Shop">
                          <option value="indian-product">Question about Indian products</option>
                          <option value="custom-indian">Custom Indian design</option>
                        </optgroup>
                        <optgroup label="Custom American Lifestyle">
                          <option value="sports">Sports team/event</option>
                          <option value="school">School/competition (robotics, etc.)</option>
                          <option value="family">Family event/vacation</option>
                          <option value="holiday">Holiday/party</option>
                          <option value="popculture">Concert/celebrity/pop culture</option>
                          <option value="corporate">Corporate/organization</option>
                          <option value="other-custom">Other custom design</option>
                        </optgroup>
                        <option value="general">General question</option>
                      </select>
                      {errors.orderType && touched.orderType && (
                        <p className="mt-1 text-sm text-red-600">{errors.orderType}</p>
                      )}
                    </div>

                    {/* Quantity Dropdown */}
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                        How many items? <span className="text-gray-400 text-xs">(helps us quote accurately)</span>
                      </label>
                      <select
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className={getInputClassName('quantity')}
                        disabled={isSubmitting}
                      >
                        <option value="">Select quantity (optional)</option>
                        <option value="1-11">1-11 items</option>
                        <option value="12-24">12-24 items (15% off)</option>
                        <option value="25-49">25-49 items (20% off)</option>
                        <option value="50+">50+ items (25% off)</option>
                      </select>
                    </div>

                    {/* Event/Occasion Name */}
                    <div>
                      <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                        Event/Occasion Name <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="eventName"
                        name="eventName"
                        value={formData.eventName}
                        onChange={handleChange}
                        className={getInputClassName('eventName')}
                        placeholder="e.g., 'Taylor Swift KC Concert Squad' or 'Smith Family Reunion 2025'"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Design Idea */}
                    <div>
                      <label htmlFor="designIdea" className="block text-sm font-medium text-gray-700 mb-2">
                        Design Idea <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <textarea
                        id="designIdea"
                        name="designIdea"
                        rows="4"
                        value={formData.designIdea}
                        onChange={handleChange}
                        className={getInputClassName('designIdea')}
                        placeholder="Tell us your vision! Or just say 'need help with ideas'"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Product of Interest Dropdown */}
                    <div>
                      <label htmlFor="productOfInterest" className="block text-sm font-medium text-gray-700 mb-2">
                        Product of Interest <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <select
                        id="productOfInterest"
                        name="productOfInterest"
                        value={formData.productOfInterest}
                        onChange={handleChange}
                        className={getInputClassName('productOfInterest')}
                        disabled={isSubmitting}
                      >
                        <option value="">Select a product (optional)</option>
                        <optgroup label="Apparel">
                          {products
                            .filter(p => p.category === 'apparel')
                            .map(product => (
                              <option key={product.id} value={product.id}>
                                {product.title}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Home Decor">
                          {products
                            .filter(p => p.category === 'home-decor')
                            .map(product => (
                              <option key={product.id} value={product.id}>
                                {product.title}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Accessories">
                          {products
                            .filter(p => p.category === 'accessories')
                            .map(product => (
                              <option key={product.id} value={product.id}>
                                {product.title}
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Message Field */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('message')}
                        placeholder="Tell us about your inquiry or custom order requirements..."
                        aria-required="true"
                        aria-invalid={errors.message && touched.message ? 'true' : 'false'}
                        aria-describedby={errors.message && touched.message ? 'message-error' : undefined}
                        disabled={isSubmitting}
                      />
                      <div className="mt-1 flex justify-between items-start">
                        {errors.message && touched.message ? (
                          <p id="message-error" className="text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.message}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Minimum 10 characters
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formData.message.length} / 1000
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className={`w-full btn-primary flex items-center justify-center ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Message
                        </>
                      )}
                    </button>

                    {/* Required Fields Note */}
                    <p className="text-xs text-gray-500 text-center">
                      <span className="text-red-500">*</span> Required fields
                    </p>
                  </form>
                </div>
              </div>

              {/* Contact Information Sidebar - Takes 1 column */}
              <div className="space-y-6">
                {/* Contact Details Card */}
                <div className="card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Get in Touch
                  </h2>
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                        <a href="mailto:personalizedbyrisa@gmail.com" className="text-primary-600 hover:underline text-sm">
                          personalizedbyrisa@gmail.com
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                        <a href="tel:+15087334489" className="text-secondary-600 hover:underline text-sm">
                          +1 (508) 733-4489
                        </a>
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                        <p className="text-gray-600 text-sm">
                          Monday - Friday<br />
                          9:00 AM - 6:00 PM EST<br />
                          <span className="text-gray-500">Weekends: Closed</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manual Ordering Info */}
                <div className="card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Manual Ordering Process
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    While we link to external marketplaces for easy purchasing, we also accept 
                    direct orders through our contact form for:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Custom product designs
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Bulk orders (10+ items)
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Special occasion gifts
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Questions about products
                    </li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-200">
                    💡 We typically respond within 24 hours during business days
                  </p>
                </div>

                {/* Why Choose Us */}
                <div className="card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <h3 className="text-lg font-semibold mb-4">Why Choose Us?</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2 font-bold">✓</span>
                      <span>Authentic Indian cultural merchandise & Bollywood products</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2 font-bold">✓</span>
                      <span>High-quality products with detailed specifications</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2 font-bold">✓</span>
                      <span>Custom order options available</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2 font-bold">✓</span>
                      <span>Fast shipping and excellent customer service</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2 font-bold">✓</span>
                      <span>Bulk order discounts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
