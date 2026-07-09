/**
 * Festival countdown config for the homepage banner.
 *
 * Each entry needs an order-by date (last date we can guarantee delivery)
 * and the actual festival date for display. The banner surfaces whichever
 * upcoming festival's `orderBy` date is soonest, and hides entirely if
 * nothing is within `VISIBLE_WITHIN_DAYS`.
 *
 * Dates are in the "next occurrence" form — bump the year forward each
 * time a festival passes so the banner keeps working without code changes
 * for the current one, but keep an eye on this file once or twice a year.
 */

export const VISIBLE_WITHIN_DAYS = 60;

const festivals = [
  {
    name: 'Diwali',
    displayName: 'Diwali is coming',
    date: '2026-11-08', // Diwali 2026
    orderBy: '2026-10-22',
    link: '/category/t-shirts',
    ctaLabel: 'Shop Diwali →',
  },
  {
    name: 'Durga Puja',
    displayName: 'Durga Puja is coming',
    date: '2026-10-17', // Vijayadashami 2026 (approx.)
    orderBy: '2026-09-25',
    link: '/category/t-shirts',
    ctaLabel: 'Shop Durga Puja →',
  },
  {
    name: 'Holi',
    displayName: 'Holi is coming',
    date: '2027-03-03',
    orderBy: '2027-02-15',
    link: '/category/t-shirts',
    ctaLabel: 'Shop Holi →',
  },
  {
    name: 'Rakhi',
    displayName: 'Raksha Bandhan is coming',
    date: '2026-08-28',
    orderBy: '2026-08-10',
    link: '/category/coffee-and-tea-cups',
    ctaLabel: 'Shop Rakhi gifts →',
  },
];

/**
 * Returns the nearest upcoming festival whose orderBy date is still ahead
 * of today and within VISIBLE_WITHIN_DAYS, or null if none qualify.
 * @param {Date} [now] - injectable for testing
 */
export const getNearestFestival = (now = new Date()) => {
  const upcoming = festivals
    .map((f) => ({ ...f, _orderByDate: new Date(f.orderBy) }))
    .filter((f) => f._orderByDate.getTime() >= now.setHours(0, 0, 0, 0))
    .sort((a, b) => a._orderByDate - b._orderByDate);

  if (upcoming.length === 0) return null;

  const nearest = upcoming[0];
  const daysLeft = Math.ceil((nearest._orderByDate - now) / (1000 * 60 * 60 * 24));

  if (daysLeft > VISIBLE_WITHIN_DAYS) return null;

  return { ...nearest, daysLeft };
};

export default festivals;
