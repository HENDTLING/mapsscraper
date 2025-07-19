<template>
  <div>
    <!-- Feedback-Meldung -->
    <div v-if="feedbackMessage" :class="['feedback-message', feedbackType]">{{ feedbackMessage }}</div>
    
    <!-- Ladeindikator -->
    <div v-if="isLoading" class="loading-overlay">
      <span class="material-icons loading-spinner">hourglass_empty</span>
      Lädt ...
    </div>
    
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1 class="logo">LeadPro</h1>
          <p class="tagline">Lead Management</p>
        </div>
        
        <nav class="sidebar-nav">
          <NuxtLink to="/" class="nav-item" active-class="active">
            <span class="nav-icon material-icons">dashboard</span>
            <span class="nav-text">Dashboard</span>
          </NuxtLink>
          
          <NuxtLink to="/pipeline" class="nav-item" active-class="active">
            <span class="nav-icon material-icons">autorenew</span>
            <span class="nav-text">Pipeline</span>
          </NuxtLink>
          
          <NuxtLink to="/leads" class="nav-item" active-class="active">
            <span class="nav-icon material-icons">group</span>
            <span class="nav-text">Kontakte</span>
          </NuxtLink>
          
          <NuxtLink to="/research" class="nav-item" active-class="active">
            <span class="nav-icon material-icons">search</span>
            <span class="nav-text">Recherche</span>
          </NuxtLink>
          
          <NuxtLink to="/analytics" class="nav-item" active-class="active">
            <span class="nav-icon material-icons">bar_chart</span>
            <span class="nav-text">Analytics</span>
          </NuxtLink>
          
          <NuxtLink to="/keywords" class="nav-item" active-class="active">
            <span class="nav-icon material-icons">track_changes</span>
            <span class="nav-text">Keywords</span>
          </NuxtLink>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header -->
        <header class="top-header">
          <div class="header-left">
            <h2>Lead Recherche</h2>
            <p class="breadcrumb">Entdecke "Hidden Champions" mit Google APIs</p>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Search Section -->
          <section class="search-section">
            <div class="search-container">
              <div class="search-input-group">
                <div class="main-search">
                  <input 
                    v-model="searchKeyword" 
                    placeholder="Keyword eingeben (z.B. 'Zahnarzt', 'Webdesign', 'SEO Agentur')"
                    class="input keyword-input"
                    @keyup.enter="startResearch"
                  />
                  <button @click="startResearch" :disabled="isLoading" class="btn-primary search-btn">
                    <span v-if="isLoading" class="material-icons loading-spinner">hourglass_empty</span>
                    <span v-else class="material-icons">search</span>
                    {{ isLoading ? 'Suche...' : 'Recherche starten' }}
                  </button>
                </div>
                
                <div class="filters">
                  <div class="filter-group">
                    <label>Standort</label>
                    <input 
                      v-model="location" 
                      placeholder="z.B. Berlin, Deutschland"
                      class="input filter-input"
                    />
                  </div>
                  
                  <div class="filter-group">
                    <label>Webseiten-Qualität</label>
                    <select v-model="websiteQuality" class="select filter-select">
                      <option value="all">Alle</option>
                      <option value="high">Hoch (>80)</option>
                      <option value="medium">Mittel (50-80)</option>
                      <option value="low">Niedrig (<50)</option>
                    </select>
                  </div>
                  
                  <div class="filter-group">
                    <label>Bewertung</label>
                    <select v-model="minRating" class="select filter-select">
                      <option value="0">Alle</option>
                      <option value="4">4+ Sterne</option>
                      <option value="4.5">4.5+ Sterne</option>
                    </select>
                  </div>
                  
                  <div class="filter-group">
                    <label>Max. Ergebnisse</label>
                    <select v-model="maxResults" class="select filter-select">
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Keyword Suggestions -->
          <section v-if="keywordSuggestions.length > 0" class="suggestions-section">
            <div class="section-header">
              <h3>Keyword-Vorschläge von Google Ads</h3>
              <p class="text-gray-600">Entdecke verwandte Keywords für bessere Lead-Generierung</p>
            </div>
            
            <div class="suggestions-grid">
              <div 
                v-for="suggestion in keywordSuggestions" 
                :key="suggestion.keyword"
                class="suggestion-card"
                @click="useKeywordSuggestion(suggestion.keyword)"
              >
                <div class="suggestion-header">
                  <span class="suggestion-keyword">{{ suggestion.keyword }}</span>
                  <span class="suggestion-volume">{{ formatNumber(suggestion.searchVolume) }}</span>
                </div>
                <div class="suggestion-details">
                  <span class="competition-badge" :class="getCompetitionClass(suggestion.competition)">
                    {{ (suggestion.competition * 100).toFixed(0) }}% Wettbewerb
                  </span>
                  <span class="bid-info">€{{ suggestion.suggestedBid }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Research Results -->
          <section v-if="researchResults.length > 0" class="results-section">
            <div class="results-header">
              <h3>Gefundene Leads ({{ researchResults.length }})</h3>
              <div class="results-controls">
                <button @click="exportLeads" class="btn-secondary">
                  <span class="material-icons">download</span>
                  CSV Export
                </button>
                <button @click="saveAllLeads" class="btn-primary">
                  <span class="material-icons">save</span>
                  Alle speichern
                </button>
              </div>
            </div>

            <!-- Results Filter -->
            <div v-if="researchResults.length > 0" class="results-filter">
              <label>Webseiten-Score filtern:</label>
              <select v-model="scoreFilter" class="select filter-select">
                <option value="all">Alle</option>
                <option value="high">≥ 80</option>
                <option value="medium">50 - 80</option>
                <option value="low">< 50</option>
              </select>
            </div>

            <!-- Results Grid -->
            <div class="results-grid">
              <div 
                v-for="lead in filteredResults" 
                :key="lead.id"
                class="lead-card"
              >
                <div class="lead-header">
                  <div class="lead-avatar">
                    <img 
                      v-if="lead.logo" 
                      :src="lead.logo" 
                      :alt="lead.name"
                      class="company-logo"
                    />
                    <div v-else class="avatar-fallback">
                      {{ getInitials(lead.name) }}
                    </div>
                  </div>
                  <div class="lead-info">
                    <h4 class="lead-name">{{ lead.name }}</h4>
                    <p class="lead-category">{{ lead.category }}</p>
                    <div class="lead-rating" v-if="lead.rating">
                      <span class="stars">{{ '★'.repeat(Math.floor(lead.rating)) }}{{ '☆'.repeat(5 - Math.floor(lead.rating)) }}</span>
                      <span class="rating-text">{{ lead.rating }} ({{ lead.review_count || 0 }} Bewertungen)</span>
                    </div>
                  </div>
                  <div class="lead-actions">
                    <button
                      v-if="!isLeadSaved(lead)"
                      @click="saveLead(lead)"
                      class="btn-primary action-btn"
                      :disabled="savingLeadIds.includes(lead.place_id)"
                    >
                      <span v-if="savingLeadIds.includes(lead.place_id)" class="material-icons loading-spinner">hourglass_empty</span>
                      <span v-else class="material-icons">save</span>
                    </button>
                    <span v-else class="saved-check">
                      <span class="material-icons">check</span>
                    </span>
                    <button @click="showLeadDetails(lead)" class="btn-secondary action-btn">
                      <span class="material-icons">assignment</span>
                    </button>
                  </div>
                </div>
                
                <div class="lead-details">
                  <div class="detail-item" v-if="lead.address">
                    <span class="material-icons detail-icon">location_on</span>
                    <span class="detail-text">{{ lead.address }}</span>
                  </div>
                  <div class="detail-item" v-if="lead.phone">
                    <span class="material-icons detail-icon">phone</span>
                    <span class="detail-text">{{ lead.phone }}</span>
                  </div>
                  <div class="detail-item" v-if="lead.website">
                    <span class="material-icons detail-icon">language</span>
                    <a :href="lead.website" target="_blank" class="detail-link">{{ lead.website }}</a>
                  </div>
                </div>
                
                <div class="lead-metrics">
                  <!-- Lead Score -->
                  <div class="metric lead-score-metric">
                    <span class="metric-label">Lead Score</span>
                    <div class="lead-score-display">
                      <span class="lead-score-number">{{ lead.lead_score || 0 }}</span>
                      <span class="lead-score-badge" :class="getUrgencyClass(lead.urgency_level)">
                        {{ lead.urgency_level || 'Niedrig' }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Website Quality -->
                  <div class="metric" v-if="lead.website_quality_score">
                    <span class="metric-label">Website Score</span>
                    <div class="metric-bar">
                      <div 
                        class="metric-fill" 
                        :class="getScoreClass(lead.website_quality_score)"
                        :style="{ width: (lead.website_quality_score || 0) + '%' }"
                      ></div>
                    </div>
                    <span class="metric-value">{{ lead.website_quality_score || 0 }}/100</span>
                  </div>
                  
                  <!-- PageSpeed Score -->
                  <div class="metric" v-if="lead.page_speed_score">
                    <span class="metric-label">PageSpeed</span>
                    <div class="metric-bar">
                      <div 
                        class="metric-fill" 
                        :class="getScoreClass(lead.page_speed_score)"
                        :style="{ width: (lead.page_speed_score || 0) + '%' }"
                      ></div>
                    </div>
                    <span class="metric-value">{{ lead.page_speed_score || 0 }}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Lead Details Modal -->
          <div v-if="selectedLead" class="modal-overlay" @click="selectedLead = null">
            <div class="modal" @click.stop>
              <div class="modal-header">
                <h3>{{ selectedLead.name }}</h3>
                <button @click="selectedLead = null" class="close-btn">
                  <span class="material-icons">close</span>
                </button>
              </div>
              <div class="modal-content">
                <div class="lead-detail-section">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">Kategorie:</span>
                      <span class="detail-value">{{ selectedLead.business_category || 'Sonstige' }}</span>
                    </div>
                    <div class="detail-item" v-if="selectedLead.address">
                      <span class="detail-label">Adresse:</span>
                      <span class="detail-value">{{ selectedLead.address }}</span>
                    </div>
                    <div class="detail-item" v-if="selectedLead.phone">
                      <span class="detail-label">Telefon:</span>
                      <span class="detail-value">{{ selectedLead.phone }}</span>
                    </div>
                    <div class="detail-item" v-if="selectedLead.website">
                      <span class="detail-label">Website:</span>
                      <a :href="selectedLead.website" target="_blank" class="detail-link">{{ selectedLead.website }}</a>
                    </div>
                    <div class="detail-item" v-if="selectedLead.rating">
                      <span class="detail-label">Bewertung:</span>
                      <span class="detail-value">{{ selectedLead.rating }} ⭐ ({{ selectedLead.review_count || 0 }} Bewertungen)</span>
                    </div>
                    <div class="detail-item" v-if="selectedLead.website_quality_score">
                      <span class="detail-label">Website Score:</span>
                      <span class="detail-value">{{ selectedLead.website_quality_score }}/100</span>
                    </div>
                    <div class="detail-item" v-if="selectedLead.page_speed_score">
                      <span class="detail-label">PageSpeed Score:</span>
                      <span class="detail-value">{{ selectedLead.page_speed_score }}/100</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Lead Score:</span>
                      <span class="detail-value">{{ selectedLead.lead_score || 0 }}/100</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Dringlichkeit:</span>
                      <span class="detail-value">{{ selectedLead.urgency_level || 'Niedrig' }}</span>
                    </div>
                  </div>
                  
                  <div class="lead-actions-section">
                    <button @click="saveLead(selectedLead)" class="btn-primary">
                      <span class="material-icons">save</span>
                      Lead speichern
                    </button>
                    <button @click="addToPipeline(selectedLead)" class="btn-secondary">
                      <span class="material-icons">autorenew</span>
                      Zur Pipeline hinzufügen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button @click="showSampleKeywords" class="btn-secondary">
              <span class="material-icons">lightbulb</span>
              Beispiel-Keywords
            </button>
            <button @click="clearResults" class="btn-secondary">
              <span class="material-icons">delete</span>
              Ergebnisse löschen
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { $fetch } from 'ofetch'

// Refs
const searchKeyword = ref('')
const location = ref('Berlin, Deutschland')
const websiteQuality = ref('all')
const minRating = ref(0)
const maxResults = ref(60)
const scoreFilter = ref('all')
const researchResults = ref([])
const keywordSuggestions = ref([])
const savedLeads = ref([])
const selectedLead = ref(null)
const isLoading = ref(false)
const savingLeadIds = ref([])
const feedbackMessage = ref('')
const feedbackType = ref('success')
let feedbackTimeout = null

function showFeedback(msg, type = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  if (feedbackTimeout) clearTimeout(feedbackTimeout)
  feedbackTimeout = setTimeout(() => { feedbackMessage.value = '' }, 2500)
}

// Computed
const filteredResults = computed(() => {
  let filtered = researchResults.value

  // Score Filter
  if (scoreFilter.value !== 'all') {
    filtered = filtered.filter(lead => {
      const score = lead.website_quality_score || 0
      if (scoreFilter.value === 'high') return score >= 80
      if (scoreFilter.value === 'medium') return score >= 50 && score < 80
      if (scoreFilter.value === 'low') return score < 50
      return true
    })
  }

  // Website Quality Filter
  if (websiteQuality.value !== 'all') {
    filtered = filtered.filter(lead => {
      const score = lead.website_quality_score || 0
      if (websiteQuality.value === 'high') return score >= 80
      if (websiteQuality.value === 'medium') return score >= 50 && score < 80
      if (websiteQuality.value === 'low') return score < 50
      return true
    })
  }

  // Rating Filter
  if (minRating.value > 0) {
    filtered = filtered.filter(lead => (lead.rating || 0) >= minRating.value)
  }

  // Sort by Lead Score (highest first)
  return filtered.sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))
})

