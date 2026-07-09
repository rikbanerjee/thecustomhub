import { Link } from 'react-router-dom';
import { getNearestFestival } from '../../config/festivals';

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/**
 * FestivalBanner — countdown strip above "Shop by category"
 * (mockups/homepage-hybrid-mockup.html `.countdown`). Config-driven via
 * src/config/festivals.js; renders nothing if no festival's order-by date
 * falls within the next 60 days.
 */
const FestivalBanner = () => {
  const festival = getNearestFestival();
  if (!festival) return null;

  const orderByLabel = dateFormatter.format(new Date(festival.orderBy));

  return (
    <div className="pop-shadow pop-border bg-marigold px-5 py-3.5 font-bold flex items-center gap-3 flex-wrap mb-6">
      <span className="display text-xl text-ink">{festival.displayName.toUpperCase()}</span>
      <span className="text-ink">
        Order by {orderByLabel} for guaranteed delivery · {festival.daysLeft} days left
      </span>
      <Link to={festival.link} className="sticker sticker--pink ml-auto no-underline">
        {festival.ctaLabel}
      </Link>
    </div>
  );
};

export default FestivalBanner;
