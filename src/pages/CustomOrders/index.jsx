import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import emailjs from '@emailjs/browser';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import SEO from '../../components/SEO';
import { firebaseStorage } from '../../lib/firebase';
import emailjsConfig from '../../config/emailjs.config';
import { CATEGORIES, CATEGORY_NAMES, SIZES, COLORS, WHATSAPP_NUMBER } from './constants';

/**
 * CustomOrders — the bulk-order stepper flow
 * (mockups/custom-order-page-mockup.html): product -> color -> size-row
 * bulk builder -> placement-aware uploads -> notes/contact -> summary bar.
 *
 * File uploads go to Firebase Storage under `custom-uploads/{timestamp}/`
 * and the resulting URLs ride along in the EmailJS submission (EmailJS
 * itself can't carry file attachments). If Storage write rules block an
 * anonymous upload, we don't fail the whole submission — we still send the
 * text order and tell the customer to forward the design via WhatsApp.
 */
const CustomOrders = () => {
  const rowIdRef = useRef(0);
  const nextRowId = () => {
    rowIdRef.current += 1;
    return rowIdRef.current;
  };

  const [cat, setCat] = useState(null);
  const [color, setColor] = useState('Black');
  const [rows, setRows] = useState([]);
  const [totalQty, setTotalQty] = useState(1);
  const [placement, setPlacement] = useState('front');
  const [files, setFiles] = useState({ front: null, back: null });
  const [previews, setPreviews] = useState({ front: null, back: null });
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { status: 'success'|'error', storageBlocked?, message? }

  const isApparel = cat && cat !== 'mug';
  const assignedQty = rows.reduce((sum, r) => sum + r.qty, 0);

  const handlePickCategory = (catId) => {
    setCat(catId);
    setColor('Black');
    setRows([{ id: nextRowId(), size: SIZES[catId][0], qty: 1 }]);
    setTotalQty(1);
    setPlacement('front');
    setFiles({ front: null, back: null });
    setPreviews({ front: null, back: null });
    setResult(null);
  };

  const handleAddRow = (size, qty) => {
    setRows((prev) => [...prev, { id: nextRowId(), size: size || SIZES[cat][0], qty: qty || 1 }]);
  };

  const handleRemoveRow = (id) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleRowSizeChange = (id, size) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, size } : r)));
  };

  const handleRowQtyChange = (id, delta) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, qty: Math.max(1, r.qty + delta) } : r)));
  };

  const handleTotalQtyChange = (delta) => {
    setTotalQty((prev) => Math.max(1, prev + delta));
  };

  const handlePlacementChange = (value) => {
    setPlacement(value);
    if (value !== 'both') {
      setFiles((prev) => ({ ...prev, back: null }));
      setPreviews((prev) => ({ ...prev, back: null }));
    }
  };

  const handleFileChange = (side, fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    setFiles((prev) => ({ ...prev, [side]: file }));
    if (file.type.startsWith('image/')) {
      setPreviews((prev) => ({ ...prev, [side]: URL.createObjectURL(file) }));
    } else {
      setPreviews((prev) => ({ ...prev, [side]: null }));
    }
  };

  const uploadDesign = async (side) => {
    const file = files[side];
    if (!file) return '';
    const path = `custom-uploads/${Date.now()}/${side}-${file.name}`;
    const fileRef = storageRef(firebaseStorage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!cat) {
      setResult({ status: 'error', message: 'Pick what we’re making first.' });
      return;
    }
    if (!name.trim() || !email.trim()) {
      setResult({ status: 'error', message: 'Your name and email are required so we can send the mockup.' });
      return;
    }

    setSubmitting(true);
    setResult(null);

    let frontUrl = '';
    let backUrl = '';
    let storageBlocked = false;

    try {
      if (files.front) frontUrl = await uploadDesign('front');
    } catch (err) {
      console.warn('Design upload failed (front), falling back to WhatsApp:', err);
      storageBlocked = true;
    }
    try {
      if (files.back) backUrl = await uploadDesign('back');
    } catch (err) {
      console.warn('Design upload failed (back), falling back to WhatsApp:', err);
      storageBlocked = true;
    }

    try {
      if (!emailjsConfig.serviceId || !emailjsConfig.templateId || !emailjsConfig.publicKey) {
        throw new Error('EmailJS is not configured.');
      }

      const sizesBreakdown = rows.map((r) => `${r.qty} ${r.size}`).join(', ');
      const uploadNote = storageBlocked
        ? "Customer's design file could not be auto-attached — follow up on WhatsApp for the file."
        : '';

      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        {
          from_name: name,
          from_email: email,
          order_type: CATEGORY_NAMES[cat],
          color: isApparel ? color : 'N/A',
          quantity: assignedQty,
          sizes_breakdown: sizesBreakdown,
          placement: isApparel ? placement : 'N/A',
          design_front_url: frontUrl || 'Not uploaded',
          design_back_url: backUrl || 'Not uploaded',
          notes: [notes, uploadNote].filter(Boolean).join('\n\n') || 'None provided',
          timestamp: new Date().toISOString(),
        },
        emailjsConfig.publicKey
      );

      setResult({ status: 'success', storageBlocked });
    } catch (err) {
      console.error('Custom order submission error:', err);
      setResult({ status: 'error', message: 'Something went wrong sending your request. Please try again or WhatsApp us directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I'd like to send over a design file for my custom order request."
  )}`;

  return (
    <>
      <SEO
        title="Custom Orders — The CustomHub"
        description="Custom desi apparel for your crew — pick the product, pick the look, drop your design. Free mockup within 24 hours, no minimums, bulk discounts."
        keywords="custom t-shirts, bulk custom apparel, custom mugs, custom sweatshirts, group discounts, free design mockup"
        canonical="https://thecustomhub.com/custom-orders"
      />

      <div className="min-h-screen bg-cream page-transition">
        <header className="text-center pt-10 pb-2 px-6">
          <h1 className="display text-[clamp(30px,4vw,46px)] text-ink">
            Custom for <em className="not-italic text-rani">your crew</em>
          </h1>
          <p className="mt-2.5 max-w-[52ch] mx-auto text-[#4a4356] text-base">
            Pick the product, pick the look, drop your design. We send a free mockup within 24
            hours — you pay nothing until you love it.
          </p>
        </header>

        <div className="max-w-[960px] mx-auto px-6">
          {/* STEP 1 — Category */}
          <Step number={1} title="What are we making?" done={Boolean(cat)}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handlePickCategory(c.id)}
                  className={`pop-border text-center px-3 py-4.5 transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-ink)] ${
                    cat === c.id ? 'bg-rani text-white shadow-[4px_4px_0_var(--color-ink)]' : 'bg-cream text-ink'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-11 h-11 mx-auto mb-2">
                    <path d={c.path} />
                  </svg>
                  <span className="display block text-base">{c.name}</span>
                  <span className="text-[11px] font-medium opacity-75">{c.sub}</span>
                </button>
              ))}
            </div>
          </Step>

          {/* STEP 2 — Color (apparel only) */}
          {cat && isApparel && (
            <Step number={2} title="Pick your color">
              <div className="flex gap-3 flex-wrap">
                {COLORS.map((c) => (
                  <div key={c.name} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setColor(c.name)}
                      aria-label={c.name}
                      aria-pressed={color === c.name}
                      className="w-[46px] h-[46px] rounded-full border-[3px] border-ink relative transition-transform hover:scale-110"
                      style={{ background: c.hex }}
                    >
                      {color === c.name && (
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-lg" style={{ color: c.text }}>
                          ✓
                        </span>
                      )}
                    </button>
                    <span className="text-xs font-semibold mt-1">{c.name}</span>
                  </div>
                ))}
              </div>
            </Step>
          )}

          {/* STEP 3 — Quantity + size breakdown */}
          {cat && (
            <Step number={isApparel ? 3 : 2} title="How many & what sizes?">
              <label htmlFor="total-qty" className="block text-[13px] font-bold mb-1.5">Total pieces needed</label>
              <div className="flex items-center w-max border-[3px] border-ink">
                <button
                  type="button"
                  onClick={() => handleTotalQtyChange(-1)}
                  className="w-[42px] h-11 bg-marigold font-bold text-xl"
                  aria-label="Decrease total pieces"
                >
                  −
                </button>
                <input
                  id="total-qty"
                  value={totalQty}
                  readOnly
                  className="w-16 h-11 text-center font-bold text-base border-x-[3px] border-ink bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleTotalQtyChange(1)}
                  className="w-[42px] h-11 bg-marigold font-bold text-xl"
                  aria-label="Increase total pieces"
                >
                  +
                </button>
              </div>
              <p className="text-[13px] text-[#6a6376] mt-2">10+ pieces unlock group discounts automatically.</p>

              <label className="block text-[13px] font-bold mt-3.5 mb-1.5">
                Size breakdown <span className="font-medium text-[#6a6376]">— same design, mix any sizes</span>
              </label>
              <div className="space-y-2.5">
                {rows.map((row) => (
                  <div key={row.id} className="flex items-center gap-3 flex-wrap">
                    <select
                      value={row.size}
                      onChange={(e) => handleRowSizeChange(row.id, e.target.value)}
                      className="w-[130px] px-3 py-2 border-[2.5px] border-ink bg-cream text-ink"
                    >
                      {SIZES[cat].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div className="flex items-center border-[3px] border-ink w-max scale-[0.92] origin-left">
                      <button type="button" onClick={() => handleRowQtyChange(row.id, -1)} className="w-[42px] h-11 bg-marigold font-bold text-xl" aria-label={`Decrease quantity for ${row.size}`}>−</button>
                      <input value={row.qty} readOnly className="w-16 h-11 text-center font-bold border-x-[3px] border-ink bg-white" />
                      <button type="button" onClick={() => handleRowQtyChange(row.id, 1)} className="w-[42px] h-11 bg-marigold font-bold text-xl" aria-label={`Increase quantity for ${row.size}`}>+</button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddRow(row.size, row.qty)}
                      title="Duplicate this row"
                      className="w-[38px] h-[38px] border-[2.5px] border-ink bg-cream font-bold hover:bg-marigold transition-colors"
                    >
                      ⧉
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      title="Remove row"
                      disabled={rows.length <= 1}
                      className="w-[38px] h-[38px] border-[2.5px] border-ink bg-cream font-bold hover:bg-rani hover:text-white transition-colors disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 flex-wrap mt-3">
                <button type="button" onClick={() => handleAddRow()} className="border-[3px] border-ink bg-cream px-4.5 py-2.5 font-bold text-sm hover:bg-marigold transition-colors">
                  + Add another size
                </button>
                <span className={`text-[13px] font-bold ${assignedQty === totalQty ? 'text-peacock' : 'text-rani'}`}>
                  {assignedQty === totalQty
                    ? `✓ ${assignedQty} of ${totalQty} assigned`
                    : assignedQty < totalQty
                      ? `${assignedQty} of ${totalQty} assigned — ${totalQty - assignedQty} to go`
                      : `${assignedQty} assigned but total says ${totalQty} — bump the total or trim a row`}
                </span>
              </div>
            </Step>
          )}

          {/* STEP 4 — Design upload + placement */}
          {cat && (
            <Step number={isApparel ? 4 : 3} title="Your design">
              {isApparel && (
                <div className="mb-4.5">
                  <label htmlFor="placement" className="block text-[13px] font-bold mb-1.5">Where should it be printed?</label>
                  <select
                    id="placement"
                    value={placement}
                    onChange={(e) => handlePlacementChange(e.target.value)}
                    className="max-w-[320px] w-full px-3.5 py-3 border-[2.5px] border-ink bg-cream text-ink"
                  >
                    <option value="front">Front only</option>
                    <option value="back">Back only</option>
                    <option value="both">Both — front &amp; back</option>
                  </select>
                </div>
              )}

              <label className="block text-[13px] font-bold mb-1.5">Upload your design</label>
              <div className={`grid gap-3.5 ${placement === 'both' && isApparel ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <UploadBox
                  side={placement === 'back' ? 'back' : 'front'}
                  tag={placement === 'both' && isApparel ? 'FRONT' : null}
                  preview={previews.front}
                  fileName={files.front?.name}
                  onChange={(fl) => handleFileChange('front', fl)}
                />
                {placement === 'both' && isApparel && (
                  <UploadBox
                    side="back"
                    tag="BACK"
                    preview={previews.back}
                    fileName={files.back?.name}
                    onChange={(fl) => handleFileChange('back', fl)}
                  />
                )}
              </div>
              <p className="text-[13px] text-[#6a6376] mt-3">
                No design yet? No tension — describe the idea in the notes and our designers
                will create it for you (that&apos;s the free mockup).
              </p>
            </Step>
          )}

          {/* STEP 5 — Notes + contact */}
          {cat && (
            <Step number={isApparel ? 5 : 4} title="Almost done">
              <label htmlFor="notes" className="block text-[13px] font-bold mb-1.5">
                Notes — deadline, names on backs, idea details
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Need by Oct 10 for Durga Puja. Text on back should say 'Dhaaker Taal'. Player names: see list…"
                className="w-full px-3.5 py-3 border-[2.5px] border-ink bg-cream text-ink resize-y"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                <div>
                  <label htmlFor="cname" className="block text-[13px] font-bold mb-1.5">Your name</label>
                  <input
                    id="cname"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    required
                    className="w-full px-3.5 py-3 border-[2.5px] border-ink bg-cream text-ink"
                  />
                </div>
                <div>
                  <label htmlFor="cemail" className="block text-[13px] font-bold mb-1.5">Email</label>
                  <input
                    id="cemail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="w-full px-3.5 py-3 border-[2.5px] border-ink bg-cream text-ink"
                  />
                </div>
              </div>
            </Step>
          )}

          {/* SUMMARY BAR */}
          {cat && (
            <form onSubmit={handleSubmit}>
              <div className="bg-ink text-cream pop-border my-6.5 p-6 md:p-7 flex justify-between items-center gap-5 flex-wrap">
                <div className="text-sm text-[#cfc8dd]">
                  Your order: <b className="text-marigold">{assignedQty}×</b> {CATEGORY_NAMES[cat]}
                  {isApparel && <> · <b className="text-marigold">{color}</b></>}
                  {' '}· sizes: <b className="text-marigold">{rows.map((r) => `${r.qty} ${r.size}`).join(', ')}</b>
                  {isApparel && <> · print: <b className="text-marigold">{placement === 'both' ? 'front & back' : placement}</b></>}
                </div>
                <button type="submit" className="btn-primary" disabled={submitting} aria-busy={submitting}>
                  {submitting ? 'Sending…' : 'Get My Free Mockup →'}
                </button>
              </div>

              {result?.status === 'success' && (
                <p className="text-sm font-semibold text-peacock mb-6" role="status">
                  Ho gaya! (&quot;It&apos;s done!&quot;) Your request is in — free mockup within 24 hours.
                  {result.storageBlocked && (
                    <>
                      {' '}
                      We couldn&apos;t auto-attach your design file — please{' '}
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="underline text-rani">
                        send it to us on WhatsApp
                      </a>{' '}
                      so we don&apos;t lose it.
                    </>
                  )}
                </p>
              )}
              {result?.status === 'error' && (
                <p className="text-sm font-semibold text-rani mb-6" role="alert">
                  {result.message}
                </p>
              )}
            </form>
          )}
        </div>

        <footer className="text-center py-8 text-[13px] text-[#6a6376]">
          The CustomHub · Free mockup first, payment later · Local pickup in MA ·{' '}
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="underline">
            WhatsApp us anytime
          </a>
        </footer>
      </div>
    </>
  );
};

/** Numbered step card shell (mockup `.step`) */
const Step = ({ number, title, done, children }) => (
  <div className="pop-border bg-white my-6.5 p-6.5 md:p-7">
    <h2 className="text-xl flex items-center gap-3 mb-4.5 font-bold text-ink">
      <span
        className={`display w-[34px] h-[34px] border-[3px] border-ink rounded-full flex items-center justify-center text-[17px] flex-shrink-0 ${
          done ? 'bg-peacock text-white' : 'bg-marigold text-ink'
        }`}
      >
        {done ? '✓' : number}
      </span>
      {title}
    </h2>
    {children}
  </div>
);

/** Design file drop/click box with a live preview (mockup `.up`) */
const UploadBox = ({ side, tag, preview, fileName, onChange }) => {
  const inputRef = useRef(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
      className={`relative border-[3px] border-dashed border-ink bg-cream text-center px-5 py-5.5 cursor-pointer min-h-[150px] flex flex-col items-center justify-center gap-1.5 hover:bg-[#fff0d6] transition-colors ${
        preview || fileName ? 'border-solid bg-white' : ''
      }`}
    >
      {tag && (
        <span className="absolute -top-3.5 left-3.5 bg-peacock text-white border-[2.5px] border-ink rounded-full px-3.5 py-0.5 text-xs font-bold">
          {tag}
        </span>
      )}
      {preview ? (
        <>
          <img src={preview} alt="" className="max-h-[130px] max-w-full border-2 border-ink" />
          <span className="text-xs text-[#6a6376]">{fileName} — click to replace</span>
        </>
      ) : (
        <>
          <span className="text-3xl">⬆</span>
          <span className="text-sm font-bold">
            Click to upload — this goes on the <b>{side}</b>
          </span>
          <span className="text-xs text-[#6a6376]">PNG, JPG or PDF · max 20MB · don&apos;t worry, we&apos;ll clean it up</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files)}
      />
    </div>
  );
};

Step.propTypes = {
  number: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  done: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

UploadBox.propTypes = {
  side: PropTypes.oneOf(['front', 'back']).isRequired,
  tag: PropTypes.string,
  preview: PropTypes.string,
  fileName: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default CustomOrders;