// Methods
const startResearch = async () => {
  if (!searchKeyword.value.trim()) return
  isLoading.value = true
  try {
    const response = await $fetch('/api/search', {
      method: 'POST',
      body: {
        query: searchKeyword.value,
        location: location.value,
        maxResults: maxResults.value
      }
    })
    
    if (response.success) {
      researchResults.value = response.results
      showFeedback(`${response.results.length} Leads gefunden!`, 'success')
      
      // Keyword-Vorschläge generieren
      generateKeywordSuggestions(searchKeyword.value)
    }
  } catch (error) {
    showFeedback('Fehler bei der Recherche!', 'error')
    console.error('Fehler bei der Recherche:', error)
  } finally {
    isLoading.value = false
  }
}

const generateKeywordSuggestions = (keyword) => {
  // Statische Keyword-Vorschläge für Webdesign-relevante Branchen
  const suggestions = {
    'zahnarzt': [
      { keyword: 'Zahnarztpraxis', searchVolume: 12000, competition: 0.8, suggestedBid: 2.50 },
      { keyword: 'Zahnarzt Berlin', searchVolume: 8900, competition: 0.9, suggestedBid: 3.20 },
      { keyword: 'Zahnarzt Website', searchVolume: 2100, competition: 0.6, suggestedBid: 1.80 },
      { keyword: 'Zahnarzt Online Termin', searchVolume: 5400, competition: 0.7, suggestedBid: 2.10 }
    ],
    'restaurant': [
      { keyword: 'Restaurant Berlin', searchVolume: 18000, competition: 0.9, suggestedBid: 2.80 },
      { keyword: 'Restaurant Website', searchVolume: 3200, competition: 0.5, suggestedBid: 1.50 },
      { keyword: 'Restaurant Online Bestellung', searchVolume: 7600, competition: 0.8, suggestedBid: 2.40 },
      { keyword: 'Restaurant Speisekarte Online', searchVolume: 4100, competition: 0.6, suggestedBid: 1.90 }
    ],
    'anwalt': [
      { keyword: 'Rechtsanwalt Berlin', searchVolume: 9500, competition: 0.8, suggestedBid: 2.90 },
      { keyword: 'Anwalt Website', searchVolume: 2800, competition: 0.6, suggestedBid: 1.70 },
      { keyword: 'Rechtsanwalt Online Beratung', searchVolume: 3800, competition: 0.7, suggestedBid: 2.20 },
      { keyword: 'Anwalt Erstberatung Online', searchVolume: 2200, competition: 0.5, suggestedBid: 1.60 }
    ],
    'fitness': [
      { keyword: 'Fitnessstudio Berlin', searchVolume: 14000, competition: 0.8, suggestedBid: 2.30 },
      { keyword: 'Fitnessstudio Website', searchVolume: 2600, competition: 0.5, suggestedBid: 1.40 },
      { keyword: 'Fitnessstudio Online Anmeldung', searchVolume: 5200, competition: 0.7, suggestedBid: 1.90 },
      { keyword: 'Fitnessstudio Kursplan Online', searchVolume: 3100, competition: 0.6, suggestedBid: 1.60 }
    ]
  }
  
  const keywordLower = keyword.toLowerCase()
  keywordSuggestions.value = suggestions[keywordLower] || []
}

