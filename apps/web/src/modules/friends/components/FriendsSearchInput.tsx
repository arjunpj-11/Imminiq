import type { ChangeEvent, FormEvent } from "react";

import { CloseIcon, SearchIcon } from "./icons/FriendsIcons";

interface FriendsSearchInputProps {
  value: string;
  placeholder: string;
  ariaLabel: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  autoFocus?: boolean;
}

export default function FriendsSearchInput({
  value,
  placeholder,
  ariaLabel,
  onChange,
  onClear,
  onSubmit,
  submitLabel = "Search",
  submitDisabled = false,
  autoFocus = false,
}: FriendsSearchInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
    >
      <label className="flex flex-1 items-center gap-2.5 rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-3 transition focus-within:border-(--brand-500) focus-within:ring-2 focus-within:ring-[rgba(184,76,43,0.10)] dark:border-(--border-subtle) dark:bg-(--surface-card) dark:focus-within:border-(--brand-500)">
        <span className="text-[#9b9a92]">
          <SearchIcon />
        </span>
        <input
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
          type="search"
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          className="w-full bg-transparent text-[13.5px] text-(--text-primary) outline-none placeholder:text-[#9b9a92] dark:text-(--text-primary)"
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="text-[#9b9a92] transition hover:text-(--brand-500) dark:hover:text-(--brand-500)"
          >
            <CloseIcon />
          </button>
        )}
      </label>

      {onSubmit && (
        <button
          type="submit"
          disabled={submitDisabled}
          className="shrink-0 rounded-md bg-(--brand-500) px-5 py-3 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-(--brand-600) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500)/30 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
        >
          {submitLabel}
        </button>
      )}
    </form>
  );
}
