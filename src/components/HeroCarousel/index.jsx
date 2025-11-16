import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { heroConfig, isImageUrl, getHeroBackgroundStyle } from '../../config/heroImages';

/**
 * HeroCarousel Component
 * Auto-rotating hero carousel with smooth transitions, navigation dots, and pause on hover
 * Follows Refined Heritage design system
 */
const HeroCarousel = ({ 
  slides = [], 
  autoRotateInterval = 5000,
  showDots = true,
  showArrows = true 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Auto-rotate functionality
  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoRotateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slides.length, autoRotateInterval, isPaused]);

  // Navigation handlers
  const goToSlide = (index) => {
    setCurrentSlide(index);
    // Reset auto-rotate timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  // Single slide - no carousel needed
  if (slides.length === 1) {
    const slide = slides[0];
    const hasImage = slide.backgroundImage || (slide.background && isImageUrl(slide.background));
    const imageUrl = slide.backgroundImage || (isImageUrl(slide.background) ? slide.background : null);
    const fallbackGradient = slide.background && !isImageUrl(slide.background) 
      ? slide.background 
      : 'linear-gradient(to right, var(--color-deep-brown), var(--color-warm-taupe))';
    
    const backgroundStyle = imageUrl 
      ? getHeroBackgroundStyle(imageUrl, heroConfig.overlay.gradient, fallbackGradient)
      : { background: fallbackGradient };

    return (
      <section 
        className="relative overflow-hidden"
        style={{ 
          ...backgroundStyle,
          minHeight: '500px'
        }}
      >
        {/* Overlay for text readability (disabled for primary hero image) */}
        {false && hasImage && heroConfig.overlay.enabled && (
          <div 
            className="absolute inset-0 z-0" 
            style={{ background: heroConfig.overlay.gradient }}
          />
        )}
        {/* Hide text content for primary hero image (single slide case) */}
        {false && (
          <div className="container-custom py-20 md:py-28 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <HeroSlideContent slide={slide} />
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section 
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Hero carousel"
    >
      {/* Slides Container */}
      <div className="relative" style={{ minHeight: '500px' }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={index !== currentSlide}
          >
            <div
              className="w-full h-full flex items-center relative"
              style={{ 
                ...(slide.backgroundImage || (slide.background && isImageUrl(slide.background))
                  ? getHeroBackgroundStyle(
                      slide.backgroundImage || slide.background,
                      heroConfig.overlay.gradient,
                      slide.background && !isImageUrl(slide.background) ? slide.background : 'linear-gradient(to right, var(--color-deep-brown), var(--color-warm-taupe))'
                    )
                  : { background: slide.background || 'linear-gradient(to right, var(--color-deep-brown), var(--color-warm-taupe))' }
                ),
                minHeight: '500px'
              }}
            >
              {/* Overlay for text readability (only if image is loaded, skip for first slide) */}
              {index !== 0 && (slide.backgroundImage || (slide.background && isImageUrl(slide.background))) && heroConfig.overlay.enabled && (
                <div 
                  className="absolute inset-0 z-0" 
                  style={{ background: heroConfig.overlay.gradient }}
                />
              )}
              {/* Hide text content for primary hero image (first slide) */}
              {index !== 0 && (
                <div className="container-custom py-20 md:py-28 w-full relative z-10">
                  <div className="max-w-4xl mx-auto text-center text-white">
                    <HeroSlideContent slide={slide} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {showDots && slides.length > 1 && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2"
          role="tablist"
          aria-label="Slide indicators"
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentSlide 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentSlide}
              role="tab"
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            key={currentSlide}
            className="h-full bg-white/50"
            style={{
              width: '0%',
              animation: isPaused 
                ? 'none' 
                : `progress ${autoRotateInterval}ms linear forwards`
            }}
          />
        </div>
      )}
    </section>
  );
};

/**
 * HeroSlideContent Component
 * Renders the content for a single hero slide
 */
const HeroSlideContent = ({ slide }) => {
  return (
    <div className="animate-fade-in">
      {slide.title && (
        <h1 className="heading-font text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-white">
          {slide.title}
        </h1>
      )}
      {slide.subtitle && (
        <p className="text-xl md:text-2xl mb-4 text-white">
          {slide.subtitle}
        </p>
      )}
      {slide.description && (
        <p className="text-lg md:text-xl mb-8 text-white/95">
          {slide.description}
        </p>
      )}
      {slide.cta && slide.cta.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {slide.cta.map((button, index) => (
            <Link
              key={index}
              to={button.link || '#'}
              className={`inline-block font-semibold py-3 px-8 rounded-lg transition-all duration-200 ${
                index === 0
                  ? 'bg-white text-[#2c1810] hover:bg-[#faf7f2] shadow-xl hover:shadow-2xl hover:scale-105'
                  : 'bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#2c1810] shadow-lg'
              }`}
            >
              {button.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

HeroSlideContent.propTypes = {
  slide: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    background: PropTypes.string,
    backgroundImage: PropTypes.string,
    cta: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

HeroCarousel.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      description: PropTypes.string,
      background: PropTypes.string,
      backgroundImage: PropTypes.string,
      cta: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string.isRequired,
          link: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
  autoRotateInterval: PropTypes.number,
  showDots: PropTypes.bool,
  showArrows: PropTypes.bool,
};

export default HeroCarousel;

