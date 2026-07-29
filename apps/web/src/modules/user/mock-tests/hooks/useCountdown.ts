import { useEffect, useState } from 'react';

export const getCountdownDeadlineMs = (
  initialSeconds: number,
  startedAt?: string,
  nowMs = Date.now()
) => {
  const startedAtMs = startedAt ? new Date(startedAt).getTime() : Number.NaN;
  const effectiveStartedAtMs = Number.isFinite(startedAtMs) ? startedAtMs : nowMs;

  return effectiveStartedAtMs + initialSeconds * 1000;
};

export function useCountdown(initialSeconds: number, startedAt?: string) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const deadlineMs = getCountdownDeadlineMs(initialSeconds, startedAt);
    const updateRemainingSeconds = () => {
      setSeconds(Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)));
    };

    updateRemainingSeconds();
    const intervalId = window.setInterval(updateRemainingSeconds, 1000);

    return () => window.clearInterval(intervalId);
  }, [initialSeconds, startedAt]);

  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remainingSeconds = String(seconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${remainingSeconds}`;
}
