/**
 * Flavor-text subtitles for homepage category cards, keyed by the
 * slugified category id (see dataHelpers.getAllCategories). Purely
 * presentational — falls back to the category's auto-generated
 * description when no entry exists here, so adding a new product `type`
 * never breaks the homepage.
 */
const categoryCopy = {
  't-shirts': 'Dual-lingo, Bollywood & techie tees',
  'coffee-and-tea-cups': 'Because mugs deserve puns too',
  sweatshirts: 'Desi warmth for NE winters',
  'sports-jerseys': 'Rep your squad, game day ready',
};

export default categoryCopy;
