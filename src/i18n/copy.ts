import type { ChapterId, LinkKind, WorldId } from '../config/content';

export type Lang = 'en' | 'he';

export interface ChapterCopy {
  world: string;
  tagline: string;
  beats: [string, string, string?];
  story: string;
  highlights: string[];
}

export interface Copy {
  dir: 'ltr' | 'rtl';
  name: string;
  role: string;
  title: string;
  description: string;
  langSwitch: string;
  nav: { work: string; about: string; contact: string; terminal: string };
  loader: { top: string; bottom: string };
  intro: { meta: [string, string]; roleLine: string; cue: string; thesis: [string, string, string] };
  chapter: { worldsLabel: string; stackLabel: string; privateRepo: string };
  links: Record<LinkKind, string>;
  worlds: Record<WorldId, string>;
  hud: string;
  chapters: Record<ChapterId, ChapterCopy>;
  about: {
    eyebrow: string;
    title: [string, string, string]; // line 1, line 2 lead, line 2 accent
    lead: string;
    timeline: { when: string; what: string; note: string }[];
    skills: Record<'frontend' | 'backend' | 'cloud' | 'automation', string>;
  };
  contact: {
    eyebrow: string;
    title: [string, string, string];
    sub: string;
    email: string;
    whatsapp: string;
    cv: string;
    made: string;
    devHint: string;
  };
  hubDemo: {
    caption: string;
    manager: { to: string; subject: string; project: [string, string]; dept: [string, string]; budget: [string, string]; cta: string };
    employee: { to: string; subject: string; note: string; cta: string };
    now: string;
  };
  botDemo: { published: string; chat: string; comment: [string, string, string]; dm: string; tap: string; check: string; content: string; open: string; postAlt: string };
}

