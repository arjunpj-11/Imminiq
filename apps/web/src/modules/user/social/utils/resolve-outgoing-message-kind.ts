type OutgoingMessageKind = 'text' | 'code' | 'voice';

export const resolveOutgoingMessageKind = (
  kind: OutgoingMessageKind,
  file?: Pick<File, 'type'>
) => {
  if (kind === 'voice') return 'voice';
  if (!file) return kind;
  return file.type.startsWith('image/') ? 'image' : 'file';
};
