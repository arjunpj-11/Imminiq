import { useState } from "react";

export type AdminDatePreset = 4 | 7 | 30 | 90 | "custom";
export type AdminDateRange = { from: string; to: string };

const toLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const presetRange = (days: number): AdminDateRange => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  return { from: toLocalDate(from), to: toLocalDate(to) };
};

export const useAdminDateRange = (defaultDays = 30) => {
  const [preset, setPresetState] = useState<AdminDatePreset>(
    defaultDays as AdminDatePreset,
  );
  const [range, setRange] = useState<AdminDateRange>(() =>
    presetRange(defaultDays),
  );
  return {
    preset,
    range,
    setPreset: (value: AdminDatePreset) => {
      setPresetState(value);
      if (value !== "custom") setRange(presetRange(value));
    },
    setFrom: (from: string) => {
      setPresetState("custom");
      setRange((current) => ({ ...current, from }));
    },
    setTo: (to: string) => {
      setPresetState("custom");
      setRange((current) => ({ ...current, to }));
    },
  };
};

export const enumerateDateRange = ({ from, to }: AdminDateRange) => {
  const dates: string[] = [];
  const cursor = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  while (cursor <= end) {
    dates.push(toLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};