const useKeywordSuggestion = (keyword) => {
  searchKeyword.value = keyword
  startResearch()
}

const saveLead = async (lead) => {
  if (isLeadSaved(lead)) {
    showFeedback('Kontakt bereits gespeichert', 'warn')
    return
  }
  savingLeadIds.value.push(lead.place_id)
  isLoading.value = true
  try {
    const response = await $fetch('/api/leads', {
      method: 'POST',
      body: {
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.name,
        website: lead.website || '',
        logo: lead.logo || '',
        status: 'Neu',
        score: lead.website_quality_score || 50,
        notes: `Gefunden via Recherche: ${searchKeyword.value} in ${location.value}`,
        
        // Erweiterte Felder
        lead_score: lead.lead_score || 0,
        urgency_level: lead.urgency_level || 'Niedrig',
        estimated_budget: lead.estimated_budget || '€2.000 - €5.000',
        business_size: lead.business_size || 'Unbekannt',
        business_category: lead.business_category || 'Sonstige',
        technology_stack: lead.technology_stack || 'Unbekannt',
        page_speed_score: lead.page_speed_score || 0,
        mobile_friendly: lead.mobile_friendly || false,
        has_contact_form: lead.has_contact_form || false,
        social_media_presence: lead.social_media_presence || false,
        business_status: lead.business_status || 'Unbekannt',
        price_level: lead.price_level || null,
        opening_hours: lead.opening_hours || '',
        review_count: lead.review_count || 0,
        rating: lead.rating || 0
      }
    })
    if (response.success) {
      showFeedback('Kontakt gespeichert!', 'success')
      await loadSavedLeads()
    }
  } catch (error) {
    showFeedback('Fehler beim Speichern!', 'error')
  } finally {
    savingLeadIds.value = savingLeadIds.value.filter(id => id !== lead.place_id)
    isLoading.value = false
  }
}

