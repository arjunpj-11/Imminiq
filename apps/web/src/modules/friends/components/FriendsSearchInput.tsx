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
      <label className="flex flex-1 items-center gap-2.5 rounded-[13px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 transition focus-within:border-[#b84c2b] focus-within:ring-2 focus-within:ring-[rgba(184,76,43,0.10)] dark:border-white/9 dark:bg-[#1e1c19] dark:focus-within:border-[#e8816a]">
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
          className="w-full bg-transparent text-[13.5px] text-[#1a1714] outline-none placeholder:text-[#9b9a92] dark:text-[#f2f0eb]"
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="text-[#9b9a92] transition hover:text-[#b84c2b] dark:hover:text-[#e8816a]"
          >
            <CloseIcon />
          </button>
        )}
      </label>

      {onSubmit && (
        <button
          type="submit"
          disabled={submitDisabled}
          className="shrink-0 rounded-[13px] bg-[#b84c2b] px-5 py-3 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#963d22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b84c2b]/30 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
        >
          {submitLabel}
        </button>
      )}
    </form>
  );
}
