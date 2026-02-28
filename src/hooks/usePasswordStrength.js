// frontend/src/hooks/usePasswordStrength.js

export const PASSWORD_RULES = [
  {
    id:    'length',
    label: 'At least 8 characters',
    icon:  '📏',
    test:  (p) => p.length >= 8,
  },
  {
    id:    'uppercase',
    label: 'One uppercase letter (A–Z)',
    icon:  '🔠',
    test:  (p) => /[A-Z]/.test(p),
  },
  {
    id:    'lowercase',
    label: 'One lowercase letter (a–z)',
    icon:  '🔡',
    test:  (p) => /[a-z]/.test(p),
  },
  {
    id:    'number',
    label: 'At least one number (0–9)',
    icon:  '🔢',
    test:  (p) => /[0-9]/.test(p),
  },
  {
    id:    'special',
    label: 'One special character (!@#$%^&*)',
    icon:  '🔣',
    test:  (p) => /[!@#$%^&*()\-_=+\[\]{};':",.<>?/\\|`~]/.test(p),
  },
];

/**
 * @param {string} password
 * @returns {{ results: Array, passed: number, strength: 'none'|'weak'|'medium'|'strong', isValid: boolean }}
 */
export function checkPassword(password) {
  const results = PASSWORD_RULES.map((r) => ({ ...r, passed: password.length > 0 && r.test(password) }));
  const passed  = results.filter((r) => r.passed).length;
  const strength =
    password.length === 0 ? 'none' :
    passed <= 2           ? 'weak' :
    passed <= 4           ? 'medium' :
                            'strong';
  return { results, passed, strength, isValid: passed === 5 };
}

export const STRENGTH_META = {
  none:   { pct: 0,   color: 'bg-dark-200',  label: '',       textColor: '' },
  weak:   { pct: 25,  color: 'bg-danger',     label: 'Weak',   textColor: 'text-danger' },
  medium: { pct: 60,  color: 'bg-warning',    label: 'Medium', textColor: 'text-warning' },
  strong: { pct: 100, color: 'bg-success',    label: 'Strong', textColor: 'text-success' },
};
