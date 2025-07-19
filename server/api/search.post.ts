const config = useRuntimeConfig()

// Cache für PageSpeed Ergebnisse
const pageSpeedCache = new Map()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { query, location, maxResults = 100 } = body

    if (!query) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Suchbegriff ist erforderlich'
      })
    }

    const apiKey = config.googleApiKey
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google API Key nicht konfiguriert'
      })
    }

    // Google Places API Search
    const searchParams = new URLSearchParams({
      query: query,
      key: apiKey,
      language: 'de',
      maxResults: maxResults.toString()
    })

    if (location) {
      searchParams.append('location', location)
    }

    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams}`
    const searchResponse = await $fetch(searchUrl)

    if (searchResponse.status !== 'OK' && searchResponse.status !== 'ZERO_RESULTS') {
      throw createError({
        statusCode: 500,
        statusMessage: `Google API Fehler: ${searchResponse.status}`
      })
    }

    const results = []

    // Für jedes Ergebnis Details abrufen
    for (const place of searchResponse.results || []) {
      try {
        // Place Details API für zusätzliche Informationen
        const detailsParams = new URLSearchParams({
          place_id: place.place_id,
          key: apiKey,
          language: 'de',
          fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,types,business_status,opening_hours,price_level,photos'
        })

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${detailsParams}`
        const detailsResponse = await $fetch(detailsUrl)

        if (detailsResponse.status === 'OK' && detailsResponse.result) {
          const details = detailsResponse.result
          
          // Website-Qualität und PageSpeed bewerten
          const websiteAnalysis = await analyzeWebsite(details.website, apiKey)
          
          // Webdesign Lead-Scoring
          const leadScore = calculateWebdesignLeadScore(details, websiteAnalysis)
          
          // Branchen-Kategorisierung
          const businessCategory = categorizeBusiness(details.types || [], query)
          
          results.push({
            place_id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phone: details.formatted_phone_number || '',
            website: details.website || '',
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            types: place.types?.join(', ') || '',
            latitude: place.geometry?.location?.lat,
            longitude: place.geometry?.location?.lng,
            
            // Erweiterte Datenanreicherung
            website_quality_score: websiteAnalysis.score,
            website_quality: websiteAnalysis.description,
            page_speed_score: websiteAnalysis.pageSpeedScore,
            mobile_friendly: websiteAnalysis.mobileFriendly,
            has_contact_form: websiteAnalysis.hasContactForm,
            technology_stack: websiteAnalysis.technologyStack,
            social_media_presence: websiteAnalysis.socialMediaPresence,
            
            // Webdesign Lead-Scoring
            lead_score: leadScore.total,
            lead_score_breakdown: leadScore.breakdown,
            urgency_level: leadScore.urgency,
    
            business_size: leadScore.businessSize,
            business_category: businessCategory,
            
            // Zusätzliche Business-Info
            business_status: details.business_status,
            price_level: details.price_level,
            opening_hours: details.opening_hours?.weekday_text?.join('; ') || '',
            review_count: place.user_ratings_total,
            last_updated: new Date().toISOString()
          })
        } else {
          // Fallback ohne Details
          results.push({
            place_id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phone: '',
            website: '',
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            types: place.types?.join(', ') || '',
            latitude: place.geometry?.location?.lat,
            longitude: place.geometry?.location?.lng,
            website_quality_score: 0,
            website_quality: 'Keine Website gefunden',
            page_speed_score: 0,
            mobile_friendly: false,
            has_contact_form: false,
            technology_stack: 'Unbekannt',
            social_media_presence: false,
            lead_score: 0,
            lead_score_breakdown: {},
            urgency_level: 'Niedrig',
            estimated_budget: 'Unbekannt',
            business_size: 'Unbekannt',
            business_category: 'Sonstige',
            business_status: 'Unbekannt',
            price_level: null,
            opening_hours: '',
            review_count: place.user_ratings_total,
            last_updated: new Date().toISOString()
          })
        }

        // Kurze Pause zwischen API-Aufrufen
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        console.error('Fehler beim Abrufen der Details für:', place.name, error)
        // Trotzdem das Basis-Ergebnis hinzufügen
        results.push({
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          phone: '',
          website: '',
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          types: place.types?.join(', ') || '',
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng,
          website_quality_score: 0,
          website_quality: 'Fehler beim Abrufen der Details',
          page_speed_score: 0,
          mobile_friendly: false,
          has_contact_form: false,
          technology_stack: 'Unbekannt',
          social_media_presence: false,
          lead_score: 0,
          lead_score_breakdown: {},
          urgency_level: 'Niedrig',
          estimated_budget: 'Unbekannt',
          business_size: 'Unbekannt',
          business_category: 'Sonstige',
          business_status: 'Unbekannt',
          price_level: null,
          opening_hours: '',
          review_count: place.user_ratings_total,
          last_updated: new Date().toISOString()
        })
      }
    }

    return {
      success: true,
      results: results,
      total: results.length
    }

  } catch (error) {
    console.error('Fehler bei der Suche:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Fehler bei der Suche'
    })
  }
})

