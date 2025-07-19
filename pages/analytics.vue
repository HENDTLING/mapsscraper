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
            <h2>Analytics & Berichte</h2>
            <p class="breadcrumb">Lead-Performance und Conversion-Tracking</p>
          </div>
          <div class="header-right">
            <button @click="exportReport" class="btn-secondary">
              <span class="material-icons">download</span>
              Bericht exportieren
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Key Metrics -->
          <section class="metrics-section">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">bar_chart</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ totalLeads }}</div>
                  <div class="stat-label">Gesamte Leads</div>
                  <div class="stat-change positive">+12% vs. letzter Monat</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">track_changes</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ conversionRate }}%</div>
                  <div class="stat-label">Conversion Rate</div>
                  <div class="stat-change positive">+5% vs. letzter Monat</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">euro</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">€{{ totalRevenue }}</div>
                  <div class="stat-label">Gesamtumsatz</div>
                  <div class="stat-change positive">+18% vs. letzter Monat</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">schedule</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ avgResponseTime }}h</div>
                  <div class="stat-label">Ø Reaktionszeit</div>
                  <div class="stat-change negative">+2h vs. letzter Monat</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Pipeline Overview -->
          <section class="pipeline-section">
            <div class="section-header">
              <h3>Pipeline-Übersicht</h3>
              <div class="time-filter">
                <button 
                  v-for="period in timePeriods" 
                  :key="period.value"
                  @click="selectedPeriod = period.value"
                  class="btn-secondary"
                  :class="{ 'btn-primary': selectedPeriod === period.value }"
                >
                  {{ period.label }}
                </button>
              </div>
            </div>
            
            <div class="pipeline-stats">
              <div class="pipeline-column" v-for="stage in pipelineStages" :key="stage.status">
                <div class="stage-header">
                  <h4>{{ stage.label }}</h4>
                  <span class="stage-count">{{ stage.count }}</span>
                </div>
                <div class="stage-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: stage.percentage + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ stage.percentage }}%</span>
                </div>
                <div class="stage-value">€{{ stage.value }}</div>
              </div>
            </div>
          </section>

          <!-- Lead Sources -->
          <section class="sources-section">
            <div class="section-header">
              <h3>Lead-Quellen</h3>
            </div>
            
            <div class="sources-grid">
              <div class="source-card" v-for="source in leadSources" :key="source.name">
                <div class="source-header">
                  <div class="source-icon">
                    <span class="material-icons">{{ source.icon }}</span>
                  </div>
                  <div class="source-info">
                    <h4>{{ source.name }}</h4>
                    <p>{{ source.description }}</p>
                  </div>
                </div>
                <div class="source-stats">
                  <div class="source-stat">
                    <span class="stat-label">Leads</span>
                    <span class="stat-value">{{ source.leads }}</span>
                  </div>
                  <div class="source-stat">
                    <span class="stat-label">Conversion</span>
                    <span class="stat-value">{{ source.conversion }}%</span>
                  </div>
                  <div class="source-stat">
                    <span class="stat-label">Umsatz</span>
                    <span class="stat-value">€{{ source.revenue }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Performance Chart -->
          <section class="chart-section">
            <div class="section-header">
              <h3>Lead-Performance über Zeit</h3>
              <div class="chart-controls">
                <select v-model="chartMetric" class="select">
                  <option value="leads">Leads</option>
                  <option value="conversions">Conversions</option>
                  <option value="revenue">Umsatz</option>
                </select>
              </div>
            </div>
            
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="chart-icon">
                  <span class="material-icons">bar_chart</span>
                </div>
                <h4>Performance Chart</h4>
                <p>Hier würde ein echtes Chart mit Chart.js oder D3.js angezeigt</p>
                <div class="chart-mock">
                  <div class="chart-bar" v-for="(value, index) in chartData" :key="index">
                    <div class="bar-fill" :style="{ height: value + '%' }"></div>
                    <span class="bar-label">{{ getMonthLabel(index) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Top Performers -->
          <section class="performers-section">
            <div class="section-header">
              <h3>Top-Performer</h3>
            </div>
            
            <div class="performers-grid">
              <div class="performer-card">
                <h4>Beste Lead-Quellen</h4>
                <div class="performer-list">
                  <div class="performer-item" v-for="(source, index) in topSources" :key="source.name">
                    <span class="performer-rank">{{ index + 1 }}</span>
                    <div class="performer-info">
                      <span class="performer-name">{{ source.name }}</span>
                      <span class="performer-value">{{ source.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="performer-card">
                <h4>Höchste Conversion-Raten</h4>
                <div class="performer-list">
                  <div class="performer-item" v-for="(conversion, index) in topConversions" :key="conversion.name">
                    <span class="performer-rank">{{ index + 1 }}</span>
                    <div class="performer-info">
                      <span class="performer-name">{{ conversion.name }}</span>
                      <span class="performer-value">{{ conversion.rate }}%</span>
                    </div>
                  </div>
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
import { ref, onMounted } from 'vue'
import { $fetch } from 'ofetch'

const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const selectedPeriod = ref('month')
const chartMetric = ref('leads')

// Mock data
const totalLeads = ref(1247)
const conversionRate = ref(23.5)
const totalRevenue = ref(45600)
const avgResponseTime = ref(4.2)

const timePeriods = [
  { label: '7 Tage', value: 'week' },
  { label: '30 Tage', value: 'month' },
  { label: '90 Tage', value: 'quarter' },
  { label: '1 Jahr', value: 'year' }
]

const pipelineStages = ref([
  { status: 'new', label: 'Neu', count: 45, percentage: 35, value: 12500 },
  { status: 'contacted', label: 'Kontaktiert', count: 32, percentage: 25, value: 8900 },
  { status: 'qualified', label: 'Qualifiziert', count: 28, percentage: 22, value: 7800 },
  { status: 'proposal', label: 'Angebot', count: 15, percentage: 12, value: 4200 },
  { status: 'closed', label: 'Geschlossen', count: 8, percentage: 6, value: 2200 }
])

const leadSources = ref([
  { name: 'Google Maps', icon: 'location_on', description: 'Direkte Suche', leads: 456, conversion: 28, revenue: 15600 },
  { name: 'Keyword Research', icon: 'search', description: 'SEO-basiert', leads: 234, conversion: 32, revenue: 8900 },
  { name: 'Referrals', icon: 'people', description: 'Empfehlungen', leads: 89, conversion: 45, revenue: 4200 },
  { name: 'Social Media', icon: 'share', description: 'LinkedIn & Co.', leads: 67, conversion: 18, revenue: 2100 }
])

const chartData = ref([65, 72, 68, 85, 78, 92, 88, 76, 84, 91, 87, 95])

const topSources = ref([
  { name: 'Google Maps', value: '456 Leads' },
  { name: 'Keyword Research', value: '234 Leads' },
  { name: 'Referrals', value: '89 Leads' },
  { name: 'Social Media', value: '67 Leads' }
])

const topConversions = ref([
  { name: 'Referrals', rate: 45 },
  { name: 'Keyword Research', rate: 32 },
  { name: 'Google Maps', rate: 28 },
  { name: 'Social Media', rate: 18 }
])

function showFeedback(msg, type = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  setTimeout(() => { feedbackMessage.value = '' }, 3000)
}

const getMonthLabel = (index) => {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  return months[index]
}

const exportReport = () => {
  showFeedback('Bericht wird exportiert...', 'success')
}

onMounted(() => {
  // Load analytics data
})
</script>

<style scoped>
.content-area {
  padding: var(--spacing-8);
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

.time-filter {
  display: flex;
  gap: var(--spacing-2);
}

.time-filter .btn-secondary {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
}

.metrics-section {
  margin-bottom: var(--spacing-8);
}

.stat-change {
  font-size: var(--font-size-xs);
  font-weight: 500;
  margin-top: var(--spacing-1);
}

.stat-change.positive {
  color: var(--color-success);
}

.stat-change.negative {
  color: var(--color-error);
}

.pipeline-section {
  margin-bottom: var(--spacing-8);
}

.pipeline-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-6);
}

.pipeline-column {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.stage-header h4 {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-900);
}

.stage-count {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.stage-progress {
  margin-bottom: var(--spacing-3);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-2);
}

.progress-fill {
  height: 100%;
  background: var(--color-primary-500);
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
}

.stage-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-gray-900);
}

.sources-section {
  margin-bottom: var(--spacing-8);
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

.source-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  transition: all 0.2s ease;
}

.source-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.source-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.source-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary-50);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
}

