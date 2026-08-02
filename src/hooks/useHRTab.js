import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function useHRTab(defaultTab = 'all') {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState(() => searchParams.get('tab') || defaultTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActive(tab);
  }, [searchParams]);

  const switchTab = (key) => {
    setActive(key);
    const params = new URLSearchParams(searchParams);
    params.set('tab', key);
    setSearchParams(params, { replace: true });
  };

  return [active, switchTab];
}
