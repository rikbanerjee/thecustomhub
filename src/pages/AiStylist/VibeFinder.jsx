import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getProductsByVibe } from '../../utils/dataHelpers';
import { getFirebaseImageUrl } from '../../utils/imageHelpers';

const WHO_OPTIONS = [
  { v: 'me', label: 'Me, obviously' },
  { v: 'gift', label: 'A gift' },
  { v: 'group', label: 'My whole crew' },
];

const VIBE_OPTIONS = [
  { v: 'filmy', label: 'Filmy 🎬' },
  { v: 'bangali', label: 'Bangali ❤️' },
  { v: 'nerdy', label: 'Nerdy 🤓' },
  { v: 'sporty', label: 'Sporty 🏏' },
];

const TYPE_OPTIONS = [
  { v: 'tee', label: 'Tees' },
  { v: 'sweatshirt', label: 'Sweatshirts' },
  { v: 'mug', label: 'Mugs' },
  { v: 'any', label: 'Surprise me' },
];

const TYPE_TO_PRODUCT_TYPE = {
  tee: 'T-Shirts',
  sweatshirt: 'Sweatshirts',
  mug: 'Coffee and Tea Cups',
};

/**
 * VibeFinder — 3-tap quiz -> instant recommendations from the real
 * catalog. Zero LLM tokens (Tier 0, see docs/AI_FIRST_PLAN.md): it's a
 * static filter over products.json via dataHelpers.getProductsByVibe.
 */
const VibeFinder = () => {
  const [who, setWho] = useState(null);
  const [vibe, setVibe] = useState(null);
  const [type, setType] = useState(null);

  const ready = who && vibe && type;

  let matches = [];
  let fallbackNote = false;
  if (ready) {
    const byVibe = getProductsByVibe(vibe);
    const productType = TYPE_TO_PRODUCT_TYPE[type];
    matches = productType ? byVibe.filter((p) => p.type === productType) : byVibe;
    if (matches.length === 0) {
      matches = byVibe;
      fallbackNote = true;
    }
    matches = matches.slice(0, 6);
  }

  return (
    <div className="pop-border bg-white">
      <div className="bg-ink text-cream px-4.5 py-3.5 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#41d98d]" />
        <h2 className="display text-base tracking-wide">Vibe Finder</h2>
        <span className="ml-auto text-[11px] text-[#9a92ab] font-semibold">3 taps · instant</span>
      </div>

      <div className="p-5">
        <QuizStep
          index={1}
          question="Who's this for?"
          options={WHO_OPTIONS}
          selected={who}
          onSelect={setWho}
        />
        <QuizStep
          index={2}
          question="Pick a vibe"
          options={VIBE_OPTIONS}
          selected={vibe}
          onSelect={setVibe}
        />
        <QuizStep
          index={3}
          question="What kind of thing?"
          options={TYPE_OPTIONS}
          selected={type}
          onSelect={setType}
        />
      </div>

      {ready && (
        <div className="px-5 pb-5">
          <h3 className="text-sm font-bold mb-3">
            Your matches <em className="not-italic text-peacock">· picked from our real catalog{fallbackNote ? ' (nothing exact — here’s the vibe in other formats)' : ''}</em>
          </h3>
          {matches.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {matches.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="pop-border bg-white block transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-ink)]"
                  style={{ borderWidth: '2.5px' }}
                >
                  <div className="aspect-square overflow-hidden border-b-[2.5px] border-ink bg-[#f3ecdd]">
                    <img
                      src={getFirebaseImageUrl(p.images?.[0])}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs font-bold px-2.5 pt-2 leading-tight">{p.title}</div>
                  <div className="text-xs font-bold text-rani px-2.5 pb-2.5">${p.price}</div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#6a6376] border-2 border-dashed border-ink p-4 text-center">
              Nothing matched yet — try a different vibe or product type.
            </p>
          )}
          {who === 'group' && (
            <p className="mt-3 text-[13px] font-semibold">
              Ordering for a crew?{' '}
              <Link to="/custom-orders" className="text-rani underline">
                The bulk builder
              </Link>{' '}
              does mixed sizes + group discounts.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const QuizStep = ({ index, question, options, selected, onSelect }) => (
  <div className="mb-4.5 last:mb-0">
    <div className="font-bold text-[15px] mb-2.5">
      {index} · {question}{' '}
      {selected && <small className="text-rani font-semibold">— {options.find((o) => o.v === selected)?.label}</small>}
    </div>
    <div className="flex gap-2.5 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.v}
          type="button"
          onClick={() => onSelect(opt.v)}
          aria-pressed={selected === opt.v}
          className={`border-[2.5px] border-ink px-4 py-2.5 font-bold text-[13px] transition-colors ${
            selected === opt.v ? 'bg-ink text-marigold' : 'bg-cream text-ink hover:bg-marigold'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

QuizStep.propTypes = {
  index: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ v: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default VibeFinder;
