export const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
export const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Spanish', 'French', 'German'];

export const DEFAULT_BRAND_COLOR = '#6C1D5F';
export const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

export const slugify = (value = '') => value
  .toString()
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const inferIconKey = (value = '') => {
  const text = value.toLowerCase();

  if (text.includes('cloud') || text.includes('aws') || text.includes('gcp') || text.includes('azure')) return 'cloud_queue';
  if (text.includes('kubernetes') || text.includes('container') || text.includes('gke')) return 'hub';
  if (text.includes('network') || text.includes('vpc')) return 'lan';
  if (text.includes('database') || text.includes('storage') || text.includes('sql')) return 'storage';
  if (text.includes('react') || text.includes('javascript') || text.includes('node') || text.includes('frontend')) return 'code';
  if (text.includes('architecture') || text.includes('architect')) return 'architecture';
  if (text.includes('data') || text.includes('analytics') || text.includes('bigquery')) return 'insights';
  if (text.includes('ai') || text.includes('machine learning') || text.includes('genai')) return 'psychology';
  if (text.includes('agile') || text.includes('scrum') || text.includes('kanban')) return 'fact_check';
  if (text.includes('security') || text.includes('devops')) return 'security';
  if (text.includes('api') || text.includes('backend')) return 'terminal';
  return 'school';
};

export const getLmsIconKey = (item = {}) => {
  const icon = item.icon || '';
  return icon && icon !== 'menu_book' ? icon : inferIconKey(item.name || item.slug || '');
};

export const buildLmsMetadata = (data = {}, fallbackName = 'learning-item') => ({
  slug: data.slug || slugify(data.name || fallbackName),
  level: data.level || 'Beginner',
  language: data.language || 'English',
  estimatedDuration: data.estimatedDuration || '1 hour',
  brandColor: data.brandColor || DEFAULT_BRAND_COLOR,
  bannerImage: data.bannerImage || data.thumbnail || DEFAULT_BANNER_IMAGE,
  icon: data.icon || inferIconKey(data.name || fallbackName),
});

export const withLmsMetadata = (item = {}, fallbackName = 'learning-item') => ({
  ...buildLmsMetadata(item, fallbackName),
  ...item,
  slug: item.slug || slugify(item.name || fallbackName),
  level: item.level || 'Beginner',
  language: item.language || 'English',
  estimatedDuration: item.estimatedDuration || '1 hour',
  brandColor: item.brandColor || DEFAULT_BRAND_COLOR,
  bannerImage: item.bannerImage || item.thumbnail || DEFAULT_BANNER_IMAGE,
  icon: item.icon || inferIconKey(item.name || fallbackName),
});
