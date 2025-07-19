import { defineEventHandler, getQuery, setHeader } from 'h3'
import db from '../../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const format = query.format || 'csv'
    const workspaceId = 1 // Default workspace

    // Alle Leads mit erweiterten Daten laden
    const leads = db.prepare(`
      SELECT 
        name, email, phone, website, address, city, category, 
        score, score_label, note, favorite, status,
        lead_score, urgency_level, estimated_budget, business_size, 
        business_category, technology_stack, page_speed_score, 
        mobile_friendly, has_contact_form, social_media_presence, 
        business_status, price_level, opening_hours, review_count, 
        rating, created_at, updated_at
      FROM leads 
      WHERE workspace_id = ?
      ORDER BY lead_score DESC, created_at DESC
    `).all(workspaceId)

    if (format === 'csv') {
      // CSV für Brevo-Integration
      const headers = [
        'Name', 'Email', 'Telefon', 'Website', 'Adresse', 'Stadt', 'Kategorie',
        'Lead Score', 'Dringlichkeit', 'Geschätztes Budget', 'Business Größe',
        'Business Kategorie', 'Technologie Stack', 'PageSpeed Score',
        'Mobile Friendly', 'Kontaktformular', 'Social Media',
        'Business Status', 'Bewertung', 'Anzahl Bewertungen',
        'Notizen', 'Status', 'Erstellt am', 'Aktualisiert am'
      ]

      const csvRows = leads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.website || '',
        lead.address || '',
        lead.city || '',
        lead.category || '',
        lead.lead_score || 0,
        lead.urgency_level || 'Niedrig',
        lead.estimated_budget || 'Unbekannt',
        lead.business_size || 'Unbekannt',
        lead.business_category || 'Sonstige',
        lead.technology_stack || 'Unbekannt',
        lead.page_speed_score || 0,
        lead.mobile_friendly ? 'Ja' : 'Nein',
        lead.has_contact_form ? 'Ja' : 'Nein',
        lead.social_media_presence ? 'Ja' : 'Nein',
        lead.business_status || 'Unbekannt',
        lead.rating || 0,
        lead.review_count || 0,
        lead.note || '',
        lead.status || 'neu',
        lead.created_at || '',
        lead.updated_at || ''
      ])

      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      return {
        success: true,
        data: csvContent,
        filename: `leads_export_${new Date().toISOString().split('T')[0]}.csv`,
        contentType: 'text/csv'
      }
    }

    if (format === 'json') {
      // JSON Export mit erweiterten Metadaten
      return {
        success: true,
        data: {
          exportDate: new Date().toISOString(),
          totalLeads: leads.length,
          workspaceId,
          leads: leads.map(lead => ({
            ...lead,
            // Zusätzliche berechnete Felder
            priority: lead.lead_score >= 80 ? 'Hoch' : lead.lead_score >= 60 ? 'Mittel' : 'Niedrig',
            needsWebsite: (lead.page_speed_score || 0) < 50,
            needsMobile: !lead.mobile_friendly,
            needsContactForm: !lead.has_contact_form,
            potentialValue: lead.estimated_budget || 'Unbekannt'
          }))
        }
      }
    }

    if (format === 'excel') {
      // Excel-kompatibles Format
      const excelData = leads.map(lead => ({
        'Name': lead.name || '',
        'Email': lead.email || '',
        'Telefon': lead.phone || '',
        'Website': lead.website || '',
        'Adresse': lead.address || '',
        'Stadt': lead.city || '',
        'Kategorie': lead.category || '',
        'Lead Score': lead.lead_score || 0,
        'Dringlichkeit': lead.urgency_level || 'Niedrig',
        'Geschätztes Budget': lead.estimated_budget || 'Unbekannt',
        'Business Größe': lead.business_size || 'Unbekannt',
        'Business Kategorie': lead.business_category || 'Sonstige',
        'Technologie': lead.technology_stack || 'Unbekannt',
        'PageSpeed Score': lead.page_speed_score || 0,
        'Mobile Friendly': lead.mobile_friendly ? 'Ja' : 'Nein',
        'Kontaktformular': lead.has_contact_form ? 'Ja' : 'Nein',
        'Social Media': lead.social_media_presence ? 'Ja' : 'Nein',
        'Business Status': lead.business_status || 'Unbekannt',
        'Bewertung': lead.rating || 0,
        'Anzahl Bewertungen': lead.review_count || 0,
        'Notizen': lead.note || '',
        'Status': lead.status || 'neu',
        'Erstellt am': lead.created_at || '',
        'Aktualisiert am': lead.updated_at || ''
      }))

      return {
        success: true,
        data: excelData,
        filename: `leads_export_${new Date().toISOString().split('T')[0]}.json`,
        contentType: 'application/json'
      }
    }

    throw createError({
      statusCode: 400,
      statusMessage: 'Unbekanntes Export-Format'
    })

  } catch (error) {
    console.error('Fehler beim Export der Leads:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Export'
    })
  }
}) 