const sanitizeFileName = (value: string) =>
  value.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'chat-download';

export const loadChatMediaBlob = async (
  url: string,
  expectedMimeType?: string
) => {
  const response = await fetch(url, { credentials: 'omit' });
  if (!response.ok) {
    throw new Error(`Media request failed with status ${response.status}`);
  }
  const receivedBlob = await response.blob();
  if (!expectedMimeType || receivedBlob.type === expectedMimeType) {
    return receivedBlob;
  }
  return new Blob([await receivedBlob.arrayBuffer()], {
    type: expectedMimeType,
  });
};

export const downloadChatMedia = async (url: string, fileName: string) => {
  const blob = await loadChatMediaBlob(url);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = sanitizeFileName(fileName);
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
};
