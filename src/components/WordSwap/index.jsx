import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const INTERVAL_MS = 2200;
const FADE_MS = 200;

/**
 * WordSwap — the hero's rotating headline word ("Filmy" → "Desi" → ...).
 * Replaces the old auto-rotating slide carousel with a lightweight,
 * always-in-place JS word-swap (mockups/homepage-hybrid-mockup.html).
 *
 * Respects prefers-reduced-motion by freezing on the first word instead
 * of cycling — a decorative animation isn't worth motion-sickness risk.
 */
const WordSwap = ({ words, className = '' }) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    if (reducedMotion.current || words.length < 2) return undefined;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span
      className={`inline-block min-w-[5ch] border-b-[5px] border-marigold text-rani transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {words[index]}
    </span>
  );
};

WordSwap.propTypes = {
  words: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

export default WordSwap;
