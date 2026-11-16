export type IllustrationKind =
  | 'paper-napkin-box'
  | 'paper-napkin-pack'
  | 'wet-wipes'
  | 'wet-wipes-pocket'
  | 'floor-cloth'
  | 'microfiber-cloth'
  | 'air-spray'
  | 'air-diffuser';

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export function getPresetIllustration(
  kind: IllustrationKind,
  primary = '#0284c7',
  secondary = '#e0f2fe',
  badgeText = 'OPTOM'
): string {
  switch (kind) {
    case 'paper-napkin-box':
      return toDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
          <rect width="400" height="320" rx="24" fill="${secondary}"/>
          <circle cx="330" cy="60" r="70" fill="${primary}" opacity="0.12"/>
          <g transform="translate(80, 95)">
            <path d="M90 15 C95 -15, 130 -20, 145 5 C155 -10, 175 0, 165 25 Z" fill="#ffffff" stroke="${primary}" stroke-width="3"/>
            <rect x="20" y="25" width="200" height="115" rx="14" fill="#ffffff" stroke="${primary}" stroke-width="4"/>
            <rect x="20" y="75" width="200" height="65" rx="0 0 14 14" fill="${primary}" opacity="0.9"/>
            <ellipse cx="120" cy="40" rx="46" ry="8" fill="${secondary}" stroke="${primary}" stroke-width="2.5"/>
            <rect x="52" y="92" width="136" height="28" rx="6" fill="#ffffff"/>
            <text x="120" y="111" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${primary}" text-anchor="middle">${badgeText}</text>
          </g>
        </svg>
      `);

    case 'paper-napkin-pack':
      return toDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
          <rect width="400" height="320" rx="24" fill="${secondary}"/>
          <circle cx="75" cy="260" r="65" fill="${primary}" opacity="0.12"/>
          <g transform="translate(95, 55)">
            <rect x="18" y="24" width="174" height="174" rx="14" fill="#ffffff" stroke="${primary}" stroke-width="4"/>
            <rect x="4" y="10" width="174" height="174" rx="14" fill="#ffffff" stroke="${primary}" stroke-width="4"/>
            <path d="M4 115 H178 V170 C178 178 172 184 164 184 H18 C10 184 4 178 4 170 Z" fill="${primary}"/>
            <rect x="36" y="42" width="110" height="52" rx="10" fill="${secondary}"/>
            <text x="91" y="74" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${primary}" text-anchor="middle">${badgeText}</text>
            <line x1="36" y1="145" x2="146" y2="145" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
            <line x1="56" y1="160" x2="126" y2="160" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
          </g>
        </svg>
      `);

    case 'wet-wipes':
      return toDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
          <rect width="400" height="320" rx="24" fill="${secondary}"/>
          <path d="M40 70 Q70 20 100 70 T40 70" fill="${primary}" opacity="0.15"/>
          <g transform="translate(65, 95)">
            <rect x="10" y="25" width="250" height="105" rx="22" fill="#ffffff" stroke="${primary}" stroke-width="4"/>
            <rect x="10" y="78" width="250" height="52" rx="0 0 22 22" fill="${primary}"/>
            <rect x="82" y="10" width="106" height="34" rx="12" fill="${primary}"/>
            <rect x="95" y="16" width="80" height="18" rx="8" fill="#ffffff"/>
            <circle cx="48" cy="54" r="10" fill="${secondary}" stroke="${primary}" stroke-width="2.5"/>
            <text x="135" y="110" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">${badgeText}</text>
          </g>
        </svg>
      `);

    case 'wet-wipes-pocket':
      return toDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
          <rect width="400" height="320" rx="24" fill="${secondary}"/>
          <g transform="translate(105, 65)">
            <rect x="30" y="35" width="150" height="150" rx="18" fill="${primary}" opacity="0.2"/>
            <rect x="10" y="15" width="165" height="155" rx="18" fill="#ffffff" stroke="${primary}" stroke-width="4"/>
            <rect x="52" y="42" width="80" height="28" rx="12" fill="${primary}"/>
            <rect x="30" y="96" width="125" height="44" rx="10" fill="${secondary}"/>
            <text x="92" y="124" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="${primary}" text-anchor="middle">${badgeText}</text>
          </g>
        </svg>
      `);

    case 'floor-cloth':
      return toDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
          <rect width="400" height="320" rx="24" fill="${secondary}"/>
          <g transform="translate(75, 70)">
            <rect x="28" y="35" width="210" height="130" rx="16" fill="${primary}" opacity="0.25"/>
            <rect x="12" y="18" width="210" height="130" rx="16" fill="#ffffff" stroke="${primary}" stroke-width="4"/>
            <path d="M24 40 H210 M24 65 H210 M24 90 H210 M24 115 H210" stroke="${primary}" stroke-width="2" stroke-dasharray="8 8" opacity="0.45"/>
            <rect x="55" y="54" width="124" height="52" rx="10" fill="${primary}"/>
            <text x="117" y="86" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">${badgeText}</text>
          </g>
        </svg>
      `);

    case 'microfiber-cloth':
      return toDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
          <rect width="400" height="320" rx="24" fill="${secondary}"/>
          <g transform="translate(80, 62)">
            <rect x="44" y="42" width="165" height="135" rx="18" fill="#fbbf24" stroke="#d97706" stroke-width="3.5"/>
            <rect x="22" y="24" width="165" height="135" rx="18" fill="#34d399" stroke="#059669" stroke-width="3.5"/>
            <rect x="0" y="6" width="165" height="135" rx="18" fill="${primary}" stroke="#ffffff" stroke-width="3.5"/>
            <rect x="24" y="48" width="117" height="46" rx="10" fill="#ffffff"/>
            <text x="82" y="77" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${primary}" text-anchor="middle">${badgeText}</text>
          </g>
        </svg>
      `);

    case 'air-spray':
      return toDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
          <rect width="400" height="320" rx="24" fill="${secondary}"/>
          <g transform="translate(145, 34)">
            <circle cx="88" cy="24" r="4" fill="${primary}" opacity="0.6"/>
            <circle cx="104" cy="18" r="5" fill="${primary}" opacity="0.45"/>
            <circle cx="118" cy="26" r="3" fill="${primary}" opacity="0.35"/>
            <rect x="34" y="14" width="42" height="34" rx="8" fill="${primary}"/>
            <path d="M22 52 C22 44 88 44 88 52 L96 72 H14 Z" fill="#ffffff" stroke="${primary}" stroke-width="4"/>
            <rect x="14" y="72" width="82" height="168" rx="18" fill="#ffffff" stroke="${primary}" stroke-width="4"/>
            <rect x="14" y="110" width="82" height="92" fill="${primary}"/>
            <text x="55" y="162" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${badgeText}</text>
          </g>
        </svg>
      `);

    case 'air-diffuser':
      return toDataUrl(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
          <rect width="400" height="320" rx="24" fill="${secondary}"/>
          <g transform="translate(132, 48)">
            <rect x="20" y="24" width="96" height="196" rx="26" fill="#ffffff" stroke="${primary}" stroke-width="4"/>
            <rect x="44" y="42" width="48" height="28" rx="10" fill="${secondary}" stroke="${primary}" stroke-width="3"/>
            <circle cx="68" cy="56" r="6" fill="${primary}"/>
            <rect x="34" y="102" width="68" height="72" rx="12" fill="${primary}"/>
            <text x="68" y="144" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">${badgeText}</text>
          </g>
        </svg>
      `);
  }
}

