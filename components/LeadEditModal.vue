<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>{{ isNew ? 'Neuer Lead' : 'Lead bearbeiten' }}</h3>
        <button @click="closeModal" class="close-btn">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-content">
        <form @submit.prevent="saveLead" class="lead-form">
          <!-- Grunddaten -->
          <div class="form-section">
            <h4 class="section-title">Grunddaten</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="name">Name *</label>
                <input 
                  id="name"
                  v-model="formData.name" 
                  type="text" 
                  required
                  placeholder="Firmenname oder Kontaktperson"
                />
              </div>
              
              <div class="form-group">
                <label for="email">E-Mail</label>
                <input 
                  id="email"
                  v-model="formData.email" 
                  type="email" 
                  placeholder="kontakt@firma.de"
                />
              </div>
              
              <div class="form-group">
                <label for="phone">Telefon</label>
                <input 
                  id="phone"
                  v-model="formData.phone" 
                  type="tel" 
                  placeholder="+49 30 12345678"
                />
              </div>
              
              <div class="form-group">
                <label for="website">Website</label>
                <input 
                  id="website"
                  v-model="formData.website" 
                  type="url" 
                  placeholder="https://www.firma.de"
                />
              </div>
              
              <div class="form-group">
                <label for="address">Adresse</label>
                <textarea 
                  id="address"
                  v-model="formData.address" 
                  rows="2"
                  placeholder="Straße, PLZ Ort"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label for="business_category">Kategorie</label>
                <input 
                  id="business_category"
                  v-model="formData.business_category" 
                  type="text" 
                  placeholder="z.B. Rechtsanwalt, Restaurant"
                />
              </div>
            </div>
          </div>
          
          <!-- Lead-Management -->
          <div class="form-section">
            <h4 class="section-title">Lead-Management</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" v-model="formData.status">
                  <option value="Neu">Neu</option>
                  <option value="Kontaktiert">Kontaktiert</option>
                  <option value="Qualifiziert">Qualifiziert</option>
                  <option value="Angebot">Angebot</option>
                  <option value="Geschlossen">Geschlossen</option>
                  <option value="Verloren">Verloren</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="lead_score">Lead Score (0-100)</label>
                <input 
                  id="lead_score"
                  v-model.number="formData.lead_score" 
                  type="number" 
                  min="0" 
                  max="100"
                  placeholder="75"
                />
              </div>
              
              <div class="form-group">
                <label for="urgency_level">Dringlichkeit</label>
                <select id="urgency_level" v-model="formData.urgency_level">
                  <option value="Niedrig">Niedrig</option>
                  <option value="Mittel">Mittel</option>
                  <option value="Hoch">Hoch</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="estimated_budget">Geschätztes Budget (€)</label>
                <input 
                  id="estimated_budget"
                  v-model.number="formData.estimated_budget" 
                  type="number" 
                  min="0"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>
          
          <!-- Listen-Zuordnung -->
          <div class="form-section">
            <h4 class="section-title">Listen-Zuordnung</h4>
            <div class="form-group full-width">
              <label>Listen auswählen</label>
              <div class="lists-selection">
                <div v-for="list in availableLists" :key="list.id" class="list-option">
                  <input 
                    :id="`list-${list.id}`"
                    type="checkbox"
                    :value="list.id"
                    v-model="selectedLists"
                    :disabled="list.is_default"
                  />
                  <label :for="`list-${list.id}`" class="list-option-label">
                    <div class="list-option-icon" :style="{ backgroundColor: list.color }">
                      <span class="material-icons">{{ list.icon }}</span>
                    </div>
                    <div class="list-option-info">
                      <span class="list-option-name">{{ list.name }}</span>
                      <span class="list-option-count">{{ list.lead_count || 0 }} Leads</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          

          
          <!-- Notizen -->
          <div class="form-section">
            <h4 class="section-title">Notizen</h4>
            <div class="form-group full-width">
              <label for="notes">Notizen</label>
              <textarea 
                id="notes"
                v-model="formData.notes" 
                rows="4"
                placeholder="Wichtige Informationen, Gesprächsnotizen, nächste Schritte..."
              ></textarea>
            </div>
          </div>
          
          <!-- Aktionen -->
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Abbrechen
            </button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              <span v-if="isSaving" class="material-icons loading-spinner">hourglass_empty</span>
              <span v-else class="material-icons">save</span>
              {{ isSaving ? 'Speichern...' : 'Speichern' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { $fetch } from 'ofetch'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  lead: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const isSaving = ref(false)
const isNew = computed(() => !props.lead?.id)
const availableLists = ref([])
const selectedLists = ref([])

const formData = ref({
  name: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  business_category: '',
  status: 'Neu',
  lead_score: 0,
  urgency_level: 'Niedrig',
  estimated_budget: 0,
  contact_person: '',
  company_size: '',
  industry: '',
  source: 'Google Maps',
  notes: ''
})

// Load available lists
const loadLists = async () => {
  try {
    const response = await $fetch('/api/lists/stats')
    if (response.success) {
      availableLists.value = response.data
    }
  } catch (error) {
    console.error('Fehler beim Laden der Listen:', error)
  }
}

// Load lead lists
const loadLeadLists = async (leadId) => {
  try {
    const response = await $fetch(`/api/leads/${leadId}/lists`)
    if (response.success) {
      selectedLists.value = response.data.map(list => list.id)
    }
  } catch (error) {
    console.error('Fehler beim Laden der Lead-Listen:', error)
    selectedLists.value = []
  }
}

// Formular mit Lead-Daten füllen
watch(() => props.lead, async (newLead) => {
  if (newLead) {
    formData.value = {
      name: newLead.name || '',
      email: newLead.email || '',
      phone: newLead.phone || '',
      website: newLead.website || '',
      address: newLead.address || '',
      business_category: newLead.business_category || '',
      status: newLead.status || 'Neu',
      lead_score: newLead.lead_score || 0,
      urgency_level: newLead.urgency_level || 'Niedrig',
      estimated_budget: newLead.estimated_budget || 0,
      // Temporär auskommentiert bis DB-Migration läuft:
      // contact_person: newLead.contact_person || '',
      // company_size: newLead.company_size || '',
      // industry: newLead.industry || '',
      // source: newLead.source || 'Google Maps',
      notes: newLead.notes || ''
    }
    // Load lead's current lists
    await loadLeadLists(newLead.id)
  } else {
    // Reset form für neuen Lead
    formData.value = {
      name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      business_category: '',
      status: 'Neu',
      lead_score: 0,
      urgency_level: 'Niedrig',
      estimated_budget: 0,
      // Temporär auskommentiert bis DB-Migration läuft:
      // contact_person: '',
      // company_size: '',
      // industry: '',
      // source: 'Google Maps',
      notes: ''
    }
    selectedLists.value = []
  }
}, { immediate: true })

// Load lists on mount
onMounted(() => {
  loadLists()
})

const closeModal = () => {
  emit('close')
}

const saveLead = async () => {
  if (!formData.value.name.trim()) {
    alert('Name ist erforderlich!')
    return
  }
  
  isSaving.value = true
  
  try {
    let response
    let savedLead
    
    if (isNew.value) {
      // Neuer Lead
      response = await $fetch('/api/leads', {
        method: 'POST',
        body: formData.value
      })
      savedLead = response.data
    } else {
      // Lead bearbeiten
      response = await $fetch(`/api/leads/${props.lead.id}`, {
        method: 'PUT',
        body: formData.value
      })
      savedLead = response.data
    }
    
    if (response.success) {
      // Listen-Zuordnungen speichern
      if (savedLead?.id) {
        await saveLeadLists(savedLead.id)
      }
      
      emit('saved', savedLead)
      closeModal()
    } else {
      alert('Fehler beim Speichern: ' + (response.message || 'Unbekannter Fehler'))
    }
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
    alert('Fehler beim Speichern des Leads!')
  } finally {
    isSaving.value = false
  }
}

const saveLeadLists = async (leadId) => {
  try {
    // Alle Listen-Zuordnungen löschen
    await $fetch(`/api/leads/${leadId}/lists`, {
      method: 'DELETE'
    })
    
    // Neue Listen-Zuordnungen erstellen
    for (const listId of selectedLists.value) {
      await $fetch('/api/leads/add-to-list', {
        method: 'POST',
        body: {
          lead_id: leadId,
          list_id: listId
        }
      })
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Listen-Zuordnungen:', error)
  }
}
</script>

<style scoped>
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
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
  padding: var(--spacing-8);
}

.lead-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-10);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  background: var(--color-gray-50);
  padding: var(--spacing-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
  padding: var(--spacing-4) 0;
  border-bottom: 2px solid var(--color-primary-200);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: var(--color-primary-500);
  border-radius: var(--radius-sm);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-1);
}

.form-group input,
.form-group select,
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
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right var(--spacing-3) center;
  background-size: 16px;
  padding-right: calc(var(--spacing-3) * 2 + 16px);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Listen-Auswahl */
.lists-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-3);
  max-height: 300px;
  overflow-y: auto;
  padding: var(--spacing-3);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background: var(--color-white);
}

.list-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background: var(--color-gray-50);
  transition: all 0.2s ease;
  cursor: pointer;
}

.list-option:hover {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
}

.list-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary-600);
}

.list-option input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-option-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  cursor: pointer;
}

.list-option-icon {
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

.list-option-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
}

.list-option-name {
  font-weight: 600;
  color: var(--color-gray-900);
  font-size: var(--font-size-sm);
}

.list-option-count {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-4);
  padding-top: var(--spacing-8);
  margin-top: var(--spacing-6);
  border-top: 2px solid var(--color-gray-200);
  background: var(--color-white);
  padding: var(--spacing-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4) var(--spacing-8);
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