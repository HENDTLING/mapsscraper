<template>
  <div class="list-selector">
    <div class="selector-header">
      <h4>Zu Liste hinzufügen</h4>
      <button @click="showCreateModal = true" class="btn-secondary btn-sm">
        <span class="material-icons">add</span>
        Neue Liste
      </button>
    </div>
    
    <div class="lists-grid">
      <div 
        v-for="list in lists" 
        :key="list.id"
        class="list-option"
        :class="{ active: selectedLists.includes(list.id) }"
        @click="toggleList(list.id)"
      >
        <div class="list-icon" :style="{ backgroundColor: list.color }">
          <span class="material-icons">{{ list.icon }}</span>
        </div>
        <div class="list-info">
          <span class="list-name">{{ list.name }}</span>
          <span class="list-count">{{ list.lead_count || 0 }} Leads</span>
        </div>
        <div class="list-checkbox">
          <span v-if="selectedLists.includes(list.id)" class="material-icons">check</span>
        </div>
      </div>
    </div>
    
    <div class="selector-actions">
      <button @click="addToSelectedLists" class="btn-primary" :disabled="selectedLists.length === 0">
        <span class="material-icons">add</span>
        Zu {{ selectedLists.length }} Liste{{ selectedLists.length !== 1 ? 'n' : '' }} hinzufügen
      </button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { $fetch } from 'ofetch'

const props = defineProps({
  leadIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['lists-updated'])

const lists = ref([])
const selectedLists = ref([])
const showCreateModal = ref(false)
const isCreating = ref(false)
const newList = ref({
  name: '',
  description: '',
  icon: 'list',
  color: '#3B82F6'
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

const toggleList = (listId) => {
  const index = selectedLists.value.indexOf(listId)
  if (index > -1) {
    selectedLists.value.splice(index, 1)
  } else {
    selectedLists.value.push(listId)
  }
}

const addToSelectedLists = async () => {
  if (selectedLists.value.length === 0) return
  
  try {
    for (const listId of selectedLists.value) {
      for (const leadId of props.leadIds) {
        await $fetch('/api/leads/add-to-list', {
          method: 'POST',
          body: {
            lead_id: leadId,
            list_id: listId
          }
        })
      }
    }
    
    selectedLists.value = []
    emit('lists-updated')
  } catch (error) {
    console.error('Fehler beim Hinzufügen zu Listen:', error)
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
      // Automatisch zur neuen Liste hinzufügen
      selectedLists.value = [response.data.id]
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der Liste:', error)
  } finally {
    isCreating.value = false
  }
}

onMounted(() => {
  loadLists()
})
</script>

<style scoped>
.list-selector {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  border: 1px solid var(--color-gray-200);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.selector-header h4 {
  margin: 0;
  color: var(--color-gray-900);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-6);
}

.list-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-white);
}

.list-option:hover {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
}

.list-option.active {
  border-color: var(--color-primary-500);
  background: var(--color-primary-100);
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
}

.list-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.list-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-900);
}

.list-count {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.list-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-500);
  color: var(--color-white);
  font-size: var(--font-size-xs);
}

.selector-actions {
  display: flex;
  justify-content: center;
}

.btn-sm {
  padding: var(--spacing-2);
  font-size: var(--font-size-sm);
  min-width: auto;
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
  max-width: 600px;
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

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 