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
            <h2>Lead Pipeline</h2>
            <p class="breadcrumb">Verwalte deine Lead-Status und Follow-ups</p>
          </div>
          <div class="header-right">
            <button @click="addNewLead" class="btn-primary">
              <span class="material-icons">add</span>
              Neuer Lead
            </button>
            <button @click="exportPipeline" class="btn-secondary">
              <span class="material-icons">download</span>
              Export
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">

          
          <!-- Pipeline Overview -->
          <section class="pipeline-overview-section">
            <div class="overview-header">
              <h3>Pipeline Übersicht</h3>
              <button @click="addNewLead" class="btn-primary">
                <span class="material-icons">add</span>
                Lead hinzufügen
              </button>
            </div>
            
            <div class="overview-stats">
              <div class="stat-item">
                <div class="stat-icon">
                  <span class="material-icons">fiber_new</span>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ pipelineStats.new || 0 }}</div>
                  <div class="stat-label">Neu</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <span class="material-icons">phone</span>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ pipelineStats.contacted || 0 }}</div>
                  <div class="stat-label">Kontaktiert</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <span class="material-icons">chat</span>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ pipelineStats.qualified || 0 }}</div>
                  <div class="stat-label">Qualifiziert</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <span class="material-icons">euro</span>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ pipelineStats.proposal || 0 }}</div>
                  <div class="stat-label">Angebot</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <span class="material-icons">check_circle</span>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ pipelineStats.closed || 0 }}</div>
                  <div class="stat-label">Geschlossen</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Pipeline Board -->
          <section class="pipeline-board">
            <div class="board-columns">
              <!-- New Column -->
              <div class="board-column">
                <div class="column-header">
                  <h4>
                    <span class="material-icons">fiber_new</span>
                    Neu
                  </h4>
                  <span class="column-count">{{ getLeadsByStatus('Neu').length }}</span>
                </div>
                <div class="column-content">
                  <div 
                    v-for="lead in getLeadsByStatus('Neu')" 
                    :key="lead.id"
                    class="lead-card"
                    @click="editLead(lead)"
                  >
                    <div class="lead-header">
                      <div class="lead-avatar">
                        <div class="avatar-fallback">
                          {{ getInitials(lead.name) }}
                        </div>
                      </div>
                      <div class="lead-info">
                        <h5 class="lead-name">{{ lead.name }}</h5>
                        <p class="lead-company">{{ lead.industry || 'Unbekannt' }}</p>
                        <div class="lead-score">
                          <span class="score-badge">{{ lead.score || 0 }}/100</span>
                        </div>
                      </div>
                    </div>
                    <div class="lead-details">
                      <div v-if="lead.email" class="detail-item">
                        <span class="material-icons detail-icon">email</span>
                        <span class="detail-text">{{ lead.email }}</span>
                      </div>
                      <div v-if="lead.phone" class="detail-item">
                        <span class="material-icons detail-icon">phone</span>
                        <span class="detail-text">{{ lead.phone }}</span>
                      </div>
                    </div>
                    <div class="lead-actions">
                      <button @click.stop="moveLead(lead, 'Kontaktiert')" class="btn-primary btn-sm">
                        Kontaktieren
                      </button>
                      <button @click.stop="markAsUnsuitable(lead)" class="btn-secondary btn-sm">
                        Ungeeignet
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contacted Column -->
              <div class="board-column">
                <div class="column-header">
                  <h4>
                    <span class="material-icons">phone</span>
                    Kontaktiert
                  </h4>
                  <span class="column-count">{{ getLeadsByStatus('Kontaktiert').length }}</span>
                </div>
                <div class="column-content">
                  <div 
                    v-for="lead in getLeadsByStatus('Kontaktiert')" 
                    :key="lead.id"
                    class="lead-card"
                    @click="editLead(lead)"
                  >
                    <div class="lead-header">
                      <div class="lead-avatar">
                        <div class="avatar-fallback">
                          {{ getInitials(lead.name) }}
                        </div>
                      </div>
                      <div class="lead-info">
                        <h5 class="lead-name">{{ lead.name }}</h5>
                        <p class="lead-company">{{ lead.industry || 'Unbekannt' }}</p>
                        <div class="lead-score">
                          <span class="score-badge">{{ lead.score || 0 }}/100</span>
                        </div>
                      </div>
                    </div>
                    <div class="lead-details">
                      <div v-if="lead.email" class="detail-item">
                        <span class="material-icons detail-icon">email</span>
                        <span class="detail-text">{{ lead.email }}</span>
                      </div>
                      <div v-if="lead.phone" class="detail-item">
                        <span class="material-icons detail-icon">phone</span>
                        <span class="detail-text">{{ lead.phone }}</span>
                      </div>
                    </div>
                    <div class="lead-actions">
                      <button @click.stop="moveLead(lead, 'Qualifiziert')" class="btn-primary btn-sm">
                        Qualifizieren
                      </button>
                      <button @click.stop="markAsUnsuitable(lead)" class="btn-secondary btn-sm">
                        Ungeeignet
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Qualified Column -->
              <div class="board-column">
                <div class="column-header">
                  <h4>
                    <span class="material-icons">chat</span>
                    Qualifiziert
                  </h4>
                  <span class="column-count">{{ getLeadsByStatus('Qualifiziert').length }}</span>
                </div>
                <div class="column-content">
                  <div 
                    v-for="lead in getLeadsByStatus('Qualifiziert')" 
                    :key="lead.id"
                    class="lead-card"
                    @click="editLead(lead)"
                  >
                    <div class="lead-header">
                      <div class="lead-avatar">
                        <div class="avatar-fallback">
                          {{ getInitials(lead.name) }}
                        </div>
                      </div>
                      <div class="lead-info">
                        <h5 class="lead-name">{{ lead.name }}</h5>
                        <p class="lead-company">{{ lead.industry || 'Unbekannt' }}</p>
                        <div class="lead-score">
                          <span class="score-badge">{{ lead.score || 0 }}/100</span>
                        </div>
                      </div>
                    </div>
                    <div class="lead-details">
                      <div v-if="lead.email" class="detail-item">
                        <span class="material-icons detail-icon">email</span>
                        <span class="detail-text">{{ lead.email }}</span>
                      </div>
                      <div v-if="lead.phone" class="detail-item">
                        <span class="material-icons detail-icon">phone</span>
                        <span class="detail-text">{{ lead.phone }}</span>
                      </div>
                    </div>
                    <div class="lead-actions">
                      <button @click.stop="moveLead(lead, 'Angebot')" class="btn-primary btn-sm">
                        Angebot
                      </button>
                      <button @click.stop="markAsUnsuitable(lead)" class="btn-secondary btn-sm">
                        Ungeeignet
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Proposal Column -->
              <div class="board-column">
                <div class="column-header">
                  <h4>
                    <span class="material-icons">euro</span>
                    Angebot
                  </h4>
                  <span class="column-count">{{ getLeadsByStatus('Angebot').length }}</span>
                </div>
                <div class="column-content">
                  <div 
                    v-for="lead in getLeadsByStatus('Angebot')" 
                    :key="lead.id"
                    class="lead-card"
                    @click="editLead(lead)"
                  >
                    <div class="lead-header">
                      <div class="lead-avatar">
                        <div class="avatar-fallback">
                          {{ getInitials(lead.name) }}
                        </div>
                      </div>
                      <div class="lead-info">
                        <h5 class="lead-name">{{ lead.name }}</h5>
                        <p class="lead-company">{{ lead.industry || 'Unbekannt' }}</p>
                        <div class="lead-score">
                          <span class="score-badge">{{ lead.score || 0 }}/100</span>
                        </div>
                      </div>
                    </div>
                    <div class="lead-details">
                      <div v-if="lead.email" class="detail-item">
                        <span class="material-icons detail-icon">email</span>
                        <span class="detail-text">{{ lead.email }}</span>
                      </div>
                      <div v-if="lead.phone" class="detail-item">
                        <span class="material-icons detail-icon">phone</span>
                        <span class="detail-text">{{ lead.phone }}</span>
                      </div>
                    </div>
                    <div class="lead-actions">
                      <button @click.stop="moveLead(lead, 'Geschlossen')" class="btn-success btn-sm">
                        Gewonnen
                      </button>
                      <button @click.stop="markAsUnsuitable(lead)" class="btn-secondary btn-sm">
                        Ungeeignet
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Closed Column -->
              <div class="board-column">
                <div class="column-header">
                  <h4>
                    <span class="material-icons">check_circle</span>
                    Geschlossen
                  </h4>
                  <span class="column-count">{{ getLeadsByStatus('Geschlossen').length }}</span>
                </div>
                <div class="column-content">
                  <div 
                    v-for="lead in getLeadsByStatus('Geschlossen')" 
                    :key="lead.id"
                    class="lead-card"
                    @click="editLead(lead)"
                  >
                    <div class="lead-header">
                      <div class="lead-avatar">
                        <div class="avatar-fallback">
                          {{ getInitials(lead.name) }}
                        </div>
                      </div>
                      <div class="lead-info">
                        <h5 class="lead-name">{{ lead.name }}</h5>
                        <p class="lead-company">{{ lead.industry || 'Unbekannt' }}</p>
                        <div class="lead-score">
                          <span class="score-badge">{{ lead.score || 0 }}/100</span>
                        </div>
                      </div>
                    </div>
                    <div class="lead-details">
                      <div v-if="lead.email" class="detail-item">
                        <span class="material-icons detail-icon">email</span>
                        <span class="detail-text">{{ lead.email }}</span>
                      </div>
                      <div v-if="lead.phone" class="detail-item">
                        <span class="material-icons detail-icon">phone</span>
                        <span class="detail-text">{{ lead.phone }}</span>
                      </div>
                    </div>
                    <div class="lead-actions">
                      <button @click.stop="archiveLead(lead)" class="btn-secondary btn-sm">
                        Archivieren
                      </button>
                      <button @click.stop="markAsUnsuitable(lead)" class="btn-secondary btn-sm">
                        Ungeeignet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
    
    <!-- Lead Edit Modal -->
    <LeadEditModal 
      :show="showEditModal" 
      :lead="selectedLead" 
      @close="closeEditModal"
      @saved="onLeadSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { $fetch } from 'ofetch'

