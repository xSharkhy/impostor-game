// Static categories - these match the database schema and rarely change
// Using translation keys instead of fetching from DB saves API calls

export const CATEGORIES = [
  { id: 'animals', translationKey: 'categories.animals' },
  { id: 'food', translationKey: 'categories.food' },
  { id: 'places', translationKey: 'categories.places' },
  { id: 'objects', translationKey: 'categories.objects' },
  { id: 'professions', translationKey: 'categories.professions' },
  { id: 'sports', translationKey: 'categories.sports' },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']
