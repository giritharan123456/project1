import { memo } from 'react';
import { useNavigation } from 'react-router-dom';

const RouteLoadingBar = memo(function RouteLoadingBar() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5">
      <div
        className={`h-full bg-gradient-to-r from-primary-500 via-violet-500 to-indigo-500 transition-all duration-300 ease-out ${
          isLoading ? 'w-full opacity-100 animate-pulse' : 'w-0 opacity-0'
        }`}
        role="progressbar"
        aria-label="Page loading"
        aria-valuenow={isLoading ? undefined : 100}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
});

RouteLoadingBar.displayName = 'RouteLoadingBar';

export default RouteLoadingBar;
