<template>
  <div class="list-dropdown">
    <select v-model="selectedList" @change="handleListChange" class="list-select">
      <option value="">Liste auswählen...</option>
      <option v-for="list in lists" :key="list.id" :value="list.id">
        {{ list.name }}
      </option>
    </select>
    
    <button @click="showCreateModal = true" class="btn-secondary btn-sm">
      <span class="material-icons">add</span>
      Neue Liste
    </button>
    
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
  leadId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['list-added'])

const lists = ref([])
const selectedList = ref('')
const showCreateModal = ref(false)
const isCreating = ref(false)
const newList = ref({
  name: '',
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

const handleListChange = async () => {
  if (!selectedList.value) return
  
  try {
    await $fetch('/api/leads/add-to-list', {
      method: 'POST',
      body: {
        lead_id: props.leadId,
        list_id: selectedList.value
      }
    })
    
    selectedList.value = ''
    emit('list-added')
  } catch (error) {
    console.error('Fehler beim Hinzufügen zur Liste:', error)
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
      newList.value = { name: '', icon: 'list', color: '#3B82F6' }
      await loadLists()
      // Automatisch zur neuen Liste hinzufügen
      selectedList.value = response.data.id
      await handleListChange()
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
.list-dropdown {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  background: var(--color-gray-50);
  padding: var(--spacing-2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
}

.list-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-gray-900);
  font-size: var(--font-size-sm);
  cursor: pointer;
  min-width: 140px;
  font-weight: 500;
}

.list-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  min-width: auto;
  border-radius: var(--radius-md);
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-700);
  font-weight: 500;
}

.btn-sm:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
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

.form-group input {
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

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
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