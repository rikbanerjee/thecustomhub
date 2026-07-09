import PropTypes from 'prop-types';

/**
 * Marquee — scrolling ribbon strip between homepage sections
 * (mockups/homepage-hybrid-mockup.html `.marquee`).
 *
 * CSS-driven animation (see .marquee-track in src/styles/index.css):
 * pauses on hover, and honors prefers-reduced-motion (animation removed
 * entirely so the phrase list still reads fine as a static line).
 *
 * @param {Array<string>} items - phrases separated by a star glyph
 */
const Marquee = ({ items }) => {
  // Duplicate the content once so the -50% translateX loop is seamless.
  const content = (
    <>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <b className="text-cream mx-4">★</b>
          {item}
        </span>
      ))}
    </>
  );

  return (
    <div
      className="marquee bg-ink text-marigold overflow-hidden whitespace-nowrap py-2.5 font-bold text-sm tracking-wide"
      role="marquee"
      aria-label="Store highlights"
    >
      <div className="marquee-track">
        {content}
        {content}
      </div>
    </div>
  );
};

Marquee.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Marquee;
