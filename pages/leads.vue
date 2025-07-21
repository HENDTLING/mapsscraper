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
            <h2>Kontakte & Leads</h2>
            <p class="breadcrumb">Lead-Verwaltung und Kontaktdaten</p>
          </div>
          <div class="header-right">
            <button @click="addNewLead" class="btn-primary">
              <span class="material-icons">add</span>
              Neuer Lead
            </button>
            <button @click="exportLeads" class="btn-secondary">
              <span class="material-icons">download</span>
              CSV Export
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Header Actions -->
          <div class="header-actions">
            <div class="search-box">
              <span class="material-icons">search</span>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Leads durchsuchen..."
                @input="filterLeads"
                @keyup="filterLeads"
              />
            </div>
            
            <!-- Listen Filter -->
            <div class="list-filter">
              <label class="filter-label">Liste filtern:</label>
              <div class="select-wrapper">
                <select v-model="selectedListFilter" @change="filterByList" class="list-select">
                  <option value="">Alle Listen</option>
                  <option v-for="list in lists" :key="list.id" :value="list.id">
                    {{ list.name }} ({{ list.lead_count || 0 }})
                  </option>
                </select>
                <span class="select-arrow material-icons">expand_more</span>
              </div>
            </div>
            
            <button @click="addNewLead" class="btn-primary">
              <span class="material-icons">add</span>
              Neuer Lead
            </button>
          </div>
          
          <!-- Bulk Actions -->
          <div v-if="selectedLeads.length > 0" class="bulk-actions">
            <div class="bulk-info">
              <span class="material-icons">check_circle</span>
              {{ selectedLeads.length }} Lead{{ selectedLeads.length !== 1 ? 's' : '' }} ausgewählt
            </div>
            <div class="bulk-buttons">
              <ListSelector 
                :lead-ids="selectedLeads" 
                @lists-updated="handleListsUpdated"
              />
              <button @click="clearSelection" class="btn-secondary">
                <span class="material-icons">clear</span>
                Auswahl aufheben
              </button>
            </div>
          </div>
          
          <!-- Leads Grid -->
          <div class="leads-grid">
            <div v-for="lead in filteredLeads" :key="lead.id" class="lead-card" :class="{ selected: selectedLeads.includes(lead.id) }">
              <div class="lead-checkbox">
                <input 
                  type="checkbox" 
                  :checked="selectedLeads.includes(lead.id)"
                  @change="toggleLeadSelection(lead.id)"
                />
              </div>
              <div class="lead-header">
                <div class="lead-avatar">
                  <div class="avatar-fallback">
                    {{ getInitials(lead.name) }}
                  </div>
                </div>
                <div class="lead-info">
                  <h3 class="lead-name">{{ lead.name }}</h3>
                  <div class="lead-score">
                    <span class="score-badge">{{ lead.lead_score || 0 }}/100</span>
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
                <div v-if="lead.website" class="detail-item">
                  <span class="material-icons detail-icon">language</span>
                  <a :href="lead.website" target="_blank" class="detail-link">{{ lead.website }}</a>
                </div>
                <div v-if="lead.business_category" class="detail-item">
                  <span class="material-icons detail-icon">business</span>
                  <span class="detail-text">{{ lead.business_category }}</span>
                </div>
                
                <!-- Listen Tags -->
                <div v-if="lead.lists && lead.lists.length > 0" class="lead-lists">
                  <div v-for="list in lead.lists" :key="list.id" class="list-tag" :style="{ backgroundColor: list.color }">
                    <span class="material-icons list-icon">{{ list.icon }}</span>
                    <span class="list-name">{{ list.name }}</span>
                  </div>
                </div>
              </div>
              
              <div class="lead-actions">
                <button @click="editLead(lead)" class="btn-primary">Bearbeiten</button>
                <button @click="deleteLead(lead.id)" class="btn-error">Löschen</button>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="leads.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">
              <span class="material-icons">group</span>
            </div>
            <h3>Keine Leads gefunden</h3>
            <p>Starte mit der Recherche, um neue Leads zu finden.</p>
            <NuxtLink to="/research" class="btn-primary">
              <span class="material-icons">search</span>
              Recherche starten
            </NuxtLink>
          </div>
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
import { ref, onMounted } from 'vue'
import { $fetch } from 'ofetch'

const leads = ref([])
const filteredLeads = ref([])
const lists = ref([])
const selectedLeads = ref([])
const searchQuery = ref('')
const selectedListFilter = ref('')
const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const showEditModal = ref(false)
const selectedLead = ref(null)

// URL-Parameter für Listen-Filter
const route = useRoute()

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