const saveAllLeads = async () => {
  const unsavedLeads = researchResults.value.filter(lead => !isLeadSaved(lead))
  if (unsavedLeads.length === 0) {
    showFeedback('Alle Leads bereits gespeichert!', 'warn')
    return
  }
  
  isLoading.value = true
  let savedCount = 0
  
  for (const lead of unsavedLeads) {
    try {
      await saveLead(lead)
      savedCount++
    } catch (error) {
      console.error('Fehler beim Speichern von:', lead.name, error)
    }
  }
  
  showFeedback(`${savedCount} von ${unsavedLeads.length} Leads gespeichert!`, 'success')
  isLoading.value = false
}

const loadSavedLeads = async () => {
  try {
    const response = await $fetch('/api/leads')
    if (response.success) {
      savedLeads.value = response.data
    }
  } catch (error) {
    console.error('Fehler beim Laden der gespeicherten Leads:', error)
  }
}

const isLeadSaved = (lead) => {
  return savedLeads.value.some(saved => 
    saved.name === lead.name || 
    (saved.website && saved.website === lead.website)
  )
}

const showLeadDetails = (lead) => {
  selectedLead.value = lead
}

const exportLeads = () => {
  const csvContent = generateCSV(researchResults.value)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `leads_${searchKeyword.value}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  showFeedback('CSV Export gestartet!', 'success')
}

const generateCSV = (leads) => {
  const headers = [
    'Name', 'Adresse', 'Telefon', 'Website', 'Bewertung', 'Bewertungen',
    'Lead Score', 'Dringlichkeit', 'Geschätztes Budget', 'Business Größe',
    'Kategorie', 'Technologie', 'PageSpeed Score', 'Mobile Friendly',
    'Kontaktformular', 'Social Media', 'Business Status', 'Öffnungszeiten'
  ]
  
  const rows = leads.map(lead => [
    lead.name,
    lead.address,
    lead.phone,
    lead.website,
    lead.rating,
    lead.review_count,
    lead.lead_score,
    lead.urgency_level,
    lead.estimated_budget,
    lead.business_size,
    lead.business_category,
    lead.technology_stack,
    lead.page_speed_score,
    lead.mobile_friendly ? 'Ja' : 'Nein',
    lead.has_contact_form ? 'Ja' : 'Nein',
    lead.social_media_presence ? 'Ja' : 'Nein',
    lead.business_status,
    lead.opening_hours
  ])
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${field || ''}"`).join(',')
  ).join('\n')
}

