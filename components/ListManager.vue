<template>
  <div class="list-manager">
    <!-- Listen-Header -->
    <div class="list-header">
      <h3>Listen verwalten</h3>
      <button @click="showCreateModal = true" class="btn-primary btn-sm">
        <span class="material-icons">add</span>
        Neue Liste
      </button>
    </div>
    
    <!-- Listen-Liste -->
    <div class="lists-container">
      <div v-for="list in lists" :key="list.id" class="list-item">
        <div class="list-info">
          <div class="list-color" :style="{ backgroundColor: list.color }"></div>
          <div class="list-details">
            <h4 class="list-name">{{ list.name }}</h4>
            <p class="list-description">{{ list.description || 'Keine Beschreibung' }}</p>
            <span class="list-count">{{ getListCount(list.id) }} Leads</span>
          </div>
        </div>
        <div class="list-actions">
          <button @click="editList(list)" class="btn-secondary btn-sm">
            <span class="material-icons">edit</span>
          </button>
          <button 
            v-if="!list.is_default" 
            @click="deleteList(list.id)" 
            class="btn-error btn-sm"
          >
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
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
              <label for="list-color">Farbe</label>
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
  selectedLeads: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['list-created', 'list-updated'])

const lists = ref([])
const showCreateModal = ref(false)
const isCreating = ref(false)
const newList = ref({
  name: '',
  description: '',
  color: '#3B82F6'
})

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
]

const loadLists = async () => {
  try {
    const response = await $fetch('/api/lists')
    if (response.success) {
      lists.value = response.data
    }
  } catch (error) {
    console.error('Fehler beim Laden der Listen:', error)
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
      newList.value = { name: '', description: '', color: '#3B82F6' }
      await loadLists()
      emit('list-created', response.data)
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der Liste:', error)
  } finally {
    isCreating.value = false
  }
}

const editList = (list) => {
  // TODO: Implementiere Listen-Bearbeitung
  console.log('Bearbeite Liste:', list)
}

const deleteList = async (listId) => {
  if (!confirm('Liste wirklich löschen? Alle Lead-Zuordnungen werden entfernt.')) return
  
  try {
    // TODO: Implementiere Listen-Löschung
    console.log('Lösche Liste:', listId)
  } catch (error) {
    console.error('Fehler beim Löschen der Liste:', error)
  }
}

const getListCount = (listId) => {
  // TODO: Implementiere Lead-Zählung pro Liste
  return 0
}

onMounted(() => {
  loadLists()
})
</script>

<style scoped>
.list-manager {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  border: 1px solid var(--color-gray-200);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.list-header h3 {
  margin: 0;
  color: var(--color-gray-900);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.lists-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.list-item:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
}

.list-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex: 1;
}

.list-color {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.list-details {
  flex: 1;
}

.list-name {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-gray-900);
}

.list-description {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.list-count {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  font-weight: 500;
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
</style> 