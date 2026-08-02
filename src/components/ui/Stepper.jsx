import { memo } from 'react';
import { HiCheck } from 'react-icons/hi';
import PropTypes from 'prop-types';

const Stepper = memo(function Stepper({ steps = [], currentStep = 0, orientation = 'horizontal' }) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-0`}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={i} className={`flex ${isHorizontal ? 'flex-1 flex-col' : 'flex-row'} items-center`}>
            <div className={`flex items-center ${isHorizontal ? 'w-full' : ''}`}>
              <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold shrink-0 transition-all duration-300 ${
                isCompleted
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-200 dark:shadow-primary-900/30'
                  : isCurrent
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500 dark:ring-primary-400'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
              }`}>
                {isCompleted ? <HiCheck className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <div className={`ml-3 ${isHorizontal ? '' : ''}`}>
                <div className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{step.description}</div>
                )}
              </div>
            </div>
            {!isLast && (
              <div className={`${isHorizontal ? 'flex-1 mx-4 mt-0' : 'ml-4 pl-9 pb-2'}`}>
                <div className={`h-0.5 ${isHorizontal ? 'w-full' : 'w-0.5 h-8'} ${i < currentStep ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'} rounded-full`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

Stepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
  })),
  currentStep: PropTypes.number,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
};

Stepper.displayName = 'Stepper';

export default Stepper;