const leads = ref([])
const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const showEditModal = ref(false)
const selectedLead = ref(null)

const pipelineStats = computed(() => {
  const stats = {
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    closed: 0
  }
  
  leads.value.forEach(lead => {
    switch(lead.status) {
      case 'Neu':
        stats.new++
        break
      case 'Kontaktiert':
        stats.contacted++
        break
      case 'Qualifiziert':
        stats.qualified++
        break
      case 'Angebot':
        stats.proposal++
        break
      case 'Geschlossen':
        stats.closed++
        break
    }
  })
  
  return stats
})

function showFeedback(msg, type = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  setTimeout(() => { feedbackMessage.value = '' }, 3000)
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getLeadsByStatus = (status) => {
  return leads.value.filter(lead => lead.status === status)
}

const loadLeads = async () => {
  isLoading.value = true
  try {
    const response = await $fetch('/api/leads')
    if (response.success) {
      leads.value = response.data
      showFeedback(`${leads.value.length} Leads geladen!`, 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Laden der Leads!', 'error')
    console.error('Fehler beim Laden der Leads:', error)
  } finally {
    isLoading.value = false
  }
}

const moveLead = async (lead, newStatus) => {
  isLoading.value = true
  try {
    const response = await $fetch(`/api/leads/${lead.id}`, {
      method: 'PUT',
      body: {
        ...lead,
        status: newStatus
      }
    })
    if (response.success) {
      showFeedback(`Lead zu "${newStatus}" verschoben!`, 'success')
      await loadLeads()
    }
  } catch (error) {
    showFeedback('Fehler beim Verschieben!', 'error')
  } finally {
    isLoading.value = false
  }
}

const editLead = (lead) => {
  selectedLead.value = lead
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedLead.value = null
}

const onLeadSaved = async (savedLead) => {
  showFeedback('Lead erfolgreich gespeichert!', 'success')
  await loadLeads() // Liste neu laden
}

const addNewLead = () => {
  selectedLead.value = null // Null = neuer Lead
  showEditModal.value = true
}

const archiveLead = async (lead) => {
  if (!confirm('Lead wirklich archivieren?')) return
  
  isLoading.value = true
  try {
    const response = await $fetch(`/api/leads/${lead.id}`, {
      method: 'DELETE'
    })
    if (response.success) {
      showFeedback('Lead archiviert!', 'success')
      await loadLeads()
    }
  } catch (error) {
    showFeedback('Fehler beim Archivieren!', 'error')
  } finally {
    isLoading.value = false
  }
}

const exportPipeline = async () => {
  try {
    const response = await $fetch('/api/pipeline')
    if (response.success) {
      const csvContent = generateCSV(leads.value)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pipeline_export_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      showFeedback('Pipeline Export gestartet!', 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Export!', 'error')
  }
}

const generateCSV = (leads) => {
  const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Score', 'Notes']
  const csvContent = [
    headers.join(','),
    ...leads.map(lead => [
      `"${lead.name || ''}"`,
      `"${lead.email || ''}"`,
      `"${lead.phone || ''}"`,
      `"${lead.industry || ''}"`,
      `"${lead.status || ''}"`,
      `"${lead.score || 0}"`,
      `"${lead.notes || ''}"`
    ].join(','))
  ].join('\n')
  
  return csvContent
}

const markAsUnsuitable = async (lead) => {
  if (!confirm('Lead als ungeeignet markieren?')) return
  
  isLoading.value = true
  try {
    const response = await $fetch(`/api/leads/${lead.id}/mark-unsuitable`, {
      method: 'POST'
    })
    if (response.success) {
      showFeedback('Lead als ungeeignet markiert!', 'success')
      await loadLeads()
    }
  } catch (error) {
    showFeedback('Fehler beim Markieren als ungeeignet!', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadLeads()
})
</script>

<style scoped>
.content-area {
  padding: var(--spacing-8);
}



/* Pipeline Overview Section */
.pipeline-overview-section {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-8);
  overflow: hidden;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-gray-200);
  background: var(--color-gray-50);
}

.overview-header h3 {
  margin: 0;
  color: var(--color-gray-900);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  border-right: 1px solid var(--color-gray-200);
  transition: background-color 0.2s ease;
}

.stat-item:hover {
  background: var(--color-gray-50);
}

.stat-item:last-child {
  border-right: none;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-primary-50);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.stat-icon .material-icons {
  font-size: 24px;
  color: var(--color-primary-600);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1;
  margin-bottom: var(--spacing-1);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: 500;
}

/* Pipeline Board */
.pipeline-board {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.board-columns {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  min-height: 600px;
}

.board-column {
  border-right: 1px solid var(--color-gray-200);
  display: flex;
  flex-direction: column;
}

.board-column:last-child {
  border-right: none;
}

.column-header {
  padding: var(--spacing-4);
  background: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-header h4 {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-900);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.column-count {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.column-content {
  flex: 1;
  padding: var(--spacing-4);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.lead-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.lead-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.lead-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.lead-avatar {
  flex-shrink: 0;
}

.avatar-fallback {
  width: 32px;
  height: 32px;
  background: var(--color-primary-50);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary-600);
}

.lead-info {
  flex: 1;
  min-width: 0;
}

.lead-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 var(--spacing-1) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lead-company {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  margin: 0 0 var(--spacing-1) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lead-score {
  display: flex;
  align-items: center;
}

.score-badge {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.lead-details {
  margin-bottom: var(--spacing-3);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-xs);
}

.detail-icon {
  font-size: var(--font-size-xs);
  width: 12px;
  text-align: center;
  flex-shrink: 0;
  color: var(--color-gray-500);
}

.detail-text {
  color: var(--color-gray-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lead-actions {
  display: flex;
  gap: var(--spacing-2);
}

.btn-sm {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .overview-stats {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .board-columns {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .content-area {
    padding: var(--spacing-4);
  }
  
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }
  
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-item {
    border-right: none;
    border-bottom: 1px solid var(--color-gray-200);
  }
  
  .stat-item:nth-child(even) {
    border-left: 1px solid var(--color-gray-200);
  }
  
  .board-columns {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
  
  .board-column {
    border-right: none;
    border-bottom: 1px solid var(--color-gray-200);
  }
  
  .board-column:last-child {
    border-bottom: none;
  }
}
</style> 