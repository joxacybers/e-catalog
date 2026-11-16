'use client';

import {
  Droplets,
  Grid2x2,
  Layers,
  Package,
  Sparkles,
  Wind,
} from 'lucide-react';

export function CategoryIcon({
  icon,
  className = 'h-5 w-5',
}: {
  icon?: string;
  className?: string;
}) {
  switch (icon) {
    case 'layers':
      return <Layers className={className} />;
    case 'droplets':
      return <Droplets className={className} />;
    case 'grid':
      return <Grid2x2 className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'wind':
      return <Wind className={className} />;
    default:
      return <Package className={className} />;
  }
}

