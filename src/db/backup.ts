import { db } from './database';

/**
 * Export all IndexedDB tables to a single JSON object.
 */
export async function exportAllData(): Promise<void> {
  const exportData: Record<string, any[]> = {};
  const tables = db.tables;

  for (const table of tables) {
    exportData[table.name] = await table.toArray();
  }

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `KGOS_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports all data from a JSON object, replacing current database entries.
 */
export async function importAllData(jsonData: Record<string, any[]>): Promise<void> {
  try {
    // Basic verification
    if (typeof jsonData !== 'object' || jsonData === null) {
      throw new Error('Invalid backup file format.');
    }

    // Clear tables and populate them
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        if (jsonData[table.name]) {
          await table.clear();
          await table.bulkAdd(jsonData[table.name]);
        }
      }
    });

    console.log('Database restore completed successfully.');
    window.location.reload();
  } catch (error: any) {
    console.error('Import failed:', error);
    alert('Failed to import backup: ' + error.message);
  }
}

/**
 * Clears all tables in the database (Factory Reset).
 */
export async function clearAllData(): Promise<void> {
  const confirmed = window.confirm('WARNING: This will permanently delete ALL data inside KGOS 2031. Are you absolutely sure you want to perform a factory reset?');
  
  if (confirmed) {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
      }
    });
    console.log('Database cleared.');
    window.location.reload();
  }
}
