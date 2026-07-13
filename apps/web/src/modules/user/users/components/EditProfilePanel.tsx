import { useEffect, useState } from 'react'
import type React from 'react'
import { createPortal } from 'react-dom'
import { getCitiesOfState, getCountries, getStatesOfCountry } from '@countrystatecity/countries-browser'
import type { ICity, ICountry, IState } from '@countrystatecity/countries-browser'
import type { IProfileData } from '../types/profile.types'
import { cn, themedScrollbar } from '../utils/profile-ui.utils'
import { useBodyScrollLock } from '../../../../hooks/useBodyScrollLock'

/* ─── Edit Panel ─── */
interface IEditPanelProps {
  profile: IProfileData;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<IProfileData>) => void | Promise<void>;
  isSaving?: boolean;
}

export default function EditProfilePanel({
  profile,
  open,
  onClose,
  onSave,
  isSaving = false,
}: IEditPanelProps) {
  const [name, setName] = useState(profile.name);
  const [profession, setProfession] = useState(profile.profession);
  const [bio, setBio] = useState(profile.bio);
  const [country, setCountry] = useState(profile.country);
  const [state, setState] = useState(profile.state);
  const [city, setCity] = useState(profile.city);
  const [postal, setPostal] = useState(profile.postal);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [locationLoading, setLocationLoading] = useState({
    countries: true,
    states: Boolean(profile.country),
    cities: Boolean(profile.country && profile.state),
  });
  const [locationError, setLocationError] = useState("");
  const [skills, setSkills] = useState([...profile.skills]);
  const [skillInput, setSkillInput] = useState("");
  const [github, setGithub] = useState(profile.githubUrl);
  const [linkedin, setLinkedin] = useState(profile.linkedinUrl);
  const [portfolio, setPortfolio] = useState(profile.portfolioUrl);
  const [openTo, setOpenTo] = useState({
    collaboration: true,
    mockInterviews: false,
    trackerSharing: true,
    mentoring: false,
  });

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getCountries()
      .then((loadedCountries) => {
        if (cancelled) return;
        setCountries(loadedCountries);

        const matchedCountry = loadedCountries.find(
          (item) =>
            item.name === profile.country || item.iso2 === profile.country,
        );
        setCountryCode(matchedCountry?.iso2 ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        setCountries([]);
        setCountryCode("");
        setLocationError("Unable to load live location data right now.");
      })
      .finally(() => {
        if (!cancelled)
          setLocationLoading((current) => ({ ...current, countries: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [open, profile.country]);

  useEffect(() => {
    if (!open || !countryCode) return;

    let cancelled = false;

    getStatesOfCountry(countryCode)
      .then((loadedStates) => {
        if (cancelled) return;
        setStates(loadedStates);

        const canRestoreState = country === profile.country;
        const matchedState = canRestoreState
          ? loadedStates.find(
              (item) =>
                item.name === profile.state || item.iso2 === profile.state,
            )
          : undefined;
        setStateCode(matchedState?.iso2 ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        setStates([]);
        setStateCode("");
        setLocationError("Unable to load states for the selected country.");
      })
      .finally(() => {
        if (!cancelled)
          setLocationLoading((current) => ({ ...current, states: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [open, countryCode, country, profile.country, profile.state]);

  useEffect(() => {
    if (!open || !countryCode || !stateCode) return;

    let cancelled = false;

    getCitiesOfState(countryCode, stateCode)
      .then((loadedCities) => {
        if (cancelled) return;
        setCities(loadedCities);
      })
      .catch(() => {
        if (cancelled) return;
        setCities([]);
        setLocationError("Unable to load cities for the selected state.");
      })
      .finally(() => {
        if (!cancelled)
          setLocationLoading((current) => ({ ...current, cities: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [open, countryCode, stateCode]);

  const inputCls =
    'w-full px-[13px] py-2.5 border-[1.5px] border-[var(--border-subtle)] dark:border-white/[0.09] rounded-[var(--radius-sm)] bg-white dark:bg-[var(--surface-elevated)] text-[var(--text-primary)] dark:text-[var(--text-primary)] text-[13.5px] font-ui outline-none transition focus:border-[var(--brand-500)] dark:focus:border-[var(--brand-500)] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] placeholder:text-[#9f8f86] dark:placeholder:text-[#7a756e]';
  const labelCls =
    'font-mono text-[8px] tracking-[0.13em] uppercase text-[var(--text-secondary)] dark:text-[var(--text-secondary)] opacity-70 mb-[5px] block';

  const handleSkillKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = skillInput.trim().replace(/,$/, "");
      if (v && !skills.includes(v)) setSkills([...skills, v]);
      setSkillInput("");
    } else if (e.key === "Backspace" && skillInput === "" && skills.length) {
      setSkills(skills.slice(0, -1));
    }
  };

  const handleCountryChange = (nextCountryCode: string) => {
    const selectedCountry = countries.find(
      (item) => item.iso2 === nextCountryCode,
    );
    setCountryCode(nextCountryCode);
    setCountry(selectedCountry?.name ?? "");
    setStateCode("");
    setState("");
    setCity("");
    setStates([]);
    setCities([]);
    setLocationError("");
    setLocationLoading((current) => ({
      ...current,
      states: Boolean(nextCountryCode),
      cities: false,
    }));
  };

  const handleStateChange = (nextStateCode: string) => {
    const selectedState = states.find((item) => item.iso2 === nextStateCode);
    setStateCode(nextStateCode);
    setState(selectedState?.name ?? "");
    setCity("");
    setCities([]);
    setLocationError("");
    setLocationLoading((current) => ({
      ...current,
      cities: Boolean(countryCode && nextStateCode),
    }));
  };

  const handleSave = async () => {
    try {
      await onSave({
        name,
        profession,
        bio,
        country,
        state,
        city,
        postal,
        skills,
        githubUrl: github,
        linkedinUrl: linkedin,
        portfolioUrl: portfolio,
      });
    } catch {
      // Parent save handler already handles toast + panel state.
    }
  };

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 z-100 bg-[rgba(26,23,20,0.55)] dark:bg-[rgba(0,0,0,0.70)] backdrop-blur transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-101 flex min-h-0 min-w-0 w-full max-w-130 flex-col overflow-hidden border-l border-(--border-subtle) bg-(--surface-card) shadow-[-8px_0_48px_rgba(26,23,20,0.14)] transition-transform duration-360 ease-in-out dark:border-(--border-subtle) dark:bg-(--surface-card)",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-panel-title"
      >
        {/* Head */}
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-(--border-subtle) bg-(--surface-card) px-5.5 py-4.5 dark:border-(--border-subtle) dark:bg-(--surface-card)">
          <span id="edit-profile-panel-title" className="font-ui text-[20px] font-extrabold text-(--text-primary) dark:text-(--text-primary) tracking-[-0.4px]">
            Edit Profile
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8.5 h-8.5 rounded-sm border-[1.5px] border-(--border-subtle) dark:border-(--border-subtle) flex items-center justify-center text-(--text-secondary) dark:text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] transition"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col gap-5.5 overflow-x-hidden overflow-y-auto overscroll-contain px-5.5 py-6",
            themedScrollbar,
          )}
        >
          {/* Basic Info */}
          <div>
            <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-(--text-secondary) dark:text-(--text-secondary) opacity-55 pb-2.5 border-b border-(--border-subtle) dark:border-(--border-subtle) mb-3.5">
              Basic Information
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-3.25 max-[640px]:grid-cols-1">
              <div className="flex min-w-0 flex-col">
                <label className={labelCls}>Full Name</label>
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <label className={labelCls}>Profession</label>
                <input
                  className={inputCls}
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Your role"
                />
              </div>
              <div className="col-span-2 flex min-w-0 flex-col max-[640px]:col-span-1">
                <label className={labelCls}>Bio</label>
                <textarea
                  className={cn(
                    inputCls,
                    "resize-y min-h-20 leading-[1.6]",
                  )}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="mb-3.5 border-b border-(--border-subtle) pb-2.5 font-mono text-[8px] uppercase tracking-[0.18em] text-(--text-secondary) opacity-55 dark:border-(--border-subtle) dark:text-(--text-secondary)">
              Location
            </div>
            <div className="grid grid-cols-2 gap-3.25 max-[640px]:grid-cols-1">
              <div className="flex flex-col">
                <label className={labelCls}>Country</label>
                <select
                  className={inputCls}
                  value={countryCode}
                  onChange={(event) => handleCountryChange(event.target.value)}
                  disabled={locationLoading.countries}
                >
                  <option value="">
                    {locationLoading.countries
                      ? "Loading countries…"
                      : "Select country"}
                  </option>
                  {countries.map((item) => (
                    <option key={item.iso2} value={item.iso2}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelCls}>State / Province</label>
                <select
                  className={inputCls}
                  value={stateCode}
                  onChange={(event) => handleStateChange(event.target.value)}
                  disabled={!countryCode || locationLoading.states}
                >
                  <option value="">
                    {locationLoading.states
                      ? "Loading states…"
                      : "Select state"}
                  </option>
                  {states.map((item) => (
                    <option
                      key={`${countryCode}-${item.iso2}-${item.name}`}
                      value={item.iso2}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelCls}>City</label>
                <select
                  className={inputCls}
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  disabled={!stateCode || locationLoading.cities}
                >
                  <option value="">
                    {locationLoading.cities ? "Loading cities…" : "Select city"}
                  </option>
                  {cities.map((item) => (
                    <option key={`${item.id}-${item.name}`} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelCls}>PIN Code</label>
                <input
                  className={inputCls}
                  value={postal}
                  onChange={(event) => setPostal(event.target.value)}
                  placeholder="682001"
                />
              </div>
            </div>
            {locationError && (
              <p className="mt-2 text-[11px] font-medium text-(--brand-500) dark:text-(--brand-500)">
                {locationError}
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-(--text-secondary) dark:text-(--text-secondary) opacity-55 pb-2.5 border-b border-(--border-subtle) dark:border-(--border-subtle) mb-3.5">
              Skills
            </div>
            <div
              className="min-h-11.5 flex flex-wrap gap-1.5 items-center px-2.5 py-2 border-[1.5px] border-(--border-subtle) dark:border-(--border-subtle) rounded-sm bg-white dark:bg-(--surface-elevated) cursor-text focus-within:border-(--brand-500) dark:focus-within:border-(--brand-500) focus-within:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] transition"
              onClick={() => document.getElementById("skill-input")?.focus()}
            >
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.25 px-2.5 py-0.75 rounded-full bg-[rgba(184,76,43,0.07)] dark:bg-[rgba(232,129,106,0.09)] border border-[rgba(184,76,43,0.18)] dark:border-[rgba(232,129,106,0.22)] text-[12px] font-medium text-(--text-primary) dark:text-(--text-primary) whitespace-nowrap"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, j) => j !== i))}
                    className="text-(--text-secondary) dark:text-(--text-secondary) hover:text-(--brand-500) transition text-[14px] leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="skill-input"
                className="border-none bg-transparent outline-none text-[12.5px] font-ui text-(--text-primary) dark:text-(--text-primary) min-w-22.5 flex-1 placeholder:text-[#9f8f86] dark:placeholder:text-[#7a756e]"
                placeholder="+ Add skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeydown}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-(--text-secondary) dark:text-(--text-secondary) opacity-60">
              Press Enter or comma to add
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="mb-3.5 border-b border-(--border-subtle) pb-2.5 font-mono text-[8px] uppercase tracking-[0.18em] text-(--text-secondary) opacity-55 dark:border-(--border-subtle) dark:text-(--text-secondary)">
              Links
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                {
                  value: github,
                  setter: setGithub,
                  placeholder: "github.com/username",
                  icon: "github",
                },
                {
                  value: linkedin,
                  setter: setLinkedin,
                  placeholder: "linkedin.com/in/username",
                  icon: "linkedin",
                },
                {
                  value: portfolio,
                  setter: setPortfolio,
                  placeholder: "yourportfolio.com",
                  icon: "portfolio",
                },
              ].map((item) => (
                <label
                  key={item.icon}
                  className="flex items-center gap-2.5 rounded-sm border-[1.5px] border-(--border-subtle) bg-white px-3 py-2.5 text-(--text-secondary) transition focus-within:border-(--brand-500) focus-within:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-(--border-subtle) dark:bg-(--surface-elevated) dark:text-(--text-secondary) dark:focus-within:border-(--brand-500)"
                >
                  {item.icon === "github" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  ) : item.icon === "linkedin" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  )}
                  <input
                    type="url"
                    value={item.value}
                    onChange={(event) => item.setter(event.target.value)}
                    placeholder={item.placeholder}
                    className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-(--text-primary) outline-none placeholder:text-[#9f8f86] dark:text-(--text-primary) dark:placeholder:text-[#7a756e]"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Open To */}
          <div>
            <div className="mb-3.5 border-b border-(--border-subtle) pb-2.5 font-mono text-[8px] uppercase tracking-[0.18em] text-(--text-secondary) opacity-55 dark:border-(--border-subtle) dark:text-(--text-secondary)">
              Open To
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["collaboration", "Collaboration"],
                ["mockInterviews", "Mock Interviews"],
                ["trackerSharing", "Tracker Sharing"],
                ["mentoring", "Mentoring"],
              ].map(([key, label]) => {
                const active = openTo[key as keyof typeof openTo];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setOpenTo((current) => ({ ...current, [key]: !active }))
                    }
                    className={cn(
                      "rounded-full border-[1.5px] px-3.5 py-2 text-[12px] font-semibold transition",
                      active
                        ? "border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.10)] text-(--brand-500) dark:border-[rgba(232,129,106,0.26)] dark:bg-[rgba(232,129,106,0.12)] dark:text-(--brand-500)"
                        : "border-(--border-subtle) bg-transparent text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary)",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-(--border-subtle) bg-(--surface-card) px-5.5 py-4 dark:border-(--border-subtle) dark:bg-(--surface-card)">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-md border-[1.5px] border-(--border-subtle) dark:border-(--border-subtle) text-[13px] font-semibold text-(--text-secondary) dark:text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5.5 py-2.5 rounded-md bg-(--brand-500) dark:bg-(--brand-500) text-[#fdf8f5] dark:text-[#141412] text-[13px] font-bold transition hover:-translate-y-px hover:bg-(--brand-600) dark:hover:bg-(--brand-600) hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
