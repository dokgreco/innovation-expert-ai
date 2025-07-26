// Storage utilities for Innovation Expert AI
// Handles localStorage persistence and CSV export/import

const STORAGE_KEY = 'innovation-chat-history';
const LANGUAGE_KEY = 'innovation-language';

// ============= LOCAL STORAGE MANAGEMENT =============

export const saveToLocalStorage = (data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = () => {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// ============= CSV EXPORT/IMPORT =============

export const exportToCSV = (messages, filename = null) => {
  try {
    if (!messages || messages.length === 0) {
      throw new Error('No messages to export');
    }

    // Prepare data for CSV
    const csvData = messages.map((msg, index) => ({
      id: msg.id || index,
      timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
      role: msg.role || 'unknown',
      content: (msg.content || '').replace(/"/g, '""'), // Escape quotes
      category: msg.category || '',
      sources_count: msg.sources ? msg.sources.length : 0,
      sources: msg.sources ? JSON.stringify(msg.sources) : '',
      notion_query_total: msg.notionQuery?.totalResults || 0,
      notion_query_filters: msg.notionQuery?.filtersApplied || 0,
      is_error: msg.isError || false
    }));

    // Convert to CSV string
    const headers = [
      'id', 'timestamp', 'role', 'content', 'category', 
      'sources_count', 'sources', 'notion_query_total', 
      'notion_query_filters', 'is_error'
    ];
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Wrap in quotes if contains comma or newline
          if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `innovation-chat-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return { success: true, message: 'Export completed successfully' };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, error: error.message };
  }
};

export const parseCSVContent = (csvContent) => {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Invalid CSV format: insufficient data');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue;

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
};

// Helper function to parse CSV line with proper quote handling
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add last value
  values.push(current.trim());
  return values;
};

export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      reject(new Error('File must be a CSV'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvContent = event.target.result;
        const parsedData = parseCSVContent(csvContent);
        
        // Convert back to message format
        const messages = parsedData.map(row => ({
          id: row.id || Date.now().toString() + Math.random(),
          timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
          role: row.role || 'user',
          content: row.content || '',
          category: row.category || undefined,
          sources: row.sources ? (
            typeof row.sources === 'string' && row.sources !== '' ? 
            JSON.parse(row.sources) : []
          ) : undefined,
          notionQuery: (row.notion_query_total || row.notion_query_filters) ? {
            totalResults: parseInt(row.notion_query_total) || 0,
            filtersApplied: parseInt(row.notion_query_filters) || 0
          } : undefined,
          isError: row.is_error === 'true' || row.is_error === true
        })).filter(msg => msg.content); // Filter out empty messages

        resolve({ 
          success: true, 
          messages,
          count: messages.length 
        });
      } catch (error) {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
};