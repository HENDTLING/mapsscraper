import { defineEventHandler, createError } from 'h3'
import db from '../../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const workspaceId = 1 // Default workspace

    // Basis-Statistiken für Dashboard
    const totalLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads WHERE workspace_id = ?
    `).get(workspaceId).count

    const pipelineLeads = db.prepare(`
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE workspace_id = ? AND status IN ('Neu', 'Kontaktiert', 'Qualifiziert', 'Angebot')
    `).get(workspaceId).count

    const highScoreLeads = db.prepare(`
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE workspace_id = ? AND lead_score >= 80
    `).get(workspaceId).count

    const convertedLeads = db.prepare(`
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE workspace_id = ? AND status = 'Geschlossen'
    `).get(workspaceId).count

    return {
      success: true,
      data: {
        totalLeads,
        pipelineLeads,
        highScoreLeads,
        convertedLeads
      }
    }

  } catch (error) {
    console.error('Fehler beim Laden der Lead-Statistiken:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Statistiken'
    })
  }
}) 