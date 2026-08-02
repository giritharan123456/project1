import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { HiX, HiDownload, HiTrash, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function ImagePreview({ images, currentIndex = 0, isOpen, onClose, onDelete, downloadable = true }) {
  const handlePrev = useCallback(() => { if (currentIndex > 0) onClose?.(); }, [currentIndex, onClose]);
  const handleNext = useCallback(() => { if (currentIndex < images.length - 1) onClose?.(); }, [currentIndex, images.length, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  }, [onClose, handlePrev, handleNext]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!images?.length) return null;
  const current = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 z-10">
            <span className="text-white/70 text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
            <div className="flex items-center gap-2">
              {downloadable && (
                <a
                  href={typeof current === 'string' ? current : current.src}
                  download
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                  aria-label="Download image"
                >
                  <HiDownload className="w-5 h-5" />
                </a>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(currentIndex); }}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-red-500/70 transition-all"
                  aria-label="Delete image"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                aria-label="Close preview"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {images.length > 1 && currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all z-10"
              aria-label="Previous image"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>
          )}

          <motion.div
            key={currentIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {typeof current === 'string' ? (
              <img src={current} alt={`Preview ${currentIndex + 1}`} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            ) : (
              <img src={current.src} alt={current.alt || `Preview ${currentIndex + 1}`} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            )}
          </motion.div>

          {images.length > 1 && currentIndex < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all z-10"
              aria-label="Next image"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

ImagePreview.propTypes = {
  images: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ src: PropTypes.string, alt: PropTypes.string }),
  ])).isRequired,
  currentIndex: PropTypes.number,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  downloadable: PropTypes.bool,
};

ImagePreview.displayName = 'ImagePreview';
