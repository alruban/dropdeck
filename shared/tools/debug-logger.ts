import fs from 'fs';
import path from 'path';

/**
 * Writes debug data to a text file in the project's debug-logs directory
 * @param data - The data to write (will be stringified if not a string)
 * @param filename - Optional filename (defaults to timestamp-based name)
 */
export const writeDebugLog = (data: any, filename?: string) => {
  try {
    // Create debug-logs directory if it doesn't exist
    const debugDir = path.join(process.cwd(), 'debug-logs');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir);
    }

    // Create filename with timestamp if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFilename = filename || `debug-log-${timestamp}.txt`;
    const filePath = path.join(debugDir, logFilename);

    // Convert data to string if it's not already
    let content: string;
    if (typeof data === 'string') {
      content = data;
    } else if (typeof data === 'object') {
      // Handle objects, including those with circular references
      try {
        content = JSON.stringify(data, null, 2);
      } catch (e) {
        // If JSON.stringify fails (e.g., due to circular references), use a custom stringifier
        content = Object.entries(data)
          .map(([key, value]) => {
            const valueStr = typeof value === 'object'
              ? JSON.stringify(value, null, 2)
              : String(value);
            return `${key}: ${valueStr}`;
          })
          .join('\n');
      }
    } else {
      content = String(data);
    }

    // Write to file
    fs.writeFileSync(filePath, content);
    console.log(`Debug log written to: ${filePath}`);
  } catch (error) {
    console.error('Error writing debug log:', error);
  }
};
