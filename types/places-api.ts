/**
 * TypeScript definitions for Google Places API with Pagination
 */

export interface PlacesApiRequest {
  /** Search keyword (required) */
  keyword: string
  
  /** Location to search in (required) */
  location: string
  
  /** Maximum number of results to return (default: 25, max: 60) */
  maxResults?: number
  
  /** Enable pagination for larger result sets (default: false) */
  enablePagination?: boolean
}

export interface Place {
  /** Google Places ID */
  id: string
  
  /** Business name */
  name: string
  
  /** Formatted address */
  address: string
  
  /** Website URL */
  website: string
  
  /** Phone number */
  phone: string
  
  /** Logo/icon URL */
  logo: string
  
  /** Average rating (1-5) */
  rating: number | null
  
  /** Number of reviews */
  reviewCount: number | null
  
  /** Business category */
  category: string
  
  /** Website performance score (1-100) */
  websiteScore: number
  
  /** Mobile performance score (1-100) */
  mobileScore: number
  
  /** Whether website uses HTTPS */
  https: boolean
  
  /** Performance score information */
  scoreInfo: string
  
  /** Estimated search volume */
  searchVolume: number
}

export interface PlacesApiResponse {
  /** Request success status */
  success: boolean
  
  /** Response data */
  data: {
    /** Array of places found */
    places: Place[]
    
    /** Total number of results returned */
    totalResults: number
    
    /** Whether pagination was used for this request */
    paginationUsed: boolean
  }
}

export interface GooglePlacesApiResponse {
  /** Array of place results from Google */
  results: any[]
  
  /** Token for next page of results */
  next_page_token?: string
  
  /** Request status */
  status: string
}

export interface PaginationOptions {
  /** Maximum number of pages to fetch (Google limit: 3) */
  maxPages: number
  
  /** Delay between paginated requests in milliseconds */
  delayMs: number
  
  /** Maximum total results across all pages */
  maxTotalResults: number
}

/**
 * Default pagination configuration
 */
export const DEFAULT_PAGINATION_CONFIG: PaginationOptions = {
  maxPages: 3,
  delayMs: 3000, // 3 seconds as required by Google
  maxTotalResults: 60
}

/**
 * Google Places API limits and constraints
 */
export const GOOGLE_PLACES_LIMITS = {
  /** Maximum results per page */
  RESULTS_PER_PAGE: 20,
  
  /** Maximum total pages */
  MAX_PAGES: 3,
  
  /** Maximum total results */
  MAX_TOTAL_RESULTS: 60,
  
  /** Required delay between paginated requests (ms) */
  PAGINATION_DELAY: 3000,
  
  /** Next page token expiry time (approximate) */
  TOKEN_EXPIRY_MINUTES: 10
} as const

/**
 * Error types for Places API
 */
export interface PlacesApiError {
  statusCode: number
  statusMessage: string
  details?: string
}

/**
 * Pagination state tracking
 */
export interface PaginationState {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  nextPageToken?: string
  totalResultsSoFar: number
}