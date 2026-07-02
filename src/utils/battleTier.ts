export type BattleTierId =
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master';

export type BattleTierMeta = {
  id: BattleTierId;
  label: string;
  color: string;
  bg: string;
  icon: string;
};

const TIERS: BattleTierMeta[] = [
  { id: 'iron', label: 'Iron', color: '#64748B', bg: '#F1F5F9', icon: 'shield-alt' },
  { id: 'bronze', label: 'Bronze', color: '#B45309', bg: '#FFEDD5', icon: 'medal' },
  { id: 'silver', label: 'Silver', color: '#475569', bg: '#E2E8F0', icon: 'medal' },
  { id: 'gold', label: 'Gold', color: '#CA8A04', bg: '#FEF9C3', icon: 'crown' },
  { id: 'platinum', label: 'Platinum', color: '#0EA5E9', bg: '#E0F2FE', icon: 'gem' },
  { id: 'diamond', label: 'Diamond', color: '#6366F1', bg: '#EEF2FF', icon: 'gem' },
  { id: 'master', label: 'Master', color: '#7C3AED', bg: '#F3E8FF', icon: 'chess-king' },
];

export function normalizeBattleTier(raw?: string | null): BattleTierId {
  const key = String(raw ?? 'iron')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const found = TIERS.find(t => t.id === key || key.includes(t.id));
  return found?.id ?? 'iron';
}

export function getBattleTierMeta(raw?: string | null): BattleTierMeta {
  return TIERS.find(t => t.id === normalizeBattleTier(raw)) ?? TIERS[0];
}

export function getAllBattleTiers(): BattleTierMeta[] {
  return TIERS;
}
