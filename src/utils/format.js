export const initial = (name = '?') => name.trim().charAt(0).toUpperCase();

export const firstLine = (text = '') => text.split(',')[0];

// Map an avatarColor token to the palette's light background + ink.
export const AVATAR_TINT = {
  amber: { bg: 'var(--amber-light)', fg: 'var(--amber-dark)' },
  teal: { bg: 'var(--teal-light)', fg: 'var(--teal)' },
  navy: { bg: '#E4E9FA', fg: 'var(--navy-light)' },
};
export const avatarTint = (token = 'amber') => AVATAR_TINT[token] ?? AVATAR_TINT.amber;
