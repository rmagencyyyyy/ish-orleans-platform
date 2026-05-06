export const subjectColors = {
  'Langue Arabe': { background: '#dbeafe', border: '#60a5fa', text: '#1e3a8a' },
  'Coran / Tajwid': { background: '#dcfce7', border: '#4ade80', text: '#14532d' },
  'Coran': { background: '#dcfce7', border: '#4ade80', text: '#14532d' },
  'Théologie musulmane': { background: '#fef3c7', border: '#fbbf24', text: '#78350f' },
  'Théologie': { background: '#fef3c7', border: '#fbbf24', text: '#78350f' },
  'Initiation à l’Islam': { background: '#ffedd5', border: '#fb923c', text: '#7c2d12' },
  'Français': { background: '#fce7f3', border: '#f472b6', text: '#831843' },
  'Anglais': { background: '#ede9fe', border: '#a78bfa', text: '#4c1d95' },
  'Soutien scolaire': { background: '#f3ecdf', border: '#d6ad55', text: '#143c31' },
  Autres: { background: '#e5e7eb', border: '#9ca3af', text: '#374151' },
}

export function getSubjectColor(subject) {
  return subjectColors[subject] || subjectColors.Autres
}
