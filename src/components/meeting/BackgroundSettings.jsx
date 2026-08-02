import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { HiPhotograph } from 'react-icons/hi';
import Modal from '../ui/Modal';
import Toggle from '../ui/Toggle';

const backgroundOptions = [
  { value: 'none', label: 'None', icon: '✕' },
  { value: 'blur', label: 'Blur', icon: '🌫️' },
  { value: 'office', label: 'Office', icon: '🏢' },
  { value: 'beach', label: 'Beach', icon: '🏖️' },
  { value: 'abstract', label: 'Abstract', icon: '🎨' },
  { value: 'custom', label: 'Custom', icon: '📁' },
];

const BackgroundSettings = memo(function BackgroundSettings({ isOpen, onClose, onApply }) {
  const [blurEnabled, setBlurEnabled] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(50);
  const [selectedBackground, setSelectedBackground] = useState('none');
  const [removeBackground, setRemoveBackground] = useState(false);

  const handleApply = () => {
    onApply?.({ blurEnabled, blurIntensity, selectedBackground, removeBackground });
    onClose();
  };

  const handleOptionClick = (value) => {
    setSelectedBackground(value);
    if (value === 'blur') {
      setBlurEnabled(true);
    } else if (value !== 'none') {
      setBlurEnabled(false);
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleApply}
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
      >
        Apply
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Background Settings" size="md" footer={footer}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Choose Background</p>
          <div className="grid grid-cols-3 gap-3">
            {backgroundOptions.map((option) => {
              const isSelected = selectedBackground === option.value;
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOptionClick(option.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className={`text-xs font-medium ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-slate-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {selectedBackground === 'blur' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
          >
            <Toggle
              enabled={blurEnabled}
              onChange={setBlurEnabled}
              label="Enable Blur"
            />
            {blurEnabled && (
              <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-slate-400">
                  Blur Intensity: {blurIntensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={blurIntensity}
                  onChange={(e) => setBlurIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            )}
          </motion.div>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3">
            <HiPhotograph className="w-5 h-5 text-gray-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Remove Background</span>
          </div>
          <Toggle
            enabled={removeBackground}
            onChange={setRemoveBackground}
          />
        </div>
      </div>
    </Modal>
  );
});

BackgroundSettings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func,
};

BackgroundSettings.displayName = 'BackgroundSettings';

export default BackgroundSettings;
