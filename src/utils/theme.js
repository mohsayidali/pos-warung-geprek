export const THEME_PRESETS = {
  crimson: {
    id: 'crimson',
    label: 'Merah Cobek',
    swatch: '#dc2626',
    light: {
      accent: '#dc2626',
      hover: '#b91c1c',
      text: '#dc2626',
      soft: '#fef2f2',
      softBorder: '#fecaca',
      chartMuted: '#fecaca',
      chartMutedHover: '#fca5a5',
    },
    dark: {
      accent: '#dc2626',
      hover: '#ef4444',
      text: '#f87171',
      soft: 'rgba(220, 38, 38, 0.16)',
      softBorder: 'rgba(248, 113, 113, 0.35)',
      chartMuted: 'rgba(248, 113, 113, 0.28)',
      chartMutedHover: 'rgba(248, 113, 113, 0.5)',
    },
  },
  pink: {
    id: 'pink',
    label: 'Pink Berry',
    swatch: '#db2777',
    light: {
      accent: '#db2777',
      hover: '#be185d',
      text: '#db2777',
      soft: '#fdf2f8',
      softBorder: '#fbcfe8',
      chartMuted: '#fbcfe8',
      chartMutedHover: '#f9a8d4',
    },
    dark: {
      accent: '#db2777',
      hover: '#ec4899',
      text: '#f472b6',
      soft: 'rgba(219, 39, 119, 0.18)',
      softBorder: 'rgba(244, 114, 182, 0.35)',
      chartMuted: 'rgba(244, 114, 182, 0.28)',
      chartMutedHover: 'rgba(244, 114, 182, 0.5)',
    },
  },
  orange: {
    id: 'orange',
    label: 'Oranye Sambal',
    swatch: '#ea580c',
    light: {
      accent: '#ea580c',
      hover: '#c2410c',
      text: '#ea580c',
      soft: '#fff7ed',
      softBorder: '#fed7aa',
      chartMuted: '#fed7aa',
      chartMutedHover: '#fdba74',
    },
    dark: {
      accent: '#ea580c',
      hover: '#f97316',
      text: '#fb923c',
      soft: 'rgba(234, 88, 12, 0.16)',
      softBorder: 'rgba(251, 146, 60, 0.35)',
      chartMuted: 'rgba(251, 146, 60, 0.28)',
      chartMutedHover: 'rgba(251, 146, 60, 0.5)',
    },
  },
  emerald: {
    id: 'emerald',
    label: 'Hijau Lalapan',
    swatch: '#059669',
    light: {
      accent: '#059669',
      hover: '#047857',
      text: '#059669',
      soft: '#ecfdf5',
      softBorder: '#a7f3d0',
      chartMuted: '#a7f3d0',
      chartMutedHover: '#6ee7b7',
    },
    dark: {
      accent: '#059669',
      hover: '#10b981',
      text: '#34d399',
      soft: 'rgba(5, 150, 105, 0.16)',
      softBorder: 'rgba(52, 211, 153, 0.35)',
      chartMuted: 'rgba(52, 211, 153, 0.28)',
      chartMutedHover: 'rgba(52, 211, 153, 0.5)',
    },
  },
  blue: {
    id: 'blue',
    label: 'Biru Samudra',
    swatch: '#2563eb',
    light: {
      accent: '#2563eb',
      hover: '#1d4ed8',
      text: '#2563eb',
      soft: '#eff6ff',
      softBorder: '#bfdbfe',
      chartMuted: '#bfdbfe',
      chartMutedHover: '#93c5fd',
    },
    dark: {
      accent: '#2563eb',
      hover: '#3b82f6',
      text: '#60a5fa',
      soft: 'rgba(37, 99, 235, 0.18)',
      softBorder: 'rgba(96, 165, 250, 0.35)',
      chartMuted: 'rgba(96, 165, 250, 0.28)',
      chartMutedHover: 'rgba(96, 165, 250, 0.5)',
    },
  },
  violet: {
    id: 'violet',
    label: 'Ungu Terong',
    swatch: '#7c3aed',
    light: {
      accent: '#7c3aed',
      hover: '#6d28d9',
      text: '#7c3aed',
      soft: '#f5f3ff',
      softBorder: '#ddd6fe',
      chartMuted: '#ddd6fe',
      chartMutedHover: '#c4b5fd',
    },
    dark: {
      accent: '#7c3aed',
      hover: '#8b5cf6',
      text: '#a78bfa',
      soft: 'rgba(124, 58, 237, 0.18)',
      softBorder: 'rgba(167, 139, 250, 0.35)',
      chartMuted: 'rgba(167, 139, 250, 0.28)',
      chartMutedHover: 'rgba(167, 139, 250, 0.5)',
    },
  },
  slate: {
    id: 'slate',
    label: 'Arang Elegan',
    swatch: '#334155',
    light: {
      accent: '#1e293b',
      hover: '#0f172a',
      text: '#0f172a',
      soft: '#f1f5f9',
      softBorder: '#cbd5e1',
      chartMuted: '#cbd5e1',
      chartMutedHover: '#94a3b8',
    },
    dark: {
      accent: '#475569',
      hover: '#64748b',
      text: '#e2e8f0',
      soft: 'rgba(148, 163, 184, 0.16)',
      softBorder: 'rgba(148, 163, 184, 0.35)',
      chartMuted: 'rgba(148, 163, 184, 0.28)',
      chartMutedHover: 'rgba(148, 163, 184, 0.48)',
    },
  },
};

