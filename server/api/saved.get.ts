import db from '../utils/database.js';

export default defineEventHandler(async (event) => {
  try {
    // Alle gespeicherten Suchen mit Ergebnisanzahl abrufen
    const searchesStmt = db.prepare(`
      SELECT 
        s.id,
        s.query,
        s.location,
        s.created_at,
        COUNT(r.id) as results_count
      FROM searches s
      LEFT JOIN results r ON s.id = r.search_id
      WHERE s.workspace_id = 1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    const searches = searchesStmt.all();

    return {
      success: true,
      searches: searches
    };

  } catch (error) {
    console.error('Fehler beim Abrufen der gespeicherten Suchen:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Abrufen der Daten'
    });
  }
}); 