export type TagCategory = 'use_case' | 'persona' | 'competitor' | 'campaign' | 'sentiment';

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: string | null;
  created_at: string;
}

export const CATEGORY_LABELS: Record<TagCategory, string> = {
  use_case: 'Use Case',
  persona: 'Persona',
  competitor: 'Competitor',
  campaign: 'Campaign',
  sentiment: 'Sentiment',
};

export const CATEGORY_COLORS: Record<TagCategory, string> = {
  use_case: 'bg-blue-500/10 text-blue-700 border-blue-200',
  persona: 'bg-purple-500/10 text-purple-700 border-purple-200',
  competitor: 'bg-red-500/10 text-red-700 border-red-200',
  campaign: 'bg-green-500/10 text-green-700 border-green-200',
  sentiment: 'bg-amber-500/10 text-amber-700 border-amber-200',
};

export const CATEGORY_DOT_COLORS: Record<TagCategory, string> = {
  use_case: 'bg-blue-500',
  persona: 'bg-purple-500',
  competitor: 'bg-red-500',
  campaign: 'bg-green-500',
  sentiment: 'bg-amber-500',
};
