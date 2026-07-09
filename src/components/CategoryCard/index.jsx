import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { getProductsByCategory } from '../../utils/dataHelpers';
import { getFirebaseImageUrl, getPlaceholderImage } from '../../utils/imageHelpers';
import categoryCopy from '../../config/categoryCopy';

const ROTATE_INTERVAL_MS = 3000;
const STAGGER_MS = 750;

/**
 * CategoryCard — homepage "Shop by category" tile.
 * Rotates through up to 4 in-stock product photos for the category, with
 * dot indicators, a product-count sticker, and a hover arrow — matching
 * mockups/homepage-hybrid-mockup.html `.cat-card` / `.cat-rotator`.
 *
 * @param {Object} category - { id, name, productCount }
 * @param {number} staggerIndex - this card's position in the grid, used to
 *   offset its rotation start so cards don't all flip in unison
 */
const CategoryCard = ({ category, staggerIndex = 0 }) => {
  // products.json is a static local import, so this is a synchronous read —
  // a lazy initializer avoids the effect+setState render cascade. category.id
  // is stable for the lifetime of a given card (keyed by it in the grid).
  const [images] = useState(() => {
    const products = getProductsByCategory(category.id).filter((p) => p.inStock);
    const firstImages = products
      .slice(0, 4)
      .map((p) => getFirebaseImageUrl(p.images?.[0]))
      .filter(Boolean);
    return firstImages.length > 0 ? firstImages : [getPlaceholderImage()];
  });
  const [active, setActive] = useState(0);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    if (images.length < 2 || prefersReducedMotion.current) return undefined;

    let interval;
    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        setActive((prev) => (prev + 1) % images.length);
      }, ROTATE_INTERVAL_MS);
    }, staggerIndex * STAGGER_MS);

    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
    };
  }, [images.length, staggerIndex]);

  const subtitle = categoryCopy[category.id] || category.description;

  return (
    <Link
      to={`/category/${category.id}`}
      className="pop-border bg-white block group transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
      aria-label={`Browse ${category.name} — ${category.productCount} ${category.productCount === 1 ? 'design' : 'designs'}`}
    >
      {/* Rotating image stage */}
      <div className="relative aspect-square border-b-[3px] border-ink bg-[#f6efe2] overflow-hidden">
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={i === 0 ? category.name : ''}
            aria-hidden={i !== 0}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              i === active ? 'opacity-100' : 'opacity-0'
            } ${i === active ? 'group-hover:scale-105' : ''}`}
            style={{ transitionProperty: 'opacity, transform', transitionDuration: i === active ? '600ms, 2500ms' : '600ms' }}
          />
        ))}

        <span className="sticker absolute top-2.5 left-2.5 z-10 text-[11px] px-2.5 py-1">
          {category.productCount} {category.productCount === 1 ? 'design' : 'designs'}
        </span>

        {images.length > 1 && (
          <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {images.map((_, i) => (
              <i
                key={i}
                className={`w-[7px] h-[7px] rounded-full border border-ink ${
                  i === active ? 'bg-marigold opacity-100' : 'bg-white opacity-50'
                }`}
              />
            ))}
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="p-3.5 px-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="display text-[19px] leading-tight text-ink">{category.name}</h3>
          {subtitle && <p className="text-xs font-medium text-[#4a4356] mt-0.5">{subtitle}</p>}
        </div>
        <span className="flex-shrink-0 w-9 h-9 border-[3px] border-ink rounded-full flex items-center justify-center font-bold text-base bg-marigold transition-all duration-150 group-hover:translate-x-1 group-hover:bg-rani group-hover:text-white">
          →
        </span>
      </div>
    </Link>
  );
};

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    productCount: PropTypes.number,
  }).isRequired,
  staggerIndex: PropTypes.number,
};

export default CategoryCard;
