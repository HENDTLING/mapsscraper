import db from '../utils/database.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { query, location, results } = body;

    // Suche in Datenbank speichern
    const searchStmt = db.prepare(`
      INSERT INTO searches (workspace_id, query, location) 
      VALUES (?, ?, ?)
    `);
    
    const searchResult = searchStmt.run(1, query, location);
    const searchId = searchResult.lastInsertRowid;

    // Ergebnisse in Datenbank speichern
    const resultStmt = db.prepare(`
      INSERT INTO results (
        workspace_id, search_id, place_id, name, address, phone, website, 
        rating, website_quality, website_quality_score
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const result of results) {
      resultStmt.run(
        1,
        searchId,
        result.place_id,
        result.name,
        result.address,
        result.phone,
        result.website,
        result.rating,
        result.website_quality,
        result.website_quality_score
      );
    }

    return {
      success: true,
      searchId: searchId,
      message: 'Suche und Ergebnisse erfolgreich gespeichert'
    };

  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Speichern der Daten'
    });
  }
}); 