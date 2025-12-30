// Search cache utility with localStorage and cookie support
const CACHE_KEY = 'closenet_search_cache';
const RECENT_SEARCHES_KEY = 'closenet_recent_searches';
const CACHE_EXPIRY_HOURS = 24;

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface RecentSearch {
  query: string;
  timestamp: number;
  type: 'all' | 'posts' | 'people' | 'rooms';
}

// Get cached search results
export function getCachedSearch(key: string): any | null {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return null;

    const parsed = JSON.parse(cache);
    const entry: CacheEntry = parsed[key];

    if (!entry) return null;

    const now = Date.now();
    const isExpired = (now - entry.timestamp) > (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);

    if (isExpired) {
      delete parsed[key];
      localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

// Set cached search results
export function setCachedSearch(key: string, data: any): void {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    const parsed = cache ? JSON.parse(cache) : {};

    parsed[key] = {
      data,
      timestamp: Date.now()
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

// Clear all cache
export function clearSearchCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Add to recent searches
export function addRecentSearch(query: string, type: 'all' | 'posts' | 'people' | 'rooms' = 'all'): void {
  try {
    const recentSearches = getRecentSearches();
    
    // Remove if already exists to avoid duplicates
    const filtered = recentSearches.filter(s => s.query.toLowerCase() !== query.toLowerCase());
    
    // Add new search at the beginning
    const updated: RecentSearch[] = [
      {
        query,
        timestamp: Date.now(),
        type
      },
      ...filtered
    ];

    // Keep only last 10 searches
    const limited = updated.slice(0, 10);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Error adding recent search:', error);
  }
}

// Get recent searches
export function getRecentSearches(): RecentSearch[] {
  try {
    const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
    return searches ? JSON.parse(searches) : [];
  } catch (error) {
    console.error('Error reading recent searches:', error);
    return [];
  }
}

// Clear recent searches
export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
}

// Remove single recent search
export function removeRecentSearch(query: string): void {
  try {
    const recentSearches = getRecentSearches();
    const filtered = recentSearches.filter(s => s.query.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing recent search:', error);
  }
}