const addToPipeline = (lead) => {
  // Implementierung für Pipeline-Hinzufügung
  showFeedback('Lead zur Pipeline hinzugefügt!', 'success')
  selectedLead.value = null
}

const showSampleKeywords = () => {
  const samples = [
    'Zahnarzt Berlin',
    'Restaurant München',
    'Anwalt Hamburg',
    'Fitnessstudio Köln',
    'Beauty Salon Frankfurt',
    'Immobilienmakler Düsseldorf',
    'Autohaus Stuttgart',
    'Buchhandlung Bremen'
  ]
  searchKeyword.value = samples[Math.floor(Math.random() * samples.length)]
  showFeedback('Beispiel-Keyword geladen!', 'success')
}

const clearResults = () => {
  researchResults.value = []
  keywordSuggestions.value = []
  showFeedback('Ergebnisse gelöscht!', 'success')
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString('de-DE')
}

const getCompetitionClass = (competition) => {
  if (competition < 0.3) return 'low'
  if (competition < 0.7) return 'medium'
  return 'high'
}

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getScoreClass = (score) => {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'poor'
}

const getUrgencyClass = (urgency) => {
  if (urgency === 'Hoch') return 'high'
  if (urgency === 'Mittel') return 'medium'
  return 'low'
}

onMounted(() => {
  loadSavedLeads()
})
</script>

