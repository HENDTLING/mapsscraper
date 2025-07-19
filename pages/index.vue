<template>
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
          <h2>Dashboard</h2>
          <p class="breadcrumb">Übersicht über deine Leads</p>
        </div>
      </header>

      <!-- Content Area -->
      <div class="content-area">
        <!-- Stats -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-icons">group</span>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalLeads || 0 }}</div>
                <div class="stat-label">Gesamt Leads</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-icons">autorenew</span>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.pipelineLeads || 0 }}</div>
                <div class="stat-label">In Pipeline</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-icons">star</span>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.highScoreLeads || 0 }}</div>
                <div class="stat-label">High Score</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-icons">check_circle</span>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.convertedLeads || 0 }}</div>
                <div class="stat-label">Konvertiert</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="actions-section">
          <div class="section-header">
            <h3>Schnellaktionen</h3>
            <p class="text-gray-600">Häufig genutzte Funktionen</p>
          </div>
          
          <div class="actions-grid">
            <NuxtLink to="/research" class="action-card">
              <div class="action-icon">
                <span class="material-icons">search</span>
              </div>
              <div class="action-content">
                <h4>Neue Leads suchen</h4>
                <p>Google Maps durchsuchen</p>
              </div>
            </NuxtLink>

            <NuxtLink to="/leads" class="action-card">
              <div class="action-icon">
                <span class="material-icons">group</span>
              </div>
              <div class="action-content">
                <h4>Kontakte verwalten</h4>
                <p>Leads einsehen und bearbeiten</p>
              </div>
            </NuxtLink>

            <NuxtLink to="/pipeline" class="action-card">
              <div class="action-icon">
                <span class="material-icons">autorenew</span>
              </div>
              <div class="action-content">
                <h4>Pipeline verwalten</h4>
                <p>Lead-Status organisieren</p>
              </div>
            </NuxtLink>

            <NuxtLink to="/analytics" class="action-card">
              <div class="action-icon">
                <span class="material-icons">bar_chart</span>
              </div>
              <div class="action-content">
                <h4>Analytics anzeigen</h4>
                <p>Statistiken und Trends</p>
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  totalLeads: 0,
  pipelineLeads: 0,
  highScoreLeads: 0,
  convertedLeads: 0
})

const loadStats = async () => {
  try {
    const response = await $fetch('/api/leads/stats')
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Fehler beim Laden der Statistiken:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 20px;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #34495e;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 5px 0;
  color: #3498db;
}

.tagline {
  font-size: 14px;
  color: #bdc3c7;
  margin: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-radius: 6px;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #34495e;
  color: white;
}

.nav-item.active {
  background: #3498db;
  color: white;
}

.nav-icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 30px;
  background: #f5f5f5;
}

.top-header {
  background: white;
  padding: 25px 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-left h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.breadcrumb {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 24px;
  width: 50px;
  height: 50px;
  background: #ecf0f1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.actions-section {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-header h3 {
  margin: 0 0 25px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.text-gray-600 {
  color: #7f8c8d;
  font-size: 14px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 25px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-card:hover {
  background: #e9ecef;
  border-color: #3498db;
  color: inherit;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.action-icon {
  font-size: 20px;
  width: 45px;
  height: 45px;
  background: #3498db;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.action-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 20px;
  }
  
  .sidebar {
    transform: translateX(-100%);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .action-card {
    padding: 20px;
  }
}
</style> 