const en: Copy = {
  dir: 'ltr',
  name: 'Neria Okabi',
  role: 'Full-Stack Developer',
  title: 'Neria Okabi · Full-Stack Developer',
  description: 'Neria Okabi, full-stack developer. From dog training to building software: five projects, five worlds.',
  langSwitch: 'עב',
  nav: { work: 'Work', about: 'About', contact: 'Contact', terminal: 'Open terminal' },
  loader: { top: 'Neria Okabi · Portfolio', bottom: 'Loading five worlds' },
  intro: {
    meta: ['Portfolio', 'Israel · Open to work'],
    roleLine: '— from training dogs to building software.',
    cue: 'Scroll to enter the worlds',
    thesis: ['Five projects.', 'Five worlds.', 'each one opened the next.'],
  },
  chapter: { worldsLabel: 'Worlds this project opened', stackLabel: 'Stack', privateRepo: 'Private repository · code walkthrough on request' },
  links: { live: 'Live app', site: 'Live site', github: 'GitHub', instagram: 'Instagram @neria.tech' },
  worlds: {
    mobile: 'Mobile Apps',
    ai: 'AI Integration',
    product: 'Product & Gamification',
    'cloud-auth': 'Auth & Cloud',
    i18n: 'i18n · RTL',
    enterprise: 'Enterprise · B2B',
    mern: 'Full-Stack MERN',
    automation: 'Automation',
    rbac: 'Role-Based Security',
    dashboards: 'Data Dashboards',
    'social-apis': 'Social Platform APIs',
    edge: 'Serverless Edge',
    'oauth-mcp': 'OAuth 2.1 · MCP',
    events: 'Event-Driven Systems',
    clients: 'Real Clients',
    ecommerce: 'E-commerce',
    seo: 'SEO · Link Previews',
    cms: 'Admin CMS',
    'creative-fe': 'Creative Frontend',
    'motion-3d': '3D & Motion',
    api: 'Third-Party APIs',
    state: 'State Management',
  },
  hud: 'Worlds unlocked',
  chapters: {
    dog: {
      world: 'The Field',
      tagline: 'A dog-training app, built by a former therapeutic dog handler.',
      beats: ['I came from', 'the world of dog training.', 'So I built it in code.'],
      story:
        'Before I wrote code, I trained dogs for a living, including work with service dogs for people with PTSD. This app turns that experience into a product: structured training levels, a practice journal, streaks and badges, and an AI training assistant that answers like a real trainer.',
      highlights: [
        'AI training assistant on a Cloudflare Worker, with an automatic local fallback',
        'Gamified progress: levels, streaks, weekly challenge, shareable certificate',
        'Supabase auth with email and Google sign-in, plus an offline demo mode',
        'Hebrew / English with full RTL, dark mode, PWA and daily reminders',
      ],
    },
    hub: {
      world: 'The Machine',
      tagline: 'A project-request portal for PMO teams, with approvals and automation.',
      beats: ['Requests in.', 'Decisions out.', 'Automated.'],
      story:
        'Employees submit project requests, the right manager approves them, and the PMO tracks budgets and overdue projects from one dashboard. Permissions are enforced by the API, and every decision triggers an automated email flow.',
      highlights: [
        'Status workflow enforced on the server, three roles with real access control',
        'Make automation: request.created / request.decided events → email flows',
        'Data model designed to map 1:1 onto SharePoint and Microsoft 365',
      ],
    },
    bot: {
      world: 'The Feed',
      tagline: 'The automation behind my Instagram page @neria.tech: a comment-to-DM bot and a Make publishing pipeline.',
      beats: ['One comment.', 'One message.', 'One more follower.'],
      story:
        'Someone comments a keyword, the bot sends a private message, checks that they follow the account, and delivers the content once. It runs on the edge, serves its own React admin, and exposes an MCP connector so campaigns can be managed straight from Claude. The page itself publishes on autopilot: posts wait in a GitHub queue and a Make scenario publishes the approved ones four times a week.',
      highlights: [
        'Meta webhooks with signature verification, encrypted tokens that refresh themselves',
        'MCP server with OAuth 2.1: campaigns are drafted off and need explicit approval',
        'Make publishing pipeline: GitHub content queue → approved posts go live Sun · Tue · Thu · Sat at 19:30',
      ],
    },
    dvora: {
      world: 'The Atelier',
      tagline: 'A mobile-first store for a natural-oils maker, with WhatsApp checkout.',
      beats: ['Real clients.', 'Real orders.'],
      story:
        'A store built for a real small business. Customers browse, tap "buy on WhatsApp" and land in a chat with a ready message and a rich product preview. The owner manages products and photos from her own admin.',
      highlights: [
        'Per-product link previews: the Worker writes og: tags because WhatsApp runs no JavaScript',
        'Products in D1, photos in Workers KV, one deploy for site and API',
        'Admin area for products, prices and photos, no developer needed',
      ],
    },
    library: {
      world: 'The Archive',
      tagline: 'A Google Books archive presented as a 3D curved shelf.',
      beats: ['And when I play,', 'I build in 3D.'],
      story:
        'A personal library where search results become physical books on a curved CSS-3D shelf. The active book turns to face you, a year timeline runs underneath, and every interaction has motion.',
      highlights: [
        'Pure CSS 3D, no WebGL: generated spines, rotating covers, floating detail view',
        'Arrows, keyboard, wheel, drag and swipe; shareable search in the URL',
        'RTK Query for Google Books, persisted wish list, reduced-motion aware',
      ],
    },
  },
  about: {
    eyebrow: 'About',
    title: ['Before code,', 'I trained', 'dogs.'],
    lead:
      'Training a dog and building software turned out to be the same craft: break a big goal into small, clear steps, watch how people actually behave, and keep iterating until it works. I build complete products, from the first sketch to production, and I care as much about the motion of a button as about the shape of the API behind it.',
    timeline: [
      { when: '2017 – 2020', what: 'IDF · Defence Sector', note: 'Responsibility, discipline and working under pressure.' },
      { when: 'Before code', what: 'Certified Therapeutic Dog Handler', note: 'Training therapy and service dogs, including work with service dogs for people with PTSD. Patience, reading behaviour, step-by-step progress.' },
      { when: '640 hours', what: 'Full-Stack Bootcamp · Coding Academy', note: 'MERN, TypeScript, SOLID and Agile, end to end.' },
      { when: 'Today', what: 'Full-Stack Developer', note: 'Products for clients and for myself: web, mobile, edge, automation and AI.' },
    ],
    skills: { frontend: 'Frontend', backend: 'Backend', cloud: 'Cloud & tools', automation: 'Automation & AI' },
  },
  contact: {
    eyebrow: 'Contact',
    title: ['Let’s build', 'the next', 'world.'],
    sub: 'Open to full-stack and frontend roles. I reply fast.',
    email: 'Email',
    whatsapp: 'WhatsApp',
    cv: 'Download CV',
    made: 'React · TypeScript · GSAP · raw WebGL',
    devHint: 'Developers: press',
  },
  hubDemo: {
    caption: 'Illustration of the real Make flow · example data',
    manager: { to: 'To: Dana (manager)', subject: 'New project request is waiting for your approval', project: ['Project', 'CRM migration'], dept: ['Department', 'Sales'], budget: ['Budget', '₪48,000'], cta: 'Review request' },
    employee: { to: 'To: Yoav (employee)', subject: 'Your request was approved ✓', note: '“Approved. Let’s start in Q1.” — Dana', cta: 'Open in ProjectHub' },
    now: 'now',
  },
  botDemo: {
    published: 'Published by Make · Sun · Tue · Thu · Sat 19:30',
    chat: 'Business chat',
    comment: ['@maya.dev', 'commented', '"GUIDE" on your post'],
    dm: 'Hey! Here’s the guide you asked for 👇',
    tap: 'Send it to me',
    check: 'follower verified · first delivery',
    content: 'Enjoy 🎁',
    open: 'Open the guide ↗',
    postAlt: 'A real post from @neria.tech',
  },
};

