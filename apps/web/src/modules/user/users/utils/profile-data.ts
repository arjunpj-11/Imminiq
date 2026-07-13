import type { IGetMyProfileResponse, IUpdateProfilePayload } from '../types/profile.types';

export interface IProfilePageViewModel {
  name: string;
  username: string;
  profession: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  postal: string;
  skills: string[];
  avatarUrl: string | null;
  bannerDataUrl: string | null;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export interface IProfileEditDraft {
  name: string;
  profession: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  postal: string;
  skills: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export const parseLocation = (location: string | undefined) => {
  if (!location) {
    return {
      city: '',
      state: '',
      country: '',
      postal: '',
    };
  }

  const [placePart, postalPart] = location.split(' — ');
  const [city = '', state = '', country = ''] = placePart.split(',').map((value) => value.trim());

  return {
    city,
    state,
    country,
    postal: postalPart?.trim() ?? '',
  };
};

export const formatLocation = (input: {
  city?: string;
  state?: string;
  country?: string;
  postal?: string;
}) => {
  const places = [input.city, input.state, input.country]
    .map((value) => value?.trim())
    .filter(Boolean);

  const core = places.join(', ');
  const postal = input.postal?.trim();

  if (!core) return postal ?? '';
  return postal ? `${core} — ${postal}` : core;
};

export const buildProfileViewModel = (data: IGetMyProfileResponse): IProfilePageViewModel => {
  const location = parseLocation(data.profile.location);

  return {
    name: data.profile.fullName || data.user.fullName || '',
    username: data.user.username || '',
    profession: data.profile.headline || '',
    bio: data.profile.bio || '',
    city: location.city,
    state: location.state,
    country: location.country,
    postal: location.postal,
    skills: data.profile.skills ?? [],
    avatarUrl: data.user.avatarUrl || null,
    bannerDataUrl: data.profile.profileBannerUrl || null,
    githubUrl: data.profile.githubUrl || '',
    linkedinUrl: data.profile.linkedinUrl || '',
    portfolioUrl: data.profile.portfolioUrl || '',
  };
};

export const mapProfileEditDraftToPayload = (draft: IProfileEditDraft): IUpdateProfilePayload => {
  return {
    fullName: draft.name.trim(),
    headline: draft.profession.trim(),
    bio: draft.bio.trim(),
    location: formatLocation({
      city: draft.city,
      state: draft.state,
      country: draft.country,
      postal: draft.postal,
    }),
    skills: draft.skills.map((skill) => skill.trim()).filter(Boolean),
    githubUrl: normalizeOptionalUrl(draft.githubUrl),
    linkedinUrl: normalizeOptionalUrl(draft.linkedinUrl),
    portfolioUrl: normalizeOptionalUrl(draft.portfolioUrl),
  };
};

export const normalizeOptionalUrl = (value: string) => {
  const clean = value.trim();
  if (!clean) return '';

  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://${clean}`;
};

export const dataUrlToFile = (dataUrl: string, fileName: string): File => {
  const [header, content] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? 'image/png';
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], fileName, { type: mime });
};
