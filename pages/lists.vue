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
            <h2>Listen verwalten</h2>
            <p class="breadcrumb">Organisiere deine Leads in Listen</p>
          </div>
          <div class="header-right">
            <button @click="showCreateModal = true" class="btn-primary">
              <span class="material-icons">add</span>
              Neue Liste
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Listen Grid -->
          <div class="lists-grid">
            <div v-for="list in lists" :key="list.id" class="list-card">
              <div class="list-header">
                <div class="list-icon" :style="{ backgroundColor: list.color }">
              <span class="material-icons">{{ list.icon }}</span>
            </div>
                <div class="list-info">
                  <h3 class="list-name">{{ list.name }}</h3>
                  <p class="list-description">{{ list.description || 'Keine Beschreibung' }}</p>
                </div>
                <div class="list-actions">
                  <button @click="editList(list)" class="btn-secondary btn-sm">
                    <span class="material-icons">edit</span>
                  </button>
                  <button 
                    v-if="!list.is_default" 
                    @click="deleteList(list)" 
                    class="btn-error btn-sm"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
              
              <div class="list-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ getListCount(list.id) }}</span>
                  <span class="stat-label">Leads</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ getListValue(list.id) }}</span>
                  <span class="stat-label">Wert</span>
                </div>
              </div>
              
              <div class="list-actions-bottom">
                <button @click="viewListLeads(list)" class="btn-primary">
                  <span class="material-icons">visibility</span>
                  Leads anzeigen ({{ getListCount(list.id) }})
                </button>
                <button @click="exportList(list)" class="btn-secondary">
                  <span class="material-icons">download</span>
                  Export
                </button>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="lists.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">
              <span class="material-icons">list</span>
            </div>
            <h3>Keine Listen vorhanden</h3>
            <p>Erstelle deine erste Liste, um Leads zu organisieren.</p>
            <button @click="showCreateModal = true" class="btn-primary">
              <span class="material-icons">add</span>
              Erste Liste erstellen
            </button>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Neue Liste Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Neue Liste erstellen</h3>
          <button @click="showCreateModal = false" class="close-btn">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="createList" class="list-form">
            <div class="form-group">
              <label for="list-name">Listenname *</label>
              <input 
                id="list-name"
                v-model="newList.name" 
                type="text" 
                required
                placeholder="z.B. Heiße Leads"
              />
            </div>
            
            <div class="form-group">
              <label for="list-description">Beschreibung</label>
              <textarea 
                id="list-description"
                v-model="newList.description" 
                rows="3"
                placeholder="Beschreibung der Liste..."
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Icon auswählen</label>
              <div class="icon-picker">
                <div 
                  v-for="icon in iconOptions" 
                  :key="icon"
                  class="icon-option"
                  :class="{ active: newList.icon === icon }"
                  @click="newList.icon = icon"
                >
                  <span class="material-icons">{{ icon }}</span>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Farbe auswählen</label>
              <div class="color-picker">
                <div 
                  v-for="color in colorOptions" 
                  :key="color"
                  class="color-option"
                  :class="{ active: newList.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="newList.color = color"
                ></div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="showCreateModal = false" class="btn-secondary">
                Abbrechen
              </button>
              <button type="submit" class="btn-primary" :disabled="isCreating">
                <span v-if="isCreating" class="material-icons loading-spinner">hourglass_empty</span>
                <span v-else class="material-icons">save</span>
                {{ isCreating ? 'Erstellen...' : 'Erstellen' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Liste bearbeiten Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Liste bearbeiten</h3>
          <button @click="showEditModal = false" class="close-btn">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="updateList" class="list-form">
            <div class="form-group">
              <label for="edit-list-name">Listenname *</label>
              <input 
                id="edit-list-name"
                v-model="editingList.name" 
                type="text" 
                required
                placeholder="z.B. Heiße Leads"
              />
            </div>
            
            <div class="form-group">
              <label for="edit-list-description">Beschreibung</label>
              <textarea 
                id="edit-list-description"
                v-model="editingList.description" 
                rows="3"
                placeholder="Beschreibung der Liste..."
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Icon auswählen</label>
              <div class="icon-picker">
                <div 
                  v-for="icon in iconOptions" 
                  :key="icon"
                  class="icon-option"
                  :class="{ active: editingList.icon === icon }"
                  @click="editingList.icon = icon"
                >
                  <span class="material-icons">{{ icon }}</span>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Farbe auswählen</label>
              <div class="color-picker">
                <div 
                  v-for="color in colorOptions" 
                  :key="color"
                  class="color-option"
                  :class="{ active: editingList.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="editingList.color = color"
                ></div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="showEditModal = false" class="btn-secondary">
                Abbrechen
              </button>
              <button type="submit" class="btn-primary" :disabled="isUpdating">
                <span v-if="isUpdating" class="material-icons loading-spinner">hourglass_empty</span>
                <span v-else class="material-icons">save</span>
                {{ isUpdating ? 'Speichern...' : 'Speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Liste löschen Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Liste löschen</h3>
          <button @click="showDeleteModal = false" class="close-btn">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="delete-warning">
            <div class="warning-icon">
              <span class="material-icons">warning</span>
            </div>
            <h4>Liste wirklich löschen?</h4>
            <p>Die Liste <strong>"{{ deletingList.name }}"</strong> wird unwiderruflich gelöscht.</p>
            <p class="warning-text">Alle Lead-Zuordnungen zu dieser Liste werden ebenfalls entfernt.</p>
          </div>
          
          <div class="form-actions">
            <button @click="showDeleteModal = false" class="btn-secondary">
              Abbrechen
            </button>
            <button @click="confirmDeleteList" class="btn-error" :disabled="isDeleting">
              <span v-if="isDeleting" class="material-icons loading-spinner">hourglass_empty</span>
              <span v-else class="material-icons">delete</span>
              {{ isDeleting ? 'Löschen...' : 'Endgültig löschen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { $fetch } from 'ofetch'

const lists = ref([])
const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('success')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const newList = ref({
  name: '',
  description: '',
  icon: 'list',
  color: '#3B82F6'
})
const editingList = ref({
  id: '',
  name: '',
  description: '',
  icon: 'list',
  color: '#3B82F6'
})
const deletingList = ref({
  id: '',
  name: ''
})

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
]

const iconOptions = [
  'list', 'local_fire_department', 'search', 'recommend', 'schedule',
  'verified', 'thumb_up', 'star', 'favorite', 'trending_up',
  'business', 'group', 'person', 'phone', 'email',
  'location_on', 'web', 'attach_money', 'work', 'school',
  'home', 'shopping_cart', 'event', 'notifications', 'settings'
]

function showFeedback(msg, type = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  setTimeout(() => { feedbackMessage.value = '' }, 3000)
}

const loadLists = async () => {
  isLoading.value = true
  try {
    const response = await $fetch('/api/lists/stats')
    if (response.success) {
      lists.value = response.data
      showFeedback(`${lists.value.length} Listen geladen!`, 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Laden der Listen!', 'error')
    console.error('Fehler beim Laden der Listen:', error)
  } finally {
    isLoading.value = false
  }
}

const createList = async () => {
  if (!newList.value.name.trim()) return
  
  isCreating.value = true
  try {
    const response = await $fetch('/api/lists', {
      method: 'POST',
      body: newList.value
    })
    
    if (response.success) {
      showCreateModal.value = false
      newList.value = { name: '', description: '', icon: 'list', color: '#3B82F6' }
      await loadLists()
      showFeedback('Liste erfolgreich erstellt!', 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Erstellen der Liste!', 'error')
    console.error('Fehler beim Erstellen der Liste:', error)
  } finally {
    isCreating.value = false
  }
}

const updateList = async () => {
  if (!editingList.value.name.trim()) return
  
  isUpdating.value = true
  try {
    const response = await $fetch(`/api/lists/${editingList.value.id}`, {
      method: 'PUT',
      body: {
        name: editingList.value.name,
        description: editingList.value.description,
        icon: editingList.value.icon,
        color: editingList.value.color
      }
    })
    
    if (response.success) {
      showEditModal.value = false
      editingList.value = { id: '', name: '', description: '', icon: 'list', color: '#3B82F6' }
      await loadLists()
      showFeedback('Liste erfolgreich aktualisiert!', 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Aktualisieren der Liste!', 'error')
    console.error('Fehler beim Aktualisieren der Liste:', error)
  } finally {
    isUpdating.value = false
  }
}

const editList = (list) => {
  // Kopiere Listendaten für Bearbeitung
  editingList.value = {
    id: list.id,
    name: list.name,
    description: list.description || '',
    icon: list.icon || 'list',
    color: list.color || '#3B82F6'
  }
  showEditModal.value = true
}

const deleteList = (list) => {
  deletingList.value = {
    id: list.id,
    name: list.name
  }
  showDeleteModal.value = true
}

const confirmDeleteList = async () => {
  isDeleting.value = true
  try {
    const response = await $fetch(`/api/lists/${deletingList.value.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      showDeleteModal.value = false
      deletingList.value = { id: '', name: '' }
      await loadLists()
      showFeedback('Liste erfolgreich gelöscht!', 'success')
    }
  } catch (error) {
    showFeedback('Fehler beim Löschen der Liste!', 'error')
    console.error('Fehler beim Löschen der Liste:', error)
  } finally {
    isDeleting.value = false
  }
}

const viewListLeads = (list) => {
  // Navigiere zu Kontakte-Seite mit Listen-Filter
  navigateTo(`/leads?list=${list.id}`)
}

const exportList = (list) => {
  // TODO: Implementiere Listen-Export
  showFeedback('Listen-Export wird implementiert...', 'success')
}

const getListCount = (listId) => {
  const list = lists.value.find(l => l.id === listId)
  return list ? list.lead_count || 0 : 0
}

const getListValue = (listId) => {
  // TODO: Implementiere Listen-Wert basierend auf Lead-Scores
  const count = getListCount(listId)
  return `€${count * 100}` // Platzhalter: 100€ pro Lead
}

onMounted(() => {
  loadLists()
})
</script>

<style scoped>
.content-area {
  padding: var(--spacing-8);
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-6);
}

.list-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  transition: all 0.2s ease;
}

.list-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.list-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.list-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  margin-top: var(--spacing-1);
}

.list-info {
  flex: 1;
}

.list-name {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-gray-900);
}

.list-description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  line-height: 1.4;
}

.list-actions {
  display: flex;
  gap: var(--spacing-2);
}

.btn-sm {
  padding: var(--spacing-2);
  font-size: var(--font-size-sm);
  min-width: auto;
}

.list-stats {
  display: flex;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.stat-number {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-gray-900);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.list-actions-bottom {
  display: flex;
  gap: var(--spacing-3);
}

.list-actions-bottom .btn-primary,
.list-actions-bottom .btn-secondary {
  flex: 1;
  justify-content: center;
}

/* Modal Styles */
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
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-gray-200);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-gray-200);
  background: var(--color-gray-50);
}

.modal-header h3 {
  margin: 0;
  color: var(--color-gray-900);
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--color-gray-500);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.modal-content {
  padding: var(--spacing-6);
}

.list-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-800);
}

.form-group input,
.form-group textarea {
  padding: var(--spacing-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
  background: var(--color-white);
  color: var(--color-gray-900);
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: var(--spacing-2);
  max-height: 200px;
  overflow-y: auto;
  padding: var(--spacing-2);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background: var(--color-gray-50);
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  background: var(--color-white);
  color: var(--color-gray-600);
}

.icon-option:hover {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  transform: scale(1.1);
}

.icon-option.active {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-color: var(--color-primary-500);
  transform: scale(1.1);
}

.color-picker {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--color-gray-900);
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-4);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-gray-200);
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
  justify-content: center;
}

.btn-primary {
  background: var(--color-primary-600);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--color-white);
  color: var(--color-gray-700);
  border: 2px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
  transform: translateY(-1px);
}

.btn-error {
  background: var(--color-error);
  color: var(--color-white);
}

.btn-error:hover {
  background: var(--color-error-dark);
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-16);
  background: var(--color-white);
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-xl);
}

.empty-icon {
  font-size: 64px;
  color: var(--color-gray-400);
  margin-bottom: var(--spacing-6);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--color-gray-900);
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 var(--spacing-6) 0;
  color: var(--color-gray-600);
  font-size: var(--font-size-base);
}

/* Delete Modal Styles */
.delete-modal {
  max-width: 450px;
}

.delete-warning {
  text-align: center;
  padding: var(--spacing-6);
}

.warning-icon {
  font-size: 48px;
  color: var(--color-warning);
  margin-bottom: var(--spacing-4);
}

.delete-warning h4 {
  margin: 0 0 var(--spacing-3) 0;
  color: var(--color-gray-900);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.delete-warning p {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--color-gray-700);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.warning-text {
  color: var(--color-error) !important;
  font-weight: 500;
}

.btn-error {
  background: var(--color-error);
  color: var(--color-white);
  border: none;
  box-shadow: var(--shadow-sm);
}

.btn-error:hover:not(:disabled) {
  background: var(--color-error-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-error:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style> 