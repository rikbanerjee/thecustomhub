import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Sticker — rotated pill badge ("100% Filmy", "Paisa Vasool", "36 designs"...).
 * The reusable ornament that replaces the old trust-badge checkmarks.
 *
 * @param {'marigold'|'pink'|'teal'|'ink'} tone
 * @param {-3|-1.5|0|2} rotate - degrees, matches mockup's .r1/.r2/.r3 rhythm
 */
const TONE_CLASSES = {
  marigold: '',
  pink: 'sticker--pink',
  teal: 'sticker--teal',
  ink: 'sticker--ink',
};

const ROTATE_CLASSES = {
  '-3': 'sticker--r1',
  2: 'sticker--r2',
  '-1.5': 'sticker--r3',
  0: '',
};

const Sticker = ({ children, tone = 'marigold', rotate = 0, to, href, className = '', ...rest }) => {
  const classes = `sticker ${TONE_CLASSES[tone] || ''} ${ROTATE_CLASSES[rotate] ?? ''} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={`${classes} no-underline`} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`${classes} no-underline`} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
};

Sticker.propTypes = {
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(['marigold', 'pink', 'teal', 'ink']),
  rotate: PropTypes.oneOf([-3, -1.5, 0, 2]),
  to: PropTypes.string,
  href: PropTypes.string,
  className: PropTypes.string,
};

export default Sticker;
