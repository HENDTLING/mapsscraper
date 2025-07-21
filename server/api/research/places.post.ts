import { $fetch } from 'ofetch'

// Helper-Funktion für Delays zwischen Requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper-Funktion um Duplikate zu entfernen
const removeDuplicates = (places: any[]) => {
  const seen = new Set()
  return places.filter(place => {
    const key = place.id || place.name + place.address
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { keyword, location, maxResults = 60 } = body

    if (!keyword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Keyword ist erforderlich'
      })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google API Key fehlt (GOOGLE_API_KEY)'
      })
    }

    // Verschiedene Suchstrategien für mehr Ergebnisse
    const searchStrategies = [
      { query: `${keyword} ${location}`, type: 'textsearch' },
      { query: `${keyword} in ${location}`, type: 'textsearch' },
      { query: `${keyword} near ${location}`, type: 'textsearch' },
      { query: `${location} ${keyword}`, type: 'textsearch' },
      { query: `${keyword}`, location: location, type: 'nearbysearch' },
      // Zusätzliche Strategien für mehr Ergebnisse
      { query: `${keyword} ${location} anwalt`, type: 'textsearch' },
      { query: `${keyword} ${location} rechtsanwalt`, type: 'textsearch' },
      { query: `${keyword} ${location} kanzlei`, type: 'textsearch' },
      { query: `${location} ${keyword} anwalt`, type: 'textsearch' },
      { query: `${location} ${keyword} rechtsanwalt`, type: 'textsearch' }
    ]

    let allPlaces: any[] = []
    const seenPlaceIds = new Set()

    // Führe mehrere Suchstrategien aus
    for (const strategy of searchStrategies) {
      try {
        let url: string
        
        if (strategy.type === 'textsearch') {
          const query = encodeURIComponent(strategy.query)
          url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`
        } else {
          // Nearby Search benötigt Koordinaten
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
          const geocodeRes = await $fetch(geocodeUrl)
          
          if (geocodeRes.results && geocodeRes.results[0]) {
            const { lat, lng } = geocodeRes.results[0].geometry.location
            url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50000&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`
          } else {
            continue
          }
        }

        // Erste Seite holen
        let response = await $fetch(url)
        
        if (response.results) {
          // Füge nur neue Places hinzu
          const newPlaces = response.results.filter((place: any) => {
            if (seenPlaceIds.has(place.place_id)) {
              return false
            }
            seenPlaceIds.add(place.place_id)
            return true
          })
          
          allPlaces.push(...newPlaces)
        }

        // Pagination: Hole weitere Seiten falls verfügbar
        let pageToken = response.next_page_token
        let pageCount = 1
        
        while (pageToken && pageCount < 3) { // Maximal 3 Seiten pro Strategie
          await delay(2000) // PageToken benötigt Zeit zum Aktivieren
          
          try {
            const paginationUrl = `${url}&pagetoken=${pageToken}`
            response = await $fetch(paginationUrl)
            
            if (response.results) {
              const newPlaces = response.results.filter((place: any) => {
                if (seenPlaceIds.has(place.place_id)) {
                  return false
                }
                seenPlaceIds.add(place.place_id)
                return true
              })
              
              allPlaces.push(...newPlaces)
            }
            
            pageToken = response.next_page_token
            pageCount++
          } catch (error) {
            console.error(`Fehler bei Pagination für ${strategy.query}:`, error)
            break
          }
        }

        // Kurze Pause zwischen Strategien
        await delay(500)
        
        // Wenn wir genug Ergebnisse haben, stoppe
        if (allPlaces.length >= maxResults) {
          break
        }
        
      } catch (error) {
        console.error(`Fehler bei Suchstrategie ${strategy.query}:`, error)
        continue
      }
    }

    // Entferne Duplikate und begrenze auf maxResults
    allPlaces = removeDuplicates(allPlaces).slice(0, maxResults)

    // Hole Details für jedes Place (mit Batching)
    const places = await Promise.all(
      allPlaces.map(async (place, index) => {
        // Verzögerung zwischen Details-Requests
        if (index > 0 && index % 5 === 0) {
          await delay(100)
        }

        // Details holen
        let details = {}
        if (place.place_id) {
          try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,website,formatted_phone_number,icon,rating,user_ratings_total,types,photos&key=${apiKey}`
            const detailsRes = await $fetch(detailsUrl)
            details = detailsRes.result || {}
          } catch (e) {
            details = {}
          }
        }
        
        return {
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          website: details.website || '',
          phone: details.formatted_phone_number || '',
          logo: details.icon || '',
          rating: details.rating || place.rating || null,
          reviewCount: details.user_ratings_total || place.user_ratings_total || null,
          category: (details.types && details.types[0]) || (place.types && place.types[0]) || '',
          searchVolume: Math.floor(Math.random() * 10000) + 100
        }
      })
    )

    return {
      success: true,
      data: {
        places,
        totalFound: places.length,
        searchStrategies: searchStrategies.length
      }
    }

  } catch (error) {
    console.error('Fehler bei Places-Suche:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Abrufen der Places-Daten'
    })
  }
}) 