'use client';

import { useEffect } from 'react';

export function MaterialWebLoader() {
  useEffect(() => {
    void Promise.all([
      import('@material/web/button/filled-button.js'),
      import('@material/web/button/filled-tonal-button.js'),
      import('@material/web/button/outlined-button.js'),
      import('@material/web/button/text-button.js'),
      import('@material/web/chips/chip-set.js'),
      import('@material/web/chips/filter-chip.js'),
      import('@material/web/chips/assist-chip.js'),
      import('@material/web/divider/divider.js'),
      import('@material/web/ripple/ripple.js'),
      import('@material/web/elevation/elevation.js'),
    ]);
  }, []);

  return null;
}

export function M3Icon({
  name,
  className = '',
  slot,
}: {
  name: string;
  className?: string;
  slot?: string;
}) {
  return (
    <span
      slot={slot}
      aria-hidden="true"
      className={`material-symbols-rounded select-none leading-none ${className}`}
    >
      {name}
    </span>
  );
}

