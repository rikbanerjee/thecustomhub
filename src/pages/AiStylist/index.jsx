import SEO from '../../components/SEO';
import VibeFinder from './VibeFinder';
import HubBotChat from './HubBotChat';

/**
 * AI Stylist — Vibe Finder quiz + HubBot chat (mockups/ai-stylist-mockup.html).
 * Phase A of docs/AI_FIRST_PLAN.md: zero LLM tokens, entirely client-side
 * filtering/rules over the real catalog. "AI Stylist" is honest marketing
 * here because the quiz genuinely is smart matching — see the honesty
 * guardrail in AI_FIRST_PLAN.md §5 for why we don't call it an "AI chat"
 * until an LLM tier actually ships.
 */
const AiStylist = () => {
  return (
    <>
      <SEO
        title="AI Stylist — The CustomHub"
        description="Find your desi vibe in 3 taps, or ask HubBot. Instant matching across every design, size and ship date — no waiting, no tokens."
        keywords="ai custom t-shirt design, ai personalized gifts, gift finder, desi style quiz"
        canonical="https://thecustomhub.com/ai-stylist"
      />

      <div className="min-h-screen bg-cream page-transition">
        <header className="text-center pt-9 pb-2.5 px-6">
          <h1 className="display text-[clamp(28px,3.6vw,42px)] text-ink">
            Meet your <em className="not-italic text-rani">AI stylist</em>
          </h1>
          <p className="mt-2.5 max-w-[56ch] mx-auto text-[#4a4356] text-[15px]">
            Three taps to find your vibe, or just ask HubBot. It knows every design, size,
            shipping — and when to call a human.
          </p>
          <div className="inline-block bg-ink text-marigold rounded-full px-4 py-1.5 text-xs font-bold tracking-wide mt-3.5">
            ✦ AI-POWERED · <b className="text-cream">HUMAN-FINISHED</b>
          </div>
        </header>

        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5.5 py-7 pb-12">
          <VibeFinder />
          <HubBotChat />
        </div>

        <div className="max-w-[1100px] mx-auto px-6 pb-14">
          <div className="pop-border bg-ink text-cream px-6.5 py-5.5">
            <h3 className="display text-lg text-marigold mb-2">How we keep AI fast (and affordable)</h3>
            <p className="text-[13.5px] text-[#cfc8dd] max-w-[90ch]">
              This whole page answers from <b className="text-cream">our own catalog first</b> —
              quiz matching and common questions cost nothing and reply instantly. Only
              genuinely new questions would reach a small language model (with the catalog
              cached), and anything tricky goes straight to{' '}
              <b className="text-cream">a real human on WhatsApp</b>. Small studio, big-brand
              experience, no venture funding required.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiStylist;
