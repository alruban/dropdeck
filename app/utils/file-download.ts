/**
 * Downloads a file from the server
 * @param filename - The name of the file to download
 * @param path - The path to the file relative to the downloads folder
 */
export async function downloadFile(filename: string, path: string) {
  try {
    const response = await fetch(`/downloads/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}
