// Language-independent data. All visible text lives in src/i18n/copy.ts.

export const PROFILE = {
  github: 'https://github.com/neriaok',
  linkedin: 'https://www.linkedin.com/in/neria-okabi',
  email: 'neriaokabik@gmail.com',
  cv: '', // not used: the CV is attached alongside the portfolio link
  phoneIntl: '972529541254',
  phoneDisplay: '+972 52-954-1254',
} as const;

export type WorldId =
  | 'mobile' | 'ai' | 'product' | 'cloud-auth' | 'i18n'
  | 'enterprise' | 'mern' | 'automation' | 'rbac' | 'dashboards'
  | 'social-apis' | 'edge' | 'oauth-mcp' | 'events'
  | 'clients' | 'ecommerce' | 'seo' | 'cms'
  | 'creative-fe' | 'motion-3d' | 'api' | 'state';

export type ChapterId = 'dog' | 'hub' | 'bot' | 'dvora' | 'library';
export type LinkKind = 'live' | 'site' | 'github' | 'instagram';

export type ChapterMedia =
  | { kind: 'desktop' | 'phone'; image?: string; video?: string; iframe?: string }
  | { kind: 'hub-automation'; image: string }
  | { kind: 'bot-combo' };

export interface Chapter {
  id: ChapterId;
  index: string;
  title: string;
  year: string;
  worlds: WorldId[];
  stack: string[];
  links: { kind: LinkKind; href: string }[];
  media: ChapterMedia;
  /** world palette: deep, mid, glow */
  palette: [string, string, string];
  accent: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'dog',
    index: '01',
    title: 'Train Your Dog',
    year: '2025',
    worlds: ['mobile', 'ai', 'product', 'cloud-auth', 'i18n'],
    stack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'Claude API', 'Cloudflare Workers'],
    links: [
      { kind: 'live', href: 'https://train-your-dog-app-nerias-projects-33ce4739.vercel.app' },
      { kind: 'github', href: 'https://github.com/neriaok/Train-Your-Dog-App' },
    ],
    media: { kind: 'phone', image: './shots/dog.jpg', video: './shots/dog.mp4' },
    palette: ['#140c1e', '#6b3f63', '#ffa456'],
    accent: '#c6e877',
  },
  {
    id: 'hub',
    index: '02',
    title: 'ProjectHub',
    year: '2026',
    worlds: ['enterprise', 'mern', 'automation', 'rbac', 'dashboards'],
    stack: ['React 19', 'TypeScript', 'RTK Query', 'Fluent UI', 'Express 5', 'MongoDB', 'JWT', 'Make'],
    links: [
      { kind: 'live', href: 'https://projecthub-bice.vercel.app' },
      { kind: 'github', href: 'https://github.com/neriaok/projecthub' },
    ],
    media: { kind: 'hub-automation', image: './shots/hub.jpg' },
    palette: ['#0b1220', '#3d6fb8', '#a9d4ff'],
    accent: '#8ec5ff',
  },
  {
    id: 'bot',
    index: '03',
    title: 'NeriaTech Bot',
    year: '2026',
    worlds: ['social-apis', 'edge', 'oauth-mcp', 'events', 'automation', 'ai'],
    stack: ['TypeScript', 'Cloudflare Workers', 'D1', 'Instagram Graph API', 'MCP', 'OAuth 2.1', 'React', 'Make', 'Vitest'],
    links: [{ kind: 'instagram', href: 'https://instagram.com/neria.tech' }],
    media: { kind: 'bot-combo' },
    palette: ['#14061f', '#7a2fb5', '#ff8ae6'],
    accent: '#e77bff',
  },
  {
    id: 'dvora',
    index: '04',
    title: 'Dvora-Chen',
    year: '2026',
    worlds: ['clients', 'ecommerce', 'seo', 'edge', 'cms'],
    stack: ['React 19', 'TypeScript', 'RTK Query', 'Hono', 'Cloudflare D1', 'Workers KV', 'Vitest'],
    links: [{ kind: 'site', href: 'https://dvora-site.neriaokabik.workers.dev/' }],
    media: { kind: 'phone', image: './shots/dvora.jpg', video: './shots/dvora.mp4' },
    palette: ['#1a1006', '#a8642a', '#ffd08a'],
    accent: '#f0a64b',
  },
  {
    id: 'library',
    index: '05',
    title: 'Library',
    year: '2026',
    worlds: ['creative-fe', 'motion-3d', 'api', 'state'],
    stack: ['React', 'TypeScript', 'Redux Toolkit', 'RTK Query', 'CSS Modules', 'Google Books API'],
    links: [
      { kind: 'live', href: 'https://my-library-app-nu.vercel.app/' },
      { kind: 'github', href: 'https://github.com/neriaok/my-library-app' },
    ],
    media: { kind: 'desktop', image: './shots/library.jpg', video: './shots/library.mp4' },
    palette: ['#070b1c', '#2c3f8a', '#f3d58a'],
    accent: '#f3d58a',
  },
];

export const INTRO_PALETTE: [string, string, string] = ['#140c14', '#b0607a', '#ffc7a1'];
export const OUTRO_PALETTE: [string, string, string] = ['#05060d', '#3a2f7a', '#b9a6ff'];

export const ALL_WORLD_IDS = Array.from(new Set(CHAPTERS.flatMap((c) => c.worlds)));

export const SKILLS: Record<'frontend' | 'backend' | 'cloud' | 'automation', string[]> = {
  frontend: ['React', 'TypeScript', 'Redux Toolkit', 'RTK Query', 'React Native · Expo', 'Vue', 'CSS Modules · SCSS', 'GSAP · CSS 3D'],
  backend: ['Node.js', 'Express', 'Hono', 'MongoDB', 'SQL · D1', 'JWT · OAuth 2.1', 'REST'],
  cloud: ['Cloudflare Workers', 'Vercel', 'Render', 'Supabase', 'CI/CD', 'Vitest', 'Postman'],
  automation: ['Make', 'Webhooks', 'Claude API', 'MCP servers', 'AI-assisted development'],
};
