import en from './en';
import hi from './hi';

// Add a new language: create its dictionary file below (copy en.js's shape),
// import it, and add one entry here. Nothing else in the app needs to
// change — the language toggle and the t() fallback chain both read from
// this list, and any key you haven't translated yet falls back to English.
export const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'hi', native: 'हिन्दी' },
];

export const DEFAULT_LANGUAGE = 'en';

const DICTIONARIES = { en, hi };

export function getDictionary(code) {
  return DICTIONARIES[code] ?? DICTIONARIES[DEFAULT_LANGUAGE];
}
