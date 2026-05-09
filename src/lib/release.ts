// Build-time fetch of the latest Keel release. Astro re-evaluates this
// on every build (the deploy workflow rebuilds on every push to main),
// so the pill text and direct-download URLs stay in sync without a
// manual edit per release. Falls back to known-good values if the
// GitHub API rate-limits, errors, or returns an unexpected shape.

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
    // GitHub Actions runners expose GITHUB_TOKEN automatically — use it
    // when present so the deploy workflow gets the 5k/hr authenticated
    // quota instead of the 60/hr unauthenticated one.
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    const token = typeof process !== 'undefined' ? process.env?.GITHUB_TOKEN : '';
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(
      'https://api.github.com/repos/Keel-Labs/keel/releases/latest',
      { headers },
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
