import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getHubBotReply } from '../../data/hubbot-rules';
import { getFirebaseImageUrl } from '../../utils/imageHelpers';

const QUICK_REPLIES = [
  { emoji: '🎁', label: 'Find a gift', query: 'Find me a gift' },
  { emoji: '👕', label: 'Bulk order', query: 'I need a bulk order for my team' },
  { emoji: '🪔', label: 'Diwali picks', query: 'What are your Diwali picks?' },
  { emoji: '📏', label: 'Sizes', query: 'What sizes do you have?' },
];

const GREETING = {
  who: 'bot',
  text: "Namaste! 🙏 I'm HubBot — TheCustomHub's stylist-in-residence. I know every design, size and ship date. Tap a chip below or just ask.",
};

/**
 * HubBotChat — rules-based (Tier 0/1, see docs/AI_FIRST_PLAN.md) chat UI.
 * No network calls, no LLM: getHubBotReply() runs entirely client-side
 * against the real product catalog. A short "thinking" delay is purely
 * cosmetic so replies don't feel instantaneous/robotic.
 */
const HubBotChat = () => {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const ask = (query) => {
    if (!query.trim()) return;
    setMessages((prev) => [...prev, { who: 'user', text: query }]);
    setTyping(true);
    setTimeout(() => {
      const reply = getHubBotReply(query);
      setMessages((prev) => [...prev, { who: 'bot', ...reply }]);
      setTyping(false);
    }, 450);
  };

  const handleSend = () => {
    ask(input.trim());
    setInput('');
  };

  return (
    <div className="pop-border bg-white flex flex-col">
      <div className="bg-ink text-cream px-4.5 py-3.5 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#41d98d]" />
        <h2 className="display text-base tracking-wide">HubBot</h2>
        <span className="ml-auto text-[11px] text-[#9a92ab] font-semibold">answers in &lt;1s</span>
      </div>

      <div
        ref={scrollRef}
        className="h-[430px] overflow-y-auto p-4.5 flex flex-col gap-3"
        style={{ background: 'repeating-linear-gradient(0deg, #fff 0 40px, #fdf8ee 40px 41px)' }}
        role="log"
        aria-live="polite"
        aria-label="HubBot conversation"
      >
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {typing && <span className="self-start text-xs text-[#6a6376] font-semibold">HubBot is thinking…</span>}
      </div>

      <div className="px-3.5 py-2.5 border-t-[2.5px] border-ink flex gap-2 flex-wrap bg-white">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q.query}
            type="button"
            onClick={() => ask(q.query)}
            className="border-[2.5px] border-ink px-3.5 py-1.5 font-bold text-xs bg-cream hover:bg-marigold transition-colors"
          >
            {q.emoji} {q.label}
          </button>
        ))}
      </div>

      <div className="flex border-t-[3px] border-ink">
        <label htmlFor="hubbot-input" className="sr-only">Ask HubBot a question</label>
        <input
          id="hubbot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask anything… e.g. 'funny mug for my sister'"
          className="flex-1 border-none px-4 py-3.5 text-sm bg-cream focus:outline-none focus:bg-white"
        />
        <button
          type="button"
          onClick={handleSend}
          className="border-none border-l-[3px] border-ink bg-rani text-white font-bold px-5.5"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const ChatBubble = ({ message }) => {
  const isBot = message.who === 'bot';
  return (
    <div
      className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed border-[2.5px] border-ink ${
        isBot
          ? 'bg-cream self-start rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
          : 'bg-peacock text-white self-end rounded-tl-2xl rounded-br-2xl rounded-bl-2xl'
      }`}
    >
      {isBot ? (
        // Safe: bot text comes only from the static, app-authored strings in
        // src/data/hubbot-rules.js — never from user input.
        <span dangerouslySetInnerHTML={{ __html: message.text }} />
      ) : (
        <span>{message.text}</span>
      )}
      {message.products && message.products.length > 0 && (
        <div className="flex gap-2 mt-2.5">
          {message.products.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="block w-[86px] border-2 border-ink bg-white text-[10px] font-bold text-ink no-underline"
            >
              <img
                src={getFirebaseImageUrl(p.images?.[0])}
                alt=""
                loading="lazy"
                className="w-full aspect-square object-cover border-b-2 border-ink"
              />
              <span className="block px-1 py-1 leading-tight">
                {p.title.split(' ').slice(0, 3).join(' ')} · ${p.price}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

ChatBubble.propTypes = {
  message: PropTypes.shape({
    who: PropTypes.oneOf(['bot', 'user']).isRequired,
    text: PropTypes.string.isRequired,
    products: PropTypes.array,
  }).isRequired,
};

export default HubBotChat;