<style scoped>
.content-area {
  padding: var(--spacing-8);
}

/* Search Section */
.search-section {
  margin-bottom: var(--spacing-8);
}

.search-container {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
}

.search-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.main-search {
  display: flex;
  gap: var(--spacing-3);
}

.keyword-input {
  flex: 1;
  font-size: var(--font-size-base);
}

.search-btn {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  white-space: nowrap;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-gray-200);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.filter-group label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-700);
}

.filter-input,
.filter-select {
  font-size: var(--font-size-sm);
}

/* Suggestions Section */
.suggestions-section {
  margin-bottom: var(--spacing-8);
}

.section-header {
  margin-bottom: var(--spacing-6);
}

.section-header h3 {
  margin-bottom: var(--spacing-2);
  color: var(--color-gray-900);
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

.suggestion-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-card:hover {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.suggestion-keyword {
  font-weight: 600;
  color: var(--color-gray-900);
  font-size: var(--font-size-sm);
}

.suggestion-volume {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.suggestion-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.competition-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.competition-badge.low {
  background: var(--color-success);
  color: var(--color-white);
}

.competition-badge.medium {
  background: var(--color-warning);
  color: var(--color-white);
}

.competition-badge.high {
  background: var(--color-error);
  color: var(--color-white);
}

.bid-info {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: 500;
}

/* Results Section */
.results-section {
  margin-bottom: var(--spacing-8);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.results-header h3 {
  color: var(--color-gray-900);
}

.results-controls {
  display: flex;
  gap: var(--spacing-3);
}

.results-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
}

.results-filter label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-700);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-6);
}

