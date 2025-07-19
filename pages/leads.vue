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
            <h2>Kontakte & Leads</h2>
            <p class="breadcrumb">Lead-Verwaltung und Kontaktdaten</p>
          </div>
          <div class="header-right">
            <button @click="exportLeads" class="btn-secondary">
              <span class="material-icons">download</span>
              CSV Export
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Leads Grid -->
          <div class="leads-grid">
            <div v-for="lead in leads" :key="lead.id" class="lead-card">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { $fetch } from 'ofetch'

const leads = ref([])
const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')

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
      showFeedback(`${leads.value.length} Leads geladen!`, 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Laden der Leads!', 'error')
    console.error('Fehler beim Laden der Leads:', error)
  } finally {
    isLoading.value = false
  }
}

const editLead = (lead) => {
  // Implementierung für Lead-Bearbeitung
  showFeedback('Lead-Bearbeitung wird implementiert...', 'success')
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
})
</script>

<style scoped>
.feedback-message {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  z-index: 2000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  animation: fadeInOut 2s;
}
.feedback-message.success { background: #10b981; color: #fff; }
.feedback-message.error { background: #ef4444; color: #fff; }

@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

.loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  font-size: 1.2rem;
  color: #2563eb;
}
.loading-spinner {
  font-size: 2.5rem;
  margin-right: 1rem;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.sidebar {
  width: 280px;
  background: #1e293b;
  color: white;
  padding: 24px;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: 32px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #3b82f6;
}

.tagline {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #334155;
  color: white;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
}

.nav-icon {
  font-size: 20px;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 24px;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-left h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.breadcrumb {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.content-area {
  padding: var(--spacing-8);
}

.leads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.lead-avatar {
  flex-shrink: 0;
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

.lead-score {
  display: flex;
  align-items: center;
}

.score-badge {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
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
  font-size: var(--font-size-sm);
  width: 16px;
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

.lead-actions {
  display: flex;
  gap: var(--spacing-2);
}

.lead-actions .btn-primary,
.lead-actions .btn-error {
  flex: 1;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12);
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  margin-top: var(--spacing-8);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-4);
  color: var(--color-gray-400);
}

.empty-state h3 {
  margin-bottom: var(--spacing-2);
  color: var(--color-gray-900);
}

.empty-state p {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-6);
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-area {
    padding: var(--spacing-4);
  }
  
  .leads-grid {
    grid-template-columns: 1fr;
  }
  
  .lead-card {
    padding: var(--spacing-4);
  }
  
  .lead-actions {
    flex-direction: column;
  }
}
</style> 