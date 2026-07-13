export const fallbackCopyText = (value: string) => {
  const textarea = document.createElement('textarea');

  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand('copy');

  document.body.removeChild(textarea);

  return copied;
};
