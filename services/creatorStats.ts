export interface CreatorStats {
  earnings: number;
  recommendations: number;
  referrals: number;
  posts: number;
}

const STATS_KEY = 'gigavibe_creator_stats';
const CREATOR_CODE_KEY = 'gigavibe_creator_code';

const DEFAULT_STATS: CreatorStats = {
  earnings: 0,
  recommendations: 0,
  referrals: 0,
  posts: 0
};

const clampNumber = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, value);
};

export const getCreatorStats = (): CreatorStats => {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_STATS };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      earnings: clampNumber(parsed.earnings),
      recommendations: clampNumber(parsed.recommendations),
      referrals: clampNumber(parsed.referrals),
      posts: clampNumber(parsed.posts)
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
};

export const saveCreatorStats = (stats: CreatorStats) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const updateCreatorStats = (
  updater: (stats: CreatorStats) => CreatorStats
): CreatorStats => {
  const current = getCreatorStats();
  const next = updater(current);
  saveCreatorStats(next);
  return next;
};

const generateCreatorCode = () => {
  const segment = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GIGA-${segment}`;
};

export const getCreatorCode = (): string => {
  if (typeof localStorage === 'undefined') return generateCreatorCode();
  const existing = localStorage.getItem(CREATOR_CODE_KEY);
  if (existing) return existing;
  const code = generateCreatorCode();
  localStorage.setItem(CREATOR_CODE_KEY, code);
  return code;
};
