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
                  <div class="stat-change" :class="growth >= 0 ? 'positive' : 'negative'">
                    {{ growth >= 0 ? '+' : '' }}{{ growth }}% vs. letzter Monat
                  </div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">track_changes</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ conversionRate }}</div>
                  <div class="stat-label">Conversion Rate</div>
                  <div class="stat-change positive">+5% vs. letzter Monat</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">euro</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ totalRevenue }}</div>
                  <div class="stat-label">Gesamtumsatz</div>
                  <div class="stat-change positive">+18% vs. letzter Monat</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">schedule</span>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ avgResponseTime }}</div>
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
              <div v-if="chartData.length === 0" class="chart-empty">
                <div class="chart-icon">
                  <span class="material-icons">bar_chart</span>
                </div>
                <h4>Keine Daten verfügbar</h4>
                <p>Für den ausgewählten Zeitraum sind noch keine Daten vorhanden.</p>
              </div>
              <div v-else class="chart-content">
                <div class="chart-bars">
                  <div class="chart-bar" v-for="(value, index) in chartData" :key="index">
                    <div class="bar-fill" :style="{ height: value + '%' }"></div>
                    <span class="bar-label">{{ getMonthLabel(index) }}</span>
                    <span class="bar-value">{{ value }}</span>
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
import { ref, onMounted, computed, watch } from 'vue'
import { $fetch } from 'ofetch'

const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const selectedPeriod = ref('month')
const chartMetric = ref('leads')

// Real data from API
const analyticsData = ref({
  totalLeads: 0,
  conversionRate: 0,
  totalRevenue: 0,
  avgResponseTime: 0,
  pipelineStages: [],
  leadSources: [],
  chartData: [],
  topSources: [],
  topConversions: [],
  growth: 0
})

const timePeriods = [
  { label: '7 Tage', value: 'week' },
  { label: '30 Tage', value: 'month' },
  { label: '90 Tage', value: 'quarter' },
  { label: '1 Jahr', value: 'year' }
]

// Computed properties for real data
const totalLeads = computed(() => analyticsData.value.totalLeads || '-')
const conversionRate = computed(() => analyticsData.value.conversionRate ? `${analyticsData.value.conversionRate}%` : '-')
const totalRevenue = computed(() => analyticsData.value.totalRevenue ? `€${analyticsData.value.totalRevenue.toLocaleString()}` : '-')
const avgResponseTime = computed(() => analyticsData.value.avgResponseTime ? `${analyticsData.value.avgResponseTime}h` : '-')
const pipelineStages = computed(() => analyticsData.value.pipelineStages || [])
const leadSources = computed(() => analyticsData.value.leadSources || [])
const chartData = computed(() => analyticsData.value.chartData || [])
const topSources = computed(() => analyticsData.value.topSources || [])
const topConversions = computed(() => analyticsData.value.topConversions || [])
const growth = computed(() => analyticsData.value.growth || 0)

function showFeedback(msg, type = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  setTimeout(() => { feedbackMessage.value = '' }, 3000)
}

const getMonthLabel = (index) => {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  return months[index]
}

const loadAnalyticsData = async () => {
  isLoading.value = true
  try {
    // Load analytics data from API
    const response = await $fetch('/api/analytics', {
      params: { period: selectedPeriod.value }
    })
    
    if (response.success) {
      analyticsData.value = response.data
      showFeedback('Analytics-Daten geladen!', 'success')
    } else {
      showFeedback('Fehler beim Laden der Analytics-Daten', 'error')
    }
  } catch (error) {
    console.error('Fehler beim Laden der Analytics-Daten:', error)
    showFeedback('Fehler beim Laden der Analytics-Daten', 'error')
    
    // Fallback to empty data structure
    analyticsData.value = {
      totalLeads: 0,
      conversionRate: 0,
      totalRevenue: 0,
      avgResponseTime: 0,
      pipelineStages: [],
      leadSources: [],
      chartData: [],
      topSources: [],
      topConversions: [],
      growth: 0
    }
  } finally {
    isLoading.value = false
  }
}

const exportReport = async () => {
  try {
    const response = await $fetch('/api/analytics/export', {
      params: { period: selectedPeriod.value, format: 'pdf' }
    })
    
    if (response.success) {
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${selectedPeriod.value}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      showFeedback('Bericht exportiert!', 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Exportieren des Berichts', 'error')
  }
}

// Watch for period changes
watch(selectedPeriod, () => {
  loadAnalyticsData()
})

onMounted(() => {
  loadAnalyticsData()
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