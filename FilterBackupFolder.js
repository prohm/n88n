// Filter backup folders older than 31 days - Clean version
const inputItems = $input.all();
const cutoffDate = DateTime.now().minus({ days: 31 });

console.log('Filtering backup folders older than 31 days');
console.log('Cutoff date:', cutoffDate.toISO());
console.log('Total folders found:', inputItems.length);

// Filter folders older than 8 days
const oldFolders = [];

// Process each input item
inputItems.forEach((item, index) => {
  try {
    if (item.json.lastModifiedDateTime) {
      const folderDate = DateTime.fromISO(item.json.lastModifiedDateTime);
      const isOld = folderDate < cutoffDate;
      
      console.log('Folder:', item.json.name || 'Unknown', 'Date:', folderDate.toFormat('dd/MM/yyyy'), 'Old:', isOld);
      
      if (isOld) {
        oldFolders.push(item);
      }
    }
  } catch (error) {
    console.log('Error parsing date for folder:', item.json.name, error);
  }
});

console.log('Old folders to delete:', oldFolders.length);
console.log('Recent folders to keep:', inputItems.length - oldFolders.length);

if (oldFolders.length > 0) {
  // FOUND OLD FOLDERS TO DELETE
  // Return ONLY the old folders with summary info in first item
  const result = oldFolders.map((folder, index) => {
    if (index === 0) {
      // First old folder gets summary metadata
      return {
        json: {
          id: folder.json.id,
          name: folder.json.name,
          lastModifiedDateTime: folder.json.lastModifiedDateTime,
          createdDateTime: folder.json.createdDateTime,
          size: folder.json.size,
          // Add metadata
          hasOldFolders: true,
          oldFoldersCount: oldFolders.length,
          totalFoldersChecked: inputItems.length,
          cutoffDate: cutoffDate.toISO()
        }
      };
    } else {
      // Other old folders keep original structure
      return {
        json: {
          id: folder.json.id,
          name: folder.json.name,
          lastModifiedDateTime: folder.json.lastModifiedDateTime,
          createdDateTime: folder.json.createdDateTime,
          size: folder.json.size
        }
      };
    }
  });
  
  console.log('Returning', result.length, 'OLD folders for deletion');
  return result;
  
} else {
  // NO OLD FOLDERS FOUND
  // Return single summary item
  console.log('No old folders found - all folders are recent');
  return [{
    json: {
      hasOldFolders: false,
      oldFoldersCount: 0,
      totalFoldersChecked: inputItems.length,
      cutoffDate: cutoffDate.toISO(),
      recentFoldersCount: inputItems.length,
      message: 'All backup folders are recent - no cleanup needed'
    }
  }];
}
