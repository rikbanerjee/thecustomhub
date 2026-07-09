import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

/**
 * NotFound — catch-all 404 (mounted at path="*" in App.jsx).
 * Brand-voice copy per docs/DESIGN_REVAMP_PLAN.md §3, with a plain-English
 * echo right alongside so nobody who doesn't read Hindi gets stuck.
 */
const NotFound = () => (
  <>
    <SEO
      title="Page not found — The CustomHub"
      description="This page doesn't exist. Head back to The CustomHub to keep shopping."
    />
    <div className="min-h-[70vh] flex items-center justify-center bg-cream px-6 text-center">
      <div>
        <p className="display text-marigold text-7xl mb-2">404</p>
        <h1 className="display text-3xl md:text-4xl text-ink">
          Yeh rasta band hai.
        </h1>
        <p className="text-[#4a4356] mt-2">(This road is closed.)</p>
        <p className="text-[#4a4356] mt-4 max-w-[46ch] mx-auto">
          The page you&apos;re looking for wandered off. Let&apos;s get you back to the good
          stuff.
        </p>
        <Link to="/" className="btn-primary inline-block mt-6">
          Back to shopping →
        </Link>
      </div>
    </div>
  </>
);

export default NotFound;
