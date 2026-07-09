import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Button — "Desi Pop x Zine" CTA primitive.
 *
 * Renders a <Link> when `to` is given, an <a> when `href` is given,
 * otherwise a native <button>. Visual language: 3px ink border, hard
 * offset shadow (no blur), press-down interaction on hover, marigold
 * focus ring. See docs/DESIGN_REVAMP_PLAN.md for the rationale.
 *
 * @param {'primary'|'secondary'|'outline'} variant
 */
const VARIANT_CLASSES = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
};

const Button = ({
  children,
  variant = 'primary',
  to,
  href,
  className = '',
  type = 'button',
  ...rest
}) => {
  const classes = `${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  to: PropTypes.string,
  href: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
};

export default Button;