.source-info h4 {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-gray-900);
}

.source-info p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.source-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
}

.source-stat {
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
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-gray-900);
}

.chart-section {
  margin-bottom: var(--spacing-8);
}

.chart-container {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
}

.chart-placeholder {
  text-align: center;
  padding: var(--spacing-8);
}

.chart-icon {
  font-size: 3rem;
  color: var(--color-gray-400);
  margin-bottom: var(--spacing-4);
}

.chart-placeholder h4 {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--color-gray-900);
}

.chart-placeholder p {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-6);
}

.chart-mock {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: var(--spacing-2);
  height: 200px;
  margin-top: var(--spacing-6);
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
}

.bar-fill {
  width: 30px;
  background: var(--color-primary-500);
  border-radius: var(--radius-sm);
  transition: height 0.3s ease;
}

.bar-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
}

.performers-section {
  margin-bottom: var(--spacing-8);
}

.performers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

.performer-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
}

.performer-card h4 {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-gray-900);
}

.performer-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.performer-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
}

.performer-rank {
  width: 24px;
  height: 24px;
  background: var(--color-primary-500);
  color: var(--color-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.performer-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.performer-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-900);
}

.performer-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary-600);
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
  
  .time-filter {
    width: 100%;
    justify-content: space-between;
  }
  
  .pipeline-stats {
    grid-template-columns: 1fr;
  }
  
  .sources-grid,
  .performers-grid {
    grid-template-columns: 1fr;
  }
  
  .source-stats {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }
}
</style> 