// Website-Analyse mit PageSpeed Insights
async function analyzeWebsite(website, apiKey) {
  if (!website) {
    return {
      score: 0,
      description: 'Keine Website',
      pageSpeedScore: 0,
      mobileFriendly: false,
      hasContactForm: false,
      technologyStack: 'Unbekannt',
      socialMediaPresence: false
    }
  }

  try {
    // PageSpeed Insights API
    let pageSpeedScore = 0
    let mobileFriendly = false
    
    if (!pageSpeedCache.has(website)) {
      try {
        const pageSpeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(website)}&key=${apiKey}&strategy=mobile`
        const pageSpeedResponse = await $fetch(pageSpeedUrl)
        
        if (pageSpeedResponse.lighthouseResult) {
          const lighthouse = pageSpeedResponse.lighthouseResult
          pageSpeedScore = Math.round(lighthouse.categories.performance.score * 100)
          mobileFriendly = lighthouse.categories.performance.score > 0.5
        }
        
        pageSpeedCache.set(website, { pageSpeedScore, mobileFriendly })
      } catch (error) {
        console.error('PageSpeed API Fehler:', error)
        pageSpeedCache.set(website, { pageSpeedScore: 0, mobileFriendly: false })
      }
    } else {
      const cached = pageSpeedCache.get(website)
      pageSpeedScore = cached.pageSpeedScore
      mobileFriendly = cached.mobileFriendly
    }

    // Website-Qualitätsbewertung
    let score = 0
    let description = 'Keine Bewertung'
    let hasContactForm = false
    let technologyStack = 'Unbekannt'
    let socialMediaPresence = false

    // Basis-Bewertung basierend auf PageSpeed
    if (pageSpeedScore >= 90) {
      score = 5
      description = 'Exzellent - Modern'
    } else if (pageSpeedScore >= 70) {
      score = 4
      description = 'Gut - Optimierungsbedarf'
    } else if (pageSpeedScore >= 50) {
      score = 3
      description = 'Durchschnittlich'
    } else if (pageSpeedScore >= 30) {
      score = 2
      description = 'Verbesserungswürdig'
    } else {
      score = 1
      description = 'Schlecht - Veraltet'
    }

    // Technologie-Stack erkennen (basierend auf URL-Patterns)
    if (website.includes('wordpress') || website.includes('wp-')) {
      technologyStack = 'WordPress'
    } else if (website.includes('shopify')) {
      technologyStack = 'Shopify'
    } else if (website.includes('wix')) {
      technologyStack = 'Wix'
    } else if (website.includes('squarespace')) {
      technologyStack = 'Squarespace'
    } else if (website.includes('webflow')) {
      technologyStack = 'Webflow'
    } else {
      technologyStack = 'Custom/Unbekannt'
    }

    return {
      score,
      description,
      pageSpeedScore,
      mobileFriendly,
      hasContactForm,
      technologyStack,
      socialMediaPresence
    }

  } catch (error) {
    console.error('Website-Analyse Fehler:', error)
    return {
      score: 0,
      description: 'Analyse-Fehler',
      pageSpeedScore: 0,
      mobileFriendly: false,
      hasContactForm: false,
      technologyStack: 'Unbekannt',
      socialMediaPresence: false
    }
  }
}

// Webdesign Lead-Scoring
function calculateWebdesignLeadScore(details, websiteAnalysis) {
  let totalScore = 0
  const breakdown = {
    websiteQuality: 0,
    businessSize: 0,
    rating: 0,
    reviewCount: 0,
    businessStatus: 0,
    technologyStack: 0
  }

  // Website-Qualität (0-35 Punkte) - Erhöht
  breakdown.websiteQuality = websiteAnalysis.score * 7
  totalScore += breakdown.websiteQuality

  // Business-Größe basierend auf Bewertungen (0-25 Punkte) - Erhöht
  const reviewCount = details.user_ratings_total || 0
  if (reviewCount > 200) {
    breakdown.businessSize = 25 // Großunternehmen
  } else if (reviewCount > 100) {
    breakdown.businessSize = 20 // Mittelstand
  } else if (reviewCount > 50) {
    breakdown.businessSize = 15 // Kleinunternehmen
  } else if (reviewCount > 20) {
    breakdown.businessSize = 10 // Kleinstunternehmen
  } else {
    breakdown.businessSize = 5 // Start-up
  }
  totalScore += breakdown.businessSize

  // Bewertung (0-20 Punkte)
  const rating = details.rating || 0
  breakdown.rating = Math.round(rating * 4)
  totalScore += breakdown.rating

  // Review-Anzahl (0-10 Punkte) - Reduziert
  breakdown.reviewCount = Math.min(reviewCount / 20, 10)
  totalScore += breakdown.reviewCount

  // Business-Status (0-5 Punkte) - Reduziert
  if (details.business_status === 'OPERATIONAL') {
    breakdown.businessStatus = 5
  } else if (details.business_status === 'CLOSED_TEMPORARILY') {
    breakdown.businessStatus = 2
  }
  totalScore += breakdown.businessStatus

  // Technologie-Stack (0-5 Punkte)
  if (websiteAnalysis.technologyStack === 'WordPress' || websiteAnalysis.technologyStack === 'Custom/Unbekannt') {
    breakdown.technologyStack = 5
  } else if (websiteAnalysis.technologyStack === 'Shopify') {
    breakdown.technologyStack = 3
  } else {
    breakdown.technologyStack = 1
  }
  totalScore += breakdown.technologyStack

  // Dringlichkeit bestimmen
  let urgency = 'Niedrig'
  if (totalScore >= 85) urgency = 'Hoch'
  else if (totalScore >= 65) urgency = 'Mittel'
  else if (totalScore >= 45) urgency = 'Niedrig'

  // Business-Größe (schnellere Erkennung)
  let businessSize = 'Start-up'
  if (reviewCount > 200) businessSize = 'Großunternehmen'
  else if (reviewCount > 100) businessSize = 'Mittelstand'
  else if (reviewCount > 50) businessSize = 'Kleinunternehmen'
  else if (reviewCount > 20) businessSize = 'Kleinstunternehmen'
  else businessSize = 'Start-up'

  return {
    total: Math.round(totalScore),
    breakdown,
    urgency,
    businessSize
  }
}

// Branchen-Kategorisierung
function categorizeBusiness(types, query) {
  const typeString = types.join(' ').toLowerCase()
  const queryLower = query.toLowerCase()

  // Webdesign-relevante Branchen
  if (typeString.includes('restaurant') || queryLower.includes('restaurant')) return 'Gastronomie'
  if (typeString.includes('dentist') || typeString.includes('zahnarzt') || queryLower.includes('zahnarzt')) return 'Zahnarzt'
  if (typeString.includes('lawyer') || typeString.includes('anwalt') || queryLower.includes('anwalt')) return 'Rechtsanwalt'
  if (typeString.includes('doctor') || typeString.includes('arzt') || queryLower.includes('arzt')) return 'Arzt'
  if (typeString.includes('beauty') || typeString.includes('salon') || queryLower.includes('salon')) return 'Beauty/Salon'
  if (typeString.includes('fitness') || typeString.includes('gym') || queryLower.includes('fitness')) return 'Fitness'
  if (typeString.includes('real_estate') || typeString.includes('immobilien') || queryLower.includes('immobilien')) return 'Immobilien'
  if (typeString.includes('automotive') || typeString.includes('auto') || queryLower.includes('auto')) return 'Automobil'
  if (typeString.includes('retail') || typeString.includes('shop') || queryLower.includes('shop')) return 'Einzelhandel'
  if (typeString.includes('professional') || typeString.includes('business')) return 'Dienstleister'
  
  return 'Sonstige'
} 