const he: Copy = {
  dir: 'rtl',
  name: 'נריה עוקבי',
  role: 'מפתח Full-Stack',
  title: 'נריה עוקבי · מפתח Full-Stack',
  description: 'נריה עוקבי, מפתח Full-Stack. מאילוף כלבים לבניית תוכנה: חמישה פרויקטים, חמישה עולמות.',
  langSwitch: 'EN',
  nav: { work: 'עבודות', about: 'עליי', contact: 'צור קשר', terminal: 'פתיחת טרמינל' },
  loader: { top: 'נריה עוקבי · פורטפוליו', bottom: 'טוען חמישה עולמות' },
  intro: {
    meta: ['פורטפוליו', 'ישראל · פתוח להצעות'],
    roleLine: '— מאילוף כלבים לבניית תוכנה.',
    cue: 'גללו כדי להיכנס לעולמות',
    thesis: ['חמישה פרויקטים.', 'חמישה עולמות.', 'כל אחד פתח את הבא.'],
  },
  chapter: { worldsLabel: 'העולמות שהפרויקט הזה פתח', stackLabel: 'טכנולוגיות', privateRepo: 'ריפו פרטי · אשמח להציג את הקוד בראיון' },
  links: { live: 'אפליקציה חיה', site: 'אתר חי', github: 'GitHub', instagram: 'Instagram @neria.tech' },
  worlds: {
    mobile: 'אפליקציות מובייל',
    ai: 'שילוב AI',
    product: 'מוצר ומשחוק',
    'cloud-auth': 'הזדהות וענן',
    i18n: 'רב־לשוניות · RTL',
    enterprise: 'ארגוני · B2B',
    mern: 'Full-Stack MERN',
    automation: 'אוטומציות',
    rbac: 'אבטחה מבוססת תפקידים',
    dashboards: 'דשבורדים ונתונים',
    'social-apis': 'APIs של רשתות חברתיות',
    edge: 'Serverless Edge',
    'oauth-mcp': 'OAuth 2.1 · MCP',
    events: 'מערכות מבוססות אירועים',
    clients: 'לקוחות אמיתיים',
    ecommerce: 'מסחר מקוון',
    seo: 'SEO ותצוגות קישור',
    cms: 'ממשק ניהול תוכן',
    'creative-fe': 'פרונטאנד יצירתי',
    'motion-3d': 'תלת־ממד ותנועה',
    api: 'APIs חיצוניים',
    state: 'ניהול State',
  },
  hud: 'עולמות שנפתחו',
  chapters: {
    dog: {
      world: 'השדה',
      tagline: 'אפליקציית אילוף כלבים, שנבנתה על ידי מאלף כלבים טיפוליים לשעבר.',
      beats: ['באתי', 'מעולם אילוף הכלבים.', 'אז בניתי אותו בקוד.'],
      story:
        'לפני שכתבתי קוד, אילפתי כלבים למחייתי, כולל עבודה עם כלבי שירות לנפגעי PTSD. האפליקציה הופכת את הניסיון הזה למוצר: רמות אילוף מובנות, יומן אימונים, רצפים ותגים, ועוזר אילוף מבוסס AI שעונה כמו מאלף אמיתי.',
      highlights: [
        'עוזר אילוף AI על Cloudflare Worker, עם גיבוי מקומי אוטומטי',
        'התקדמות במשחוק: רמות, רצפים, אתגר שבועי ותעודה לשיתוף',
        'התחברות עם Supabase באימייל וב־Google, ומצב הדגמה שעובד גם בלי שרת',
        'עברית ואנגלית עם RTL מלא, מצב כהה, PWA ותזכורות יומיות',
      ],
    },
    hub: {
      world: 'המכונה',
      tagline: 'פורטל בקשות פרויקט לצוותי PMO, עם אישורים ואוטומציות.',
      beats: ['בקשות נכנסות.', 'החלטות יוצאות.', 'באופן אוטומטי.'],
      story:
        'עובדים מגישים בקשות לפרויקטים, המנהל הנכון מאשר, וה־PMO עוקב אחרי תקציבים ופרויקטים באיחור מדשבורד אחד. ההרשאות נאכפות בשרת, וכל החלטה מפעילה זרימת מיילים אוטומטית.',
      highlights: [
        'תהליך סטטוסים שנאכף בשרת, ושלושה תפקידים עם בקרת גישה אמיתית',
        'אוטומציה ב־Make: אירועי request.created / request.decided שולחים מיילים',
        'מודל נתונים שתוכנן להתאים 1:1 ל־SharePoint ול־Microsoft 365',
      ],
    },
    bot: {
      world: 'הפיד',
      tagline: 'האוטומציה מאחורי עמוד האינסטגרם שלי ‎@neria.tech: בוט תגובה־להודעה וצינור פרסום ב־Make.',
      beats: ['תגובה אחת.', 'הודעה אחת.', 'עוד עוקב אחד.'],
      story:
        'מישהו מגיב במילת מפתח, הבוט שולח לו הודעה פרטית, בודק שהוא עוקב אחרי העמוד ומעביר לו את התוכן פעם אחת. הבוט רץ על ה־Edge, מגיש ממשק ניהול משלו ב־React, וחושף connector מסוג MCP לניהול קמפיינים ישירות מ־Claude. גם העמוד עצמו מתפרסם על טייס אוטומטי: הפוסטים מחכים בתור ב־GitHub, ו־Make מפרסם את המאושרים ארבע פעמים בשבוע.',
      highlights: [
        'Webhooks של Meta עם אימות חתימה, וטוקנים מוצפנים שמתחדשים לבד',
        'שרת MCP עם OAuth 2.1: קמפיינים נשמרים כבויים ודורשים אישור מפורש',
        'צינור פרסום ב־Make: תור תוכן ב־GitHub, והפוסטים המאושרים עולים בימים א׳ ג׳ ה׳ ובמוצ״ש ב־19:30',
      ],
    },
    dvora: {
      world: 'הסדנה',
      tagline: 'חנות מותאמת למובייל ליצרנית שמנים טבעיים, עם רכישה דרך וואטסאפ.',
      beats: ['לקוחות אמיתיים.', 'הזמנות אמיתיות.'],
      story:
        'חנות שנבנתה לעסק קטן אמיתי. הלקוחות גוללים, לוחצים על "לקנייה בוואטסאפ" ומגיעים לצ׳אט עם הודעה מוכנה ותצוגה עשירה של המוצר. בעלת העסק מנהלת מוצרים ותמונות מממשק ניהול משלה.',
      highlights: [
        'תצוגת קישור לכל מוצר: ה־Worker כותב תגיות og:‎ כי וואטסאפ לא מריץ JavaScript',
        'מוצרים ב־D1, תמונות ב־Workers KV, ופריסה אחת לאתר ול־API',
        'ממשק ניהול למוצרים, מחירים ותמונות, בלי צורך במפתח',
      ],
    },
    library: {
      world: 'הארכיון',
      tagline: 'ארכיון ספרים מ־Google Books שמוצג כמדף קשתי בתלת־ממד.',
      beats: ['וכשאני משחק,', 'אני בונה בתלת־ממד.'],
      story:
        'ספרייה אישית שבה תוצאות החיפוש הופכות לספרים פיזיים על מדף קשתי ב־CSS 3D. הספר הפעיל מסתובב אליך, ציר שנים רץ מתחת, ולכל אינטראקציה יש תנועה.',
      highlights: [
        'CSS 3D טהור, בלי WebGL: שדרות שנוצרות אוטומטית, עטיפות מסתובבות ותצוגת פרטים מרחפת',
        'חיצים, מקלדת, גלגלת, גרירה והחלקה, וחיפוש שנשמר בכתובת לשיתוף',
        'RTK Query מול Google Books, רשימת משאלות שנשמרת, ותמיכה בהעדפת פחות תנועה',
      ],
    },
  },
  about: {
    eyebrow: 'עליי',
    title: ['לפני הקוד,', 'אילפתי', 'כלבים.'],
    lead:
      'התברר שאילוף כלב ובניית תוכנה הם אותה מלאכה: לפרק מטרה גדולה לצעדים קטנים וברורים, לראות איך אנשים מתנהגים באמת, ולשפר שוב ושוב עד שזה עובד. אני בונה מוצרים שלמים, מהסקיצה הראשונה ועד הפרודקשן, וחשובה לי התנועה של כפתור בדיוק כמו המבנה של ה־API שמאחוריו.',
    timeline: [
      { when: '2017 – 2020', what: 'שירות בצה״ל', note: 'אחריות, משמעת ועבודה תחת לחץ.' },
      { when: 'לפני הקוד', what: 'מאלף כלבים טיפוליים מוסמך', note: 'אילוף כלבי טיפול ושירות, כולל עבודה עם כלבי שירות לנפגעי PTSD. סבלנות, קריאת התנהגות והתקדמות צעד אחר צעד.' },
      { when: '640 שעות', what: 'בוטקמפ Full-Stack · Coding Academy', note: 'MERN, ‏TypeScript, ‏SOLID ו־Agile, מקצה לקצה.' },
      { when: 'היום', what: 'מפתח Full-Stack', note: 'מוצרים ללקוחות ולעצמי: ווב, מובייל, Edge, אוטומציות ו־AI.' },
    ],
    skills: { frontend: 'Frontend', backend: 'Backend', cloud: 'ענן וכלים', automation: 'אוטומציות ו־AI' },
  },
  contact: {
    eyebrow: 'צור קשר',
    title: ['בואו נבנה', 'את העולם', 'הבא.'],
    sub: 'פתוח לתפקידי Full-Stack ו־Frontend. עונה מהר.',
    email: 'אימייל',
    whatsapp: 'וואטסאפ',
    cv: 'הורדת קורות חיים',
    made: 'React · TypeScript · GSAP · raw WebGL',
    devHint: 'מתכנתים? לחצו',
  },
  hubDemo: {
    caption: 'הדגמה של זרימת ה־Make האמיתית · נתוני דוגמה',
    manager: { to: 'אל: דנה (מנהלת)', subject: 'בקשת פרויקט חדשה ממתינה לאישורך', project: ['פרויקט', 'מעבר ל־CRM'], dept: ['מחלקה', 'מכירות'], budget: ['תקציב', '₪48,000'], cta: 'לצפייה בבקשה' },
    employee: { to: 'אל: יואב (עובד)', subject: 'הבקשה שלך אושרה ✓', note: '״מאושר. מתחילים ברבעון הראשון.״ — דנה', cta: 'פתיחה ב־ProjectHub' },
    now: 'עכשיו',
  },
  botDemo: {
    published: 'מתפרסם ע״י Make · א׳ ג׳ ה׳ ומוצ״ש 19:30',
    chat: 'צ׳אט עסקי',
    comment: ['@maya.dev', 'הגיבה', '"מדריך" על הפוסט שלך'],
    dm: 'היי! הנה המדריך שביקשת 👇',
    tap: 'שלחו לי',
    check: 'עוקב מאומת · מסירה ראשונה',
    content: 'תהנו 🎁',
    open: 'לפתיחת המדריך ↗',
    postAlt: 'פוסט אמיתי מ־‎@neria.tech',
  },
};

export const COPY: Record<Lang, Copy> = { en, he };
