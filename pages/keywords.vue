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
import { ref, computed, onMounted } from 'vue'

const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const selectedCategory = ref('')

const keywords = ref([
  { id: 1, term: 'Webdesign München', category: 'Webdesign', lead_count: 45, last_search: '2024-01-15', status: 'Aktiv' },
  { id: 2, term: 'Website erstellen', category: 'Webdesign', lead_count: 32, last_search: '2024-01-14', status: 'Aktiv' },
  { id: 3, term: 'Online Marketing', category: 'Marketing', lead_count: 28, last_search: '2024-01-13', status: 'Aktiv' },
  { id: 4, term: 'SEO Agentur', category: 'Marketing', lead_count: 67, last_search: '2024-01-12', status: 'Aktiv' },
  { id: 5, term: 'Zahnarzt München', category: 'Gesundheit', lead_count: 23, last_search: '2024-01-11', status: 'Pausiert' },
  { id: 6, term: 'Anwalt München', category: 'Recht', lead_count: 19, last_search: '2024-01-10', status: 'Aktiv' }
])

const totalKeywords = computed(() => keywords.value.length)
const totalLeads = computed(() => keywords.value.reduce((sum, k) => sum + (k.lead_count || 0), 0))
const avgLeadsPerKeyword = computed(() => totalKeywords.value > 0 ? Math.round(totalLeads.value / totalKeywords.value) : 0)
const categories = computed(() => [...new Set(keywords.value.map(k => k.category))])

const filteredKeywords = computed(() => {
  if (!selectedCategory.value) return keywords.value
  return keywords.value.filter(k => k.category === selectedCategory.value)
})

function showFeedback(msg, type = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  setTimeout(() => { feedbackMessage.value = '' }, 3000)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Aktiv': return 'status-active'
    case 'Pausiert': return 'status-paused'
    case 'Archiviert': return 'status-archived'
    default: return 'status-active'
  }
}

const addKeyword = () => {
  showFeedback('Keyword-Funktion wird implementiert...', 'success')
}

const editKeyword = (keyword) => {
  showFeedback(`Keyword "${keyword.term}" bearbeiten...`, 'success')
}

const deleteKeyword = (id) => {
  if (confirm('Keyword wirklich löschen?')) {
    keywords.value = keywords.value.filter(k => k.id !== id)
    showFeedback('Keyword gelöscht!', 'success')
  }
}

const searchWithKeyword = (keyword) => {
  showFeedback(`Recherche mit "${keyword.term}" starten...`, 'success')
}

const exportKeywords = () => {
  showFeedback('Keywords werden exportiert...', 'success')
}

onMounted(() => {
  // Keywords laden
})
</script>

<style scoped>
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

.keywords-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.keywords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.keyword-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.keyword-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.keyword-card h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.keyword-card p {
  margin: 8px 0;
  color: #64748b;
  font-size: 14px;
}

.content-area {
  padding: var(--spacing-8);
}

.keyword-stats {
  margin-bottom: var(--spacing-8);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.section-header h3 {
  margin: 0;
  color: var(--color-gray-900);
}

.keyword-controls {
  display: flex;
  gap: var(--spacing-3);
}

.keywords-section {
  margin-bottom: var(--spacing-8);
}

.keywords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-6);
}

.keyword-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  transition: all 0.2s ease;
}

.keyword-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.keyword-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.keyword-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary-50);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
}

.keyword-info {
  flex: 1;
  min-width: 0;
}

.keyword-term {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.keyword-category {
  display: flex;
  align-items: center;
}

.category-badge {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.keyword-actions {
  display: flex;
  gap: var(--spacing-2);
}

.keyword-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.keyword-stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  margin-bottom: var(--spacing-1);
}

.stat-value {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-900);
}

.status-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.status-badge.status-active {
  background: var(--color-success);
  color: var(--color-white);
}

.status-badge.status-paused {
  background: var(--color-warning);
  color: var(--color-white);
}

.status-badge.status-archived {
  background: var(--color-gray-400);
  color: var(--color-white);
}

.keyword-actions-bottom {
  display: flex;
  justify-content: center;
}

.btn-sm {
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
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }
  
  .keyword-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .keywords-grid {
    grid-template-columns: 1fr;
  }
  
  .keyword-stats {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }
  
  .keyword-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
  
  .keyword-actions {
    align-self: flex-end;
  }
}
</style> 