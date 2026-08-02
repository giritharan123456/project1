import { useState, useEffect, useRef, memo } from 'react';
import { HiEmojiHappy } from 'react-icons/hi';
import PropTypes from 'prop-types';

const DEFAULT_REACTIONS = [
  { emoji: '👍', label: 'Thumbs Up' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '👏', label: 'Clap' },
];

const ReactionButton = memo(function ReactionButton({
  reactions = DEFAULT_REACTIONS,
  onReact,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleReact = (emoji) => {
    onReact?.(emoji);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative group flex-shrink-0">
      <button
        className="p-2 sm:p-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
        title="Reactions"
        aria-label="Send reaction"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <HiEmojiHappy className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 p-2 bg-gray-800 rounded-xl shadow-lg border border-gray-700 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {reactions.map((r) => (
            <button
              key={r.emoji}
              onClick={() => handleReact(r.emoji)}
              className="p-1.5 rounded-lg hover:bg-gray-700 hover:scale-125 transition-all text-lg sm:text-xl"
              title={r.label}
              aria-label={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

ReactionButton.propTypes = {
  reactions: PropTypes.arrayOf(PropTypes.shape({ emoji: PropTypes.string, label: PropTypes.string })),
  onReact: PropTypes.func,
};

ReactionButton.displayName = 'ReactionButton';

export default ReactionButton;