export const ILLUSTRATION_PRESETS: {
  id: IllustrationKind;
  labelUz: string;
  labelRu: string;
  defaultColor: string;
  defaultBg: string;
}[] = [
  { id: 'paper-napkin-box', labelUz: 'Qog‘oz salfetka (qutida)', labelRu: 'Бумажные салфетки (коробка)', defaultColor: '#0284c7', defaultBg: '#e0f2fe' },
  { id: 'paper-napkin-pack', labelUz: 'Qog‘oz salfetka (pochka)', labelRu: 'Бумажные салфетки (пачка)', defaultColor: '#0369a1', defaultBg: '#f0f9ff' },
  { id: 'wet-wipes', labelUz: 'Nam salfetka (katta/klapan)', labelRu: 'Влажные салфетки (с клапаном)', defaultColor: '#0d9488', defaultBg: '#ccfbf1' },
  { id: 'wet-wipes-pocket', labelUz: 'Nam salfetka (cho‘ntak)', labelRu: 'Влажные салфетки (карманные)', defaultColor: '#059669', defaultBg: '#d1fae5' },
  { id: 'floor-cloth', labelUz: 'Pol latta', labelRu: 'Тряпка для пола', defaultColor: '#2563eb', defaultBg: '#dbeafe' },
  { id: 'microfiber-cloth', labelUz: 'Chang latta (Mikrofibra)', labelRu: 'Микрофибра (для пыли)', defaultColor: '#7c3aed', defaultBg: '#ede9fe' },
  { id: 'air-spray', labelUz: 'Osvijitel sprey (300/400 ml)', labelRu: 'Освежитель спрей (300/400 мл)', defaultColor: '#db2777', defaultBg: '#fce7f3' },
  { id: 'air-diffuser', labelUz: 'Avtomatik osvijitel / Dispenser', labelRu: 'Автоматический освежитель', defaultColor: '#ea580c', defaultBg: '#ffedd5' },
];