.lead-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  transition: all 0.2s ease;
}

.lead-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.lead-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.lead-avatar {
  flex-shrink: 0;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.avatar-fallback {
  width: 48px;
  height: 48px;
  background: var(--color-primary-50);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-primary-600);
}

.lead-info {
  flex: 1;
  min-width: 0;
}

.lead-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 var(--spacing-1) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lead-category {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0 0 var(--spacing-2) 0;
}

.lead-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.stars {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.rating-text {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.lead-actions {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
  padding: var(--spacing-2);
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.saved-check {
  color: var(--color-success);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.lead-details {
  margin-bottom: var(--spacing-4);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.detail-icon {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.detail-text {
  color: var(--color-gray-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-link {
  color: var(--color-primary-600);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-link:hover {
  text-decoration: underline;
}

.lead-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  font-weight: 500;
}

.lead-score-metric {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.lead-score-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.lead-score-number {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-gray-900);
}

.lead-score-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.lead-score-badge.high {
  background: var(--color-success);
  color: var(--color-white);
}

.lead-score-badge.medium {
  background: var(--color-warning);
  color: var(--color-white);
}

.lead-score-badge.low {
  background: var(--color-gray-300);
  color: var(--color-gray-700);
}

.metric-bar {
  height: 6px;
  background: var(--color-gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.metric-fill.high {
  background: var(--color-success);
}

.metric-fill.medium {
  background: var(--color-warning);
}

.metric-fill.low {
  background: var(--color-error);
}

.metric-value {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  font-weight: 500;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-header h3 {
  margin: 0;
  color: var(--color-gray-900);
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--color-gray-500);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.close-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.modal-content {
  padding: var(--spacing-6);
}

.lead-detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: 500;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-gray-900);
}

.lead-actions-section {
  display: flex;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-gray-200);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  margin-top: var(--spacing-8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-area {
    padding: var(--spacing-4);
  }
  
  .main-search {
    flex-direction: column;
  }
  
  .filters {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }
  
  .results-controls {
    width: 100%;
    justify-content: stretch;
  }
  
  .results-controls .btn-primary,
  .results-controls .btn-secondary {
    flex: 1;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .lead-card {
    padding: var(--spacing-4);
  }
  
  .lead-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .lead-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .lead-actions .btn-primary,
  .lead-actions .btn-secondary {
    flex: 1;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .modal {
    margin: var(--spacing-4);
    max-height: calc(100vh - 2rem);
  }
}
</style> 