const loadLeads = async () => {
  isLoading.value = true
  try {
    const response = await $fetch('/api/leads')
    if (response.success) {
      leads.value = response.data
      filteredLeads.value = response.data
      showFeedback(`${leads.value.length} Leads geladen!`, 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Laden der Leads!', 'error')
    console.error('Fehler beim Laden der Leads:', error)
  } finally {
    isLoading.value = false
  }
}

const loadLists = async () => {
  try {
    const response = await $fetch('/api/lists/stats')
    if (response.success) {
      lists.value = response.data
    }
  } catch (error) {
    console.error('Fehler beim Laden der Listen:', error)
  }
}

const filterLeads = () => {
  let filtered = leads.value
  
  // Text-Suche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(lead => 
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.industry?.toLowerCase().includes(query) ||
      lead.business_category?.toLowerCase().includes(query)
    )
  }
  
  // Listen-Filter
  if (selectedListFilter.value) {
    filtered = filtered.filter(lead => 
      lead.lists?.some(list => list.id === selectedListFilter.value)
    )
  }
  
  filteredLeads.value = filtered
}

const filterByList = () => {
  filterLeads()
}

const toggleLeadSelection = (leadId) => {
  const index = selectedLeads.value.indexOf(leadId)
  if (index > -1) {
    selectedLeads.value.splice(index, 1)
  } else {
    selectedLeads.value.push(leadId)
  }
}

const clearSelection = () => {
  selectedLeads.value = []
}

const handleListsUpdated = async () => {
  showFeedback('Leads erfolgreich zu Listen hinzugefügt!', 'success')
  await loadLeads() // Leads neu laden um Listen-Info zu aktualisieren
  clearSelection()
}

const handleListAdded = async () => {
  showFeedback('Lead erfolgreich zur Liste hinzugefügt!', 'success')
  await loadLeads() // Leads neu laden um Listen-Info zu aktualisieren
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

const deleteLead = async (id) => {
  if (!confirm('Lead wirklich löschen?')) return
  
  isLoading.value = true
  try {
    const response = await $fetch(`/api/leads/${id}`, { method: 'DELETE' })
    if (response.success) {
      showFeedback('Lead gelöscht!', 'success')
      await loadLeads()
    }
  } catch (error) {
    showFeedback('Fehler beim Löschen!', 'error')
  } finally {
    isLoading.value = false
  }
}

const exportLeads = async () => {
  try {
    const response = await $fetch('/api/leads/export?format=csv')
    if (response.success) {
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.filename || 'leads_export.csv'
      a.click()
      window.URL.revokeObjectURL(url)
      showFeedback('CSV Export gestartet!', 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Export!', 'error')
  }
}

onMounted(() => {
  loadLeads()
  loadLists()
  
  // Prüfe URL-Parameter für Listen-Filter
  if (route.query.list) {
    selectedListFilter.value = route.query.list
    filterByList()
  }
})
</script>

<style scoped>
.content-area {
  padding: var(--spacing-8);
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2) var(--spacing-3);
  flex: 1;
  max-width: 300px;
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--color-gray-900);
  width: 100%;
}

.search-box .material-icons {
  color: var(--color-gray-500);
  font-size: var(--font-size-lg);
}

.list-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 280px;
  background: var(--color-white);
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.list-filter:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
}

.list-filter:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-700);
  white-space: nowrap;
  flex-shrink: 0;
}

.select-wrapper {
  position: relative;
  flex: 1;
}

.list-select {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  padding-right: var(--spacing-8);
  border: none;
  background: transparent;
  color: var(--color-gray-900);
  font-size: var(--font-size-sm);
  cursor: pointer;
  outline: none;
  font-weight: 500;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.select-arrow {
  position: absolute;
  right: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-500);
  font-size: var(--font-size-lg);
  pointer-events: none;
  transition: all 0.2s ease;
}

.list-filter:focus-within .select-arrow {
  color: var(--color-primary-600);
  transform: translateY(-50%) rotate(180deg);
}

.list-select option {
  padding: var(--spacing-2);
  font-weight: 500;
  background: var(--color-white);
  color: var(--color-gray-900);
}

/* Bulk Actions */
.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-6);
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-primary-700);
  font-weight: 600;
}

.bulk-info .material-icons {
  color: var(--color-primary-600);
}

.bulk-buttons {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

/* Lead Cards */
.lead-card {
  position: relative;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  transition: all 0.2s ease;
}

.lead-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.lead-card.selected {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  box-shadow: var(--shadow-lg);
}

.lead-checkbox {
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
  z-index: 10;
}

.lead-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary-600);
}

/* Lead Lists */
.lead-lists {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-gray-100);
}

.list-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  color: var(--color-white);
  font-size: var(--font-size-xs);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.list-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.list-icon {
  font-size: var(--font-size-xs);
}

.list-name {
  white-space: nowrap;
}

/* Existing styles... */
</style>