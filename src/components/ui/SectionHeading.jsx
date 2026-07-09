import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * SectionHeading — the recurring "display heading + optional right-aligned
 * link" row used between every homepage section in the mockup
 * (mockups/homepage-hybrid-mockup.html `.sec-head`).
 *
 * `emphasis` is rendered in rani (matches mockup's `.sec-head h2 em`).
 *
 * Example:
 *   <SectionHeading title="Shop by" emphasis="category" action={{ to: '/category/t-shirts', label: '4 collections →' }} />
 */
const SectionHeading = ({ title, emphasis, action, className = '' }) => {
  return (
    <div className={`flex items-baseline justify-between gap-4 flex-wrap mb-8 ${className}`}>
      <h2 className="display text-[clamp(24px,2.6vw,34px)] text-ink">
        {title}{' '}
        {emphasis && <em className="not-italic text-rani">{emphasis}</em>}
      </h2>
      {action && (
        action.to ? (
          <Link to={action.to} className="font-bold text-peacock hover:text-rani transition-colors whitespace-nowrap">
            {action.label}
          </Link>
        ) : (
          <a href={action.href} className="font-bold text-peacock hover:text-rani transition-colors whitespace-nowrap">
            {action.label}
          </a>
        )
      )}
    </div>
  );
};

SectionHeading.propTypes = {
  title: PropTypes.node.isRequired,
  emphasis: PropTypes.node,
  action: PropTypes.shape({
    to: PropTypes.string,
    href: PropTypes.string,
    label: PropTypes.node,
  }),
  className: PropTypes.string,
};

export default SectionHeading;
