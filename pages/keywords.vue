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
          
          <NuxtLink to="/lists" class="nav-item" active-class="active">
            <span class="nav-icon material-icons">list</span>
            <span class="nav-text">Listen</span>
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
            <h2>Keyword Management</h2>
            <p class="breadcrumb">Keywords für Lead-Recherche verwalten</p>
          </div>
          <div class="header-right">
            <button @click="addKeyword" class="btn-primary">
              <span class="material-icons">add</span>
              Keyword hinzufügen
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Keyword Stats -->
          <section class="keyword-stats">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">track_changes</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ totalKeywords }}</div>
                  <div class="stat-label">Aktive Keywords</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">group</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ totalLeads }}</div>
                  <div class="stat-label">Leads gefunden</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">trending_up</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ avgLeadsPerKeyword }}</div>
                  <div class="stat-label">Ø Leads pro Keyword</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">category</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ categories.length }}</div>
                  <div class="stat-label">Kategorien</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Keywords Grid -->
          <section class="keywords-section">
            <div class="section-header">
              <h3>Keyword Übersicht</h3>
              <div class="keyword-controls">
                <select v-model="selectedCategory" class="select">
                  <option value="">Alle Kategorien</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
                <button @click="exportKeywords" class="btn-secondary">
                  <span class="material-icons">download</span>
                  Export
                </button>
              </div>
            </div>

            <div class="keywords-grid">
              <div v-for="keyword in filteredKeywords" :key="keyword.id" class="keyword-card">
                <div class="keyword-header">
                  <div class="keyword-icon">
                    <span class="material-icons">search</span>
                  </div>
                  <div class="keyword-info">
                    <h4 class="keyword-term">{{ keyword.term }}</h4>
                    <div class="keyword-category">
                      <span class="category-badge">{{ keyword.category }}</span>
                    </div>
                  </div>
                  <div class="keyword-actions">
                    <button @click="editKeyword(keyword)" class="btn-secondary btn-sm">
                      <span class="material-icons">edit</span>
                    </button>
                    <button @click="deleteKeyword(keyword.id)" class="btn-error btn-sm">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </div>
                
                <div class="keyword-stats">
                  <div class="keyword-stat">
                    <span class="stat-label">Leads gefunden</span>
                    <span class="stat-value">{{ keyword.lead_count || 0 }}</span>
                  </div>
                  <div class="keyword-stat">
                    <span class="stat-label">Letzte Suche</span>
                    <span class="stat-value">{{ keyword.last_search || 'Nie' }}</span>
                  </div>
                  <div class="keyword-stat">
                    <span class="stat-label">Status</span>
                    <span class="status-badge" :class="getStatusClass(keyword.status)">
                      {{ keyword.status || 'Aktiv' }}
                    </span>
                  </div>
                </div>
                
                <div class="keyword-actions-bottom">
                  <button @click="searchWithKeyword(keyword)" class="btn-primary btn-sm">
                    <span class="material-icons">search</span>
                    Recherche starten
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredKeywords.length === 0" class="empty-state">
              <div class="empty-icon">
                <span class="material-icons">track_changes</span>
              </div>
              <h3>Keine Keywords gefunden</h3>
              <p>Füge deine ersten Keywords hinzu, um mit der Lead-Recherche zu beginnen.</p>
              <button @click="addKeyword" class="btn-primary">
                <span class="material-icons">add</span>
                Keyword hinzufügen
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const keywords = ref([])
const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const selectedCategory = ref('')

const totalKeywords = computed(() => keywords.value.length)
const totalLeads = computed(() => keywords.value.reduce((sum, k) => sum + (k.lead_count || 0), 0))
const avgLeadsPerKeyword = computed(() => totalKeywords.value > 0 ? Math.round(totalLeads.value / totalKeywords.value) : 0)
const categories = computed(() => [...new Set(keywords.value.map(k => k.category).filter(Boolean))])

const filteredKeywords = computed(() => {
  if (!selectedCategory.value) return keywords.value
  return keywords.value.filter(k => k.category === selectedCategory.value)
})

function showFeedback(msg, type = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  setTimeout(() => { feedbackMessage.value = '' }, 3000)
}

const loadKeywords = async () => {
  isLoading.value = true
  try {
    const response = await $fetch('/api/keywords')
    if (response.success) {
      keywords.value = response.data
      showFeedback(`${keywords.value.length} Keywords geladen!`, 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Laden der Keywords!', 'error')
    console.error('Fehler beim Laden der Keywords:', error)
  } finally {
    isLoading.value = false
  }
}

const addKeyword = () => {
  // Implementierung für Keyword hinzufügen
  showFeedback('Keyword hinzufügen wird implementiert...', 'success')
}

const editKeyword = (keyword) => {
  // Implementierung für Keyword bearbeiten
  showFeedback('Keyword bearbeiten wird implementiert...', 'success')
}

const deleteKeyword = async (id) => {
  if (!confirm('Keyword wirklich löschen?')) return
  
  isLoading.value = true
  try {
    const response = await $fetch(`/api/keywords/${id}`, { method: 'DELETE' })
    if (response.success) {
      showFeedback('Keyword gelöscht!', 'success')
      await loadKeywords()
    }
  } catch (error) {
    showFeedback('Fehler beim Löschen!', 'error')
  } finally {
    isLoading.value = false
  }
}

const searchWithKeyword = (keyword) => {
  // Implementierung für Recherche mit Keyword
  showFeedback(`Recherche mit "${keyword.term}" wird gestartet...`, 'success')
}

const exportKeywords = async () => {
  try {
    const response = await $fetch('/api/keywords/export?format=csv')
    if (response.success) {
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'keywords.csv'
      a.click()
      window.URL.revokeObjectURL(url)
      showFeedback('Keywords exportiert!', 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Export!', 'error')
  }
}

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'aktiv':
    case 'active':
      return 'status-active'
    case 'pausiert':
    case 'paused':
      return 'status-paused'
    case 'archiviert':
    case 'archived':
      return 'status-archived'
    default:
      return 'status-active'
  }
}

onMounted(() => {
  loadKeywords()
})
</script> 