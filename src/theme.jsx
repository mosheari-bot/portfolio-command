import { createContext, useContext, useState, useEffect } from 'react';

const light = {
  bg:        '#f4f0e8',
  bgCard:    '#ffffff',
  bgHover:   '#faf8f5',
  bgAlt:     '#f8f5f0',
  text:      '#1a1a1a',
  textSub:   '#444444',
  textMuted: '#777777',
  border:    '#cccccc',
  borderLight:'#e0e0e0',
  gold:      '#9a5500',
  goldBg:    '#fff8ee',
  goldBorder:'#f5c842',
  green:     '#1a6b3a',
  greenBg:   '#eaf5ee',
  red:       '#b50000',
  redBg:     '#fff0f0',
  navy:      '#1a1a2e',
  navyText:  '#ffffff',
  shadow:    '0 2px 8px rgba(0,0,0,0.08)',
  shadowSm:  '0 1px 3px rgba(0,0,0,0.05)',
};

const dark = {
  bg:        '#0d0d0d',
  bgCard:    '#1a1a1a',
  bgHover:   '#222222',
  bgAlt:     '#141414',
  text:      '#e8e0d0',
  textSub:   '#aaaaaa',
  textMuted: '#666666',
  border:    '#2a2a2a',
  borderLight:'#222222',
  gold:      '#f5c842',
  goldBg:    '#1e1a00',
  goldBorder:'#9a5500',
  green:     '#4caf7d',
  greenBg:   '#0a1f12',
  red:       '#ff5555',
  redBg:     '#2a0000',
  navy:      '#1a1a2e',
  navyText:  '#ffffff',
  shadow:    '0 2px 8px rgba(0,0,0,0.4)',
  shadowSm:  '0 1px 3px rgba(0,0,0,0.3)',
};

const ThemeCtx = createContext({ t: light, isDark: false });
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = e => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const t = isDark ? dark : light;
  return (
    <ThemeCtx.Provider value={{ t, isDark }}>
      <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Georgia', serif", transition: 'background 0.2s, color 0.2s' }}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

// Shared style builders
export const btn = (t, variant = 'default') => {
  const variants = {
    default: { background: t.bgAlt, border: `1px solid ${t.border}`, color: t.textSub },
    gold:    { background: t.goldBg, border: `2px solid ${t.gold}`, color: t.gold, fontWeight: 700 },
    green:   { background: t.greenBg, border: `2px solid ${t.green}`, color: t.green, fontWeight: 700 },
    red:     { background: t.redBg, border: `1px solid ${t.red}`, color: t.red },
    dark:    { background: t.navy, border: 'none', color: t.navyText, fontWeight: 700 },
  };
  return { padding: '7px 16px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, ...variants[variant] };
};

export const inp = t => ({
  background: t.bgCard, border: `1px solid ${t.border}`, color: t.text,
  padding: '8px 12px', borderRadius: 4, fontFamily: 'inherit', fontSize: 14,
  flex: 1, minWidth: 120, boxSizing: 'border-box',
});

export const card = t => ({
  background: t.bgCard, border: `1px solid ${t.border}`,
  borderRadius: 8, padding: '16px 18px', boxShadow: t.shadow,
});
