// Build-time fetches against the GitHub API. Astro re-evaluates these
// on every build (the deploy workflow rebuilds on every push to main),
// so the rendered values stay in sync without a manual edit. Each
// helper falls back to known-good values if the API rate-limits,
// errors, or returns an unexpected shape.

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  // Picked up by the deploy workflow (env: GITHUB_TOKEN), gives the
  // build the 5k/hr authenticated quota instead of the 60/hr cap.
  const token = typeof process !== 'undefined' ? process.env?.GITHUB_TOKEN : '';
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

type ReleaseInfo = {
  tag: string;       // e.g. "v0.2.0"
  version: string;   // e.g. "0.2.0" — tag with the leading v stripped
  dmgUrl: string;    // direct .dmg asset URL
};

const FALLBACK: ReleaseInfo = {
  tag: 'v0.2.0',
  version: '0.2.0',
  dmgUrl: 'https://github.com/Keel-Labs/keel/releases/latest/download/Keel-0.2.0-mac.dmg',
};

let cached: Promise<ReleaseInfo> | null = null;

async function fetchLatest(): Promise<ReleaseInfo> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/Keel-Labs/keel/releases/latest',
      { headers: authHeaders() },
    );
    if (!res.ok) return FALLBACK;
    const data = await res.json() as {
      tag_name?: unknown;
      assets?: Array<{ name?: unknown; browser_download_url?: unknown }>;
    };
    const tag = typeof data.tag_name === 'string' ? data.tag_name : FALLBACK.tag;
    const version = tag.replace(/^v/, '');
    const macAsset = Array.isArray(data.assets)
      ? data.assets.find((a) =>
          typeof a?.name === 'string' && a.name.endsWith('-mac.dmg'),
        )
      : undefined;
    const dmgUrl =
      macAsset && typeof macAsset.browser_download_url === 'string'
        ? macAsset.browser_download_url
        : FALLBACK.dmgUrl;
    return { tag, version, dmgUrl };
  } catch {
    return FALLBACK;
  }
}

// Memoise across components so a single build does at most one fetch.
export function getLatestRelease(): Promise<ReleaseInfo> {
  if (!cached) cached = fetchLatest();
  return cached;
}

type Maintainer = {
  login: string;
  name: string;
  bio: string;
  avatarUrl: string;
  profileUrl: string;
  location: string;
  blog: string;
  twitter: string;
};

const MAINTAINER_FALLBACK: Maintainer = {
  login: 'medha',
  name: 'Medha',
  // Used when the GitHub profile bio is empty (it's null on the API
  // today), and as the fallback when the API call itself fails.
  bio: "Ex-Meta Product Manager, Ex-Software Engineer turned Indie Product Builder; vibe-coding solutions to problems I can't stop thinking about.",
  avatarUrl: 'https://github.com/medha.png',
  profileUrl: 'https://github.com/medha',
  location: '',
  blog: '',
  twitter: '',
};

let cachedMaintainer: Promise<Maintainer> | null = null;

async function fetchMaintainer(): Promise<Maintainer> {
  try {
    const res = await fetch('https://api.github.com/users/medha', { headers: authHeaders() });
    if (!res.ok) return MAINTAINER_FALLBACK;
    const d = await res.json() as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    return {
      login: str(d.login) || MAINTAINER_FALLBACK.login,
      name: str(d.name) || MAINTAINER_FALLBACK.name,
      bio: str(d.bio) || MAINTAINER_FALLBACK.bio,
      avatarUrl: str(d.avatar_url) || MAINTAINER_FALLBACK.avatarUrl,
      profileUrl: str(d.html_url) || MAINTAINER_FALLBACK.profileUrl,
      location: str(d.location),
      blog: str(d.blog),
      twitter: str(d.twitter_username),
    };
  } catch {
    return MAINTAINER_FALLBACK;
  }
}

export function getMaintainer(): Promise<Maintainer> {
  if (!cachedMaintainer) cachedMaintainer = fetchMaintainer();
  return cachedMaintainer;
}

let cachedStarCount: Promise<string> | null = null;

async function fetchStarCount(): Promise<string> {
  try {
    const res = await fetch('https://api.github.com/repos/Keel-Labs/keel', {
      headers: authHeaders(),
    });
    if (!res.ok) return '';
    const data = await res.json() as { stargazers_count?: unknown };
    if (typeof data.stargazers_count === 'number') {
      return new Intl.NumberFormat('en-US').format(data.stargazers_count);
    }
    return '';
  } catch {
    return '';
  }
}

// Returns a humanised star count like "1,234", or '' when the API is
// unreachable. Memoised so Header and CTA share one fetch per build.
export function getStarCount(): Promise<string> {
  if (!cachedStarCount) cachedStarCount = fetchStarCount();
  return cachedStarCount;
}
