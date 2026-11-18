import { CHAPTERS, PROFILE, ALL_WORLD_IDS } from '../../config/content';
import { COPY } from '../../i18n/copy';

const T = COPY.en;
const WORLDS = T.worlds;

export interface CommandResult {
  output: string[];
  action?: 'clear' | 'close' | { open: string } | { scroll: string };
}

const HELP = [
  'available commands:',
  '  whoami        who built this',
  '  projects      list the five worlds',
  '  open <n>      jump to project n (1-5)',
  '  worlds        every professional world unlocked',
  '  stack         the tools I use',
  '  contact       how to reach me',
  '  hire          let\'s talk',
  '  clear / exit',
];

export const runCommand = (raw: string): CommandResult => {
  const [cmd = '', ...args] = raw.trim().split(/\s+/);
  switch (cmd.toLowerCase()) {
    case '':
      return { output: [] };
    case 'help':
    case '?':
      return { output: HELP };
    case 'whoami':
      return { output: [`${T.name} — ${T.role}`, 'ex therapeutic & service-dog handler (incl. PTSD service dogs) → full-stack developer.', 'React · TypeScript · Node · edge · AI.'] };
    case 'projects':
    case 'ls':
      return { output: CHAPTERS.map((c) => `${c.index}  ${c.title.padEnd(15)} ${T.chapters[c.id].world}`) };
    case 'open':
    case 'cd': {
      const n = Number(args[0]);
      const c = CHAPTERS[n - 1];
      return c ? { output: [`travelling to ${T.chapters[c.id].world}…`], action: { scroll: `${c.id}-title` } } : { output: ['usage: open <1-5>'] };
    }
    case 'worlds':
      return { output: [`${ALL_WORLD_IDS.length} worlds:`, ...ALL_WORLD_IDS.map((w) => `  · ${WORLDS[w]}`)] };
    case 'stack':
      return { output: ['frontend  React · TypeScript · RTK Query · React Native · Vue · GSAP', 'backend   Node · Express · Hono · MongoDB · SQL/D1', 'cloud     Cloudflare Workers · Vercel · Supabase · Render', 'glue      Make · webhooks · Claude API · MCP'] };
    case 'contact':
      return { output: [`github    ${PROFILE.github}`, ...(PROFILE.linkedin ? [`linkedin  ${PROFILE.linkedin}`] : []), ...(PROFILE.email ? [`email     ${PROFILE.email}`] : []), `phone     ${PROFILE.phoneDisplay}`] };
    case 'hire':
      return { output: ['great choice. opening WhatsApp… 🚀'], action: { open: `https://wa.me/${PROFILE.phoneIntl}` } };
    case 'sudo':
      return { output: ['permission granted.', 'type "hire" to finish the job.'] };
    case 'rm':
      return { output: ['nice try 😄'] };
    case 'clear':
      return { output: [], action: 'clear' };
    case 'exit':
    case 'quit':
      return { output: [], action: 'close' };
    default:
      return { output: [`command not found: ${cmd}. try "help"`] };
  }
};
