type MediaPermissionKind = 'microphone' | 'camera';

const permissionLabel = (kinds: MediaPermissionKind[]) =>
  kinds.length === 2 ? 'microphone and camera' : kinds[0] ?? 'media';

const permissionKinds = (constraints: MediaStreamConstraints): MediaPermissionKind[] => [
  ...(constraints.audio ? (['microphone'] as const) : []),
  ...(constraints.video ? (['camera'] as const) : []),
];

const queryPermission = async (kind: MediaPermissionKind) => {
  if (!navigator.permissions?.query) return null;
  try {
    return await navigator.permissions.query({
      name: kind as PermissionName,
    });
  } catch {
    return null;
  }
};

export const explainMediaPermissionError = (
  error: unknown,
  constraints: MediaStreamConstraints
) => {
  const label = permissionLabel(permissionKinds(constraints));
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return `Access to your ${label} is blocked. Open this site's browser permissions, allow access, then try again. On a phone, also check the browser's permission in system settings.`;
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return `No available ${label} was found on this device.`;
    }
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return `Your ${label} is being used by another app or could not be started. Close other calling or recording apps and try again.`;
    }
    if (error.name === 'OverconstrainedError') {
      return `This device cannot provide the requested ${label} settings.`;
    }
  }
  return error instanceof Error && error.message
    ? error.message
    : `The ${label} could not be opened. Check site permissions and try again.`;
};

export const requestMediaPermission = async (
  constraints: MediaStreamConstraints
): Promise<MediaStream> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Media access is not supported in this browser.');
  }
  if (
    typeof window !== 'undefined' &&
    !window.isSecureContext &&
    window.location.hostname !== 'localhost'
  ) {
    throw new Error('Microphone and camera access require a secure HTTPS connection.');
  }

  const kinds = permissionKinds(constraints);
  const states = await Promise.all(kinds.map(queryPermission));
  const deniedKind = kinds.find((_, index) => states[index]?.state === 'denied');
  if (deniedKind) {
    throw new Error(
      `${deniedKind === 'camera' ? 'Camera' : 'Microphone'} access is blocked. Open this site's browser permissions, choose Allow, and try again.`
    );
  }

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    throw new Error(explainMediaPermissionError(error, constraints), { cause: error });
  }
};