export const DEFAULT_THEME = {
  mode: 'light', // 'light' | 'dark'
  accent: 'crimson', // key of THEME_PRESETS or 'custom'
  customColor: '#db2777',
  headerStyle: 'dark', // 'dark' | 'accent' | 'surface'
  radius: 'modern', // 'sharp' | 'modern' | 'soft'
  density: 'normal', // 'compact' | 'normal' | 'comfortable'
  showClock: true,
  showMenuImages: true,
};

const STORAGE_KEY = 'pos_theme_prefs_v1';

const normalizeHex = (hex) => {
  if (typeof hex !== 'string') return '#db2777';
  const clean = hex.trim();
  return /^#[0-9a-fA-F]{6}$/.test(clean) ? clean.toLowerCase() : '#db2777';
};

const hexToRgb = (hex) => {
  const n = normalizeHex(hex).slice(1);
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
};

const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('')}`;

const mixHex = (hexA, hexB, weightB) => {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  return rgbToHex(
    a.r * (1 - w) + b.r * w,
    a.g * (1 - w) + b.g * w,
    a.b * (1 - w) + b.b * w
  );
};

const buildCustomTokens = (hex, isDark) => {
  const base = normalizeHex(hex);
  const { r, g, b } = hexToRgb(base);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Ensure buttons with white text remain readable even if user picks a pastel color
  const safeButtonAccent = luminance > 0.68 ? mixHex(base, '#000000', 0.35) : base;

  if (isDark) {
    const brightText = luminance < 0.45 ? mixHex(base, '#ffffff', 0.48) : base;
    return {
      accent: safeButtonAccent,
      hover: mixHex(safeButtonAccent, '#ffffff', 0.14),
      text: brightText,
      soft: `rgba(${r}, ${g}, ${b}, 0.18)`,
      softBorder: `rgba(${r}, ${g}, ${b}, 0.38)`,
      chartMuted: `rgba(${r}, ${g}, ${b}, 0.28)`,
      chartMutedHover: `rgba(${r}, ${g}, ${b}, 0.5)`,
    };
  }

  return {
    accent: safeButtonAccent,
    hover: mixHex(safeButtonAccent, '#000000', 0.16),
    text: luminance > 0.6 ? mixHex(base, '#000000', 0.38) : base,
    soft: mixHex(base, '#ffffff', 0.9),
    softBorder: mixHex(base, '#ffffff', 0.72),
    chartMuted: mixHex(base, '#ffffff', 0.68),
    chartMutedHover: mixHex(base, '#ffffff', 0.48),
  };
};

export function loadThemePrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw);
    const isValidAccent =
      parsed.accent === 'custom' || Boolean(THEME_PRESETS[parsed.accent]);
    return {
      ...DEFAULT_THEME,
      ...parsed,
      mode: parsed.mode === 'dark' ? 'dark' : 'light',
      accent: isValidAccent ? parsed.accent : DEFAULT_THEME.accent,
      customColor: normalizeHex(parsed.customColor || DEFAULT_THEME.customColor),
      headerStyle: ['dark', 'accent', 'surface'].includes(parsed.headerStyle)
        ? parsed.headerStyle
        : DEFAULT_THEME.headerStyle,
      radius: ['sharp', 'modern', 'soft'].includes(parsed.radius)
        ? parsed.radius
        : DEFAULT_THEME.radius,
      density: ['compact', 'normal', 'comfortable'].includes(parsed.density)
        ? parsed.density
        : DEFAULT_THEME.density,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveThemePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota errors
  }
}

export function applyThemeToDocument(theme) {
  const root = document.documentElement;
  const isDark = theme.mode === 'dark';
  const tokens =
    theme.accent === 'custom'
      ? buildCustomTokens(theme.customColor, isDark)
      : (THEME_PRESETS[theme.accent] || THEME_PRESETS.crimson)[
          isDark ? 'dark' : 'light'
        ];

  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  root.style.setProperty('--accent', tokens.accent);
  root.style.setProperty('--accent-hover', tokens.hover);
  root.style.setProperty('--accent-text', tokens.text);
  root.style.setProperty('--accent-soft', tokens.soft);
  root.style.setProperty('--accent-soft-border', tokens.softBorder);
  root.style.setProperty('--chart-muted', tokens.chartMuted);
  root.style.setProperty('--chart-muted-hover', tokens.chartMutedHover);

  const radiusMap = {
    sharp: { card: '8px', ctrl: '6px' },
    modern: { card: '16px', ctrl: '12px' },
    soft: { card: '24px', ctrl: '16px' },
  };
  const r = radiusMap[theme.radius] || radiusMap.modern;
  root.style.setProperty('--radius-card', r.card);
  root.style.setProperty('--radius-ctrl', r.ctrl);

  // Sinkronkan meta theme-color agar bilah sistem Android/Huawei tidak memakai warna lama
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    const barColor =
      theme.headerStyle === 'accent'
        ? tokens.accent
        : theme.headerStyle === 'surface'
        ? isDark
          ? '#18181b'
          : '#ffffff'
        : '#09090b';
    metaTheme.setAttribute('content', barColor);
  }
}
