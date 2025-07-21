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
            <h2>Dashboard</h2>
            <p class="breadcrumb">Übersicht über deine Lead-Aktivitäten</p>
          </div>
          <div class="header-right">
            <button @click="refreshData" class="btn-secondary">
              <span class="material-icons">refresh</span>
              Aktualisieren
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Stats Section -->
          <section class="stats-section">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">group</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ totalLeads }}</div>
                  <div class="stat-label">Gesamt Leads</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">fiber_new</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ activeLeads }}</div>
                  <div class="stat-label">Neue Leads</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">phone</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ dashboardData.statusStats.contactedLeads || 0 }}</div>
                  <div class="stat-label">Kontaktiert</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">check_circle</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ dashboardData.statusStats.convertedLeads || 0 }}</div>
                  <div class="stat-label">Konvertiert</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">track_changes</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ dashboardData.totalKeywords || 0 }}</div>
                  <div class="stat-label">Keywords</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Actions Section -->
          <section class="actions-section">
            <div class="section-header">
              <h3>Schnellaktionen</h3>
            </div>
            <div class="actions-grid">
              <NuxtLink to="/research" class="action-card">
                <div class="action-icon">
                  <span class="material-icons">search</span>
                </div>
                <div class="action-content">
                  <h4>Neue Leads finden</h4>
                  <p>Recherchiere nach neuen potenziellen Kunden</p>
                </div>
              </NuxtLink>

              <NuxtLink to="/leads" class="action-card">
                <div class="action-icon">
                  <span class="material-icons">group_add</span>
                </div>
                <div class="action-content">
                  <h4>Lead hinzufügen</h4>
                  <p>Manuell einen neuen Kontakt erstellen</p>
                </div>
              </NuxtLink>

              <NuxtLink to="/pipeline" class="action-card">
                <div class="action-icon">
                  <span class="material-icons">autorenew</span>
                </div>
                <div class="action-content">
                  <h4>Pipeline verwalten</h4>
                  <p>Lead-Status und Follow-ups verwalten</p>
                </div>
              </NuxtLink>

              <NuxtLink to="/analytics" class="action-card">
                <div class="action-icon">
                  <span class="material-icons">bar_chart</span>
                </div>
                <div class="action-content">
                  <h4>Analytics anzeigen</h4>
                  <p>Performance und Trends analysieren</p>
                </div>
              </NuxtLink>
            </div>
          </section>

          <!-- Recent Activity Section -->
          <section class="recent-activity-section">
            <div class="section-header">
              <h3>Letzte Aktivitäten</h3>
            </div>
            <div class="activity-list">
              <div v-if="recentLeads.length === 0" class="empty-state">
                <span class="material-icons empty-icon">inbox</span>
                <p>Noch keine Aktivitäten vorhanden</p>
                <NuxtLink to="/research" class="btn-primary">
                  <span class="material-icons">search</span>
                  Erste Leads finden
                </NuxtLink>
              </div>
              <div v-else v-for="lead in recentLeads" :key="lead.id" class="activity-item">
                <div class="activity-avatar">
                  <div class="avatar-fallback">
                    {{ getInitials(lead.name) }}
                  </div>
                </div>
                <div class="activity-content">
                  <div class="activity-header">
                    <h5>{{ lead.name }}</h5>
                    <span class="activity-time">{{ formatDate(lead.created_at) }}</span>
                  </div>
                  <p class="activity-description">
                    {{ lead.industry || 'Unbekannt' }} • {{ lead.status || 'Neu' }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const dashboardData = ref({
  totalLeads: 0,
  activeLeads: 0,
  highPriorityLeads: 0,
  avgLeadScore: 0,
  totalValue: 0,
  topCategories: [],
  statusStats: {}
})

const recentLeads = ref([])

function showFeedback(msg, type = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  setTimeout(() => { feedbackMessage.value = '' }, 3000)
}

// Computed properties mit Fallback zu "-"
const totalLeads = computed(() => dashboardData.value.totalLeads || '-')
const activeLeads = computed(() => dashboardData.value.activeLeads || '-')
const highPriorityLeads = computed(() => dashboardData.value.highPriorityLeads || '-')
const avgLeadScore = computed(() => dashboardData.value.avgLeadScore || '-')
const totalValue = computed(() => dashboardData.value.totalValue ? `€${dashboardData.value.totalValue.toLocaleString()}` : '-')

const loadDashboardData = async () => {
  isLoading.value = true
  try {
    // Load dashboard stats
    const statsResponse = await $fetch('/api/leads/stats')
    
    if (statsResponse.success) {
      dashboardData.value = statsResponse.data
    }
    
    // Load recent leads
    const leadsResponse = await $fetch('/api/leads')
    if (leadsResponse.success) {
      recentLeads.value = leadsResponse.data.slice(0, 5) // Show only 5 most recent
    }
    
    showFeedback('Dashboard-Daten geladen!', 'success')
  } catch (error) {
    console.error('Fehler beim Laden der Dashboard-Daten:', error)
    showFeedback('Fehler beim Laden der Dashboard-Daten', 'error')
  } finally {
    isLoading.value = false
  }
}

const refreshData = () => {
  loadDashboardData()
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  loadDashboardData()
})
</script>

 