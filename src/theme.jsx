import { createContext, useContext, useState, useEffect } from 'react';
const light = {
  bg:        '#eef1f6',
  bgCard:    '#ffffff',
  bgHover:   '#f5f7fb',
  bgAlt:     '#f1f4f9',
  text:      '#16203a',
  textSub:   '#41506b',
  textMuted: '#7a879c',
  border:    '#d6deea',
  borderLight:'#e7edf5',
  gold:      '#b06a00',
  goldBg:    '#fff6e6',
  goldBorder:'#f0b429',
  green:     '#127a45',
  greenBg:   '#e6f6ee',
  red:       '#c81e1e',
  redBg:     '#fdecec',
  navy:      '#16203a',
  navyText:  '#ffffff',
  accent:    '#2563c4',
  accentBg:  '#e8f0fd',
  shadow:    '0 4px 14px rgba(22,32,58,0.10)',
  shadowSm:  '0 1px 4px rgba(22,32,58,0.07)',
};
const dark = {
  bg:        '#0c1018',
  bgCard:    '#161c28',
  bgHover:   '#1e2533',
  bgAlt:     '#141a25',
  text:      '#e8edf5',
  textSub:   '#aab4c6',
  textMuted: '#6a7589',
  border:    '#2a3242',
  borderLight:'#1e2533',
  gold:      '#f0b429',
  goldBg:    '#241c05',
  goldBorder:'#b06a00',
  green:     '#3ec27d',
  greenBg:   '#0c2418',
  red:       '#ff6b6b',
  redBg:     '#2a0e0e',
  navy:      '#0c1018',
  navyText:  '#ffffff',
  accent:    '#5b9bff',
  accentBg:  '#0f1d33',
  shadow:    '0 4px 16px rgba(0,0,0,0.45)',
  shadowSm:  '0 1px 4px rgba(0,0,0,0.35)',
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
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
      <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: FONT, fontSize: 16, lineHeight: 1.5, transition: 'background 0.2s, color 0.2s' }}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}
export const btn = (t, variant = 'default') => {
  const variants = {
    default: { background: t.bgAlt, border: `1px solid ${t.border}`, color: t.textSub },
    gold:    { background: t.goldBg, border: `1.5px solid ${t.goldBorder}`, color: t.gold, fontWeight: 700 },
    green:   { background: t.greenBg, border: `1.5px solid ${t.green}`, color: t.green, fontWeight: 700 },
    red:     { background: t.redBg, border: `1px solid ${t.red}`, color: t.red, fontWeight: 600 },
    dark:    { background: t.navy, border: 'none', color: t.navyText, fontWeight: 700 },
  };
  return { padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, transition: 'all 0.15s', ...variants[variant] };
};
export const inp = t => ({
  background: t.bgCard, border: `1px solid ${t.border}`, color: t.text,
  padding: '10px 14px', borderRadius: 8, fontFamily: 'inherit', fontSize: 15,
  flex: 1, minWidth: 120, boxSizing: 'border-box',
});
export const card = t => ({
  background: t.bgCard, border: `1px solid ${t.borderLight}`,
  borderRadius: 14, padding: '18px 20px', boxShadow: t.shadow,
});