/**
 * All portfolio content. Components only render what is defined here.
 *
 * Content rules
 * - Only real, checked links. No invented metrics, clients, roles, or availability.
 * - `contribution` is shown only when Tyr's part is verified; otherwise it stays null.
 * - Project ids are stable — the board order and detail panel key off them.
 */

export const SITE = {
  name: 'Tyr',
  org: 'CommandOSS',
  role: 'Tools for Sui builders',
  /** Shown once, beneath the hero description. Affiliation only — not employment by Mysten Labs. */
  affiliation: 'Currently part of CommandOSS, building tools for the Mysten ecosystem.',
  headline: 'I build tools for people building on Sui.',
  description:
    'Developer tooling, agent skills, and infrastructure—from the first idea to a working product.',
  stageLabels: ['Move', 'Walrus', 'Agent Skills', 'Developer Tools'],
};

/** Leave `email` empty until a real address exists; the contact section hides it. */
export const LINKS = {
  email: '',
  github: { href: 'https://github.com/CommandOSSLabs', label: 'CommandOSS on GitHub' },
  skillsHub: { href: 'https://skills.commandoss.com/', label: 'Skills hub' },
  aiDevkitSource: { href: 'https://github.com/CommandOSSLabs/ai-devkit', label: 'AI DevKit source' },
};

export const NAV_ITEMS = [
  { id: 'home', label: 'Intro' },
  { id: 'stories', label: 'Selected work' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'explore', label: 'Explore' },
  { id: 'contact', label: 'Contact' },
];

/** Board columns — factual categories, not progress states. */
export const CATEGORIES = [
  {
    id: 'agent',
    title: 'Agent workflows',
    description: 'Skills, docs, and payments that coding agents can use.',
    accent: 'agent',
  },
  {
    id: 'sui',
    title: 'Sui tooling',
    description: 'Interfaces and CI for working with the Sui CLI and Move.',
    accent: 'sui',
  },
  {
    id: 'walrus',
    title: 'Walrus applications',
    description: 'Apps, memory, and SDKs built on Walrus storage.',
    accent: 'walrus',
  },
];

/**
 * Projects. `featured` cards get a preview image on the board.
 *
 * Identity (`mark`) — every asset is sourced, never drawn for the project:
 * - `src`: compact symbol for 40–48px tiles; `dark`: official/inheriting light variant for
 *   Midnight Sui; `pad`: optical padding inside the tile (px); `bleed`: the asset is itself
 *   a filled square, so it fills the tile; `source`: where the file came from.
 * - Projects with no verified symbol have `mark: null` and get the neutral category symbol.
 * - `wordmark`: a long logotype, shown only at readable width (details panel).
 * - `preview`: real interface crop for featured cards (captured from the live site).
 * - `techName`: exact package / action / repo name, shown as metadata when `title` is a
 *   friendlier display label.
 */
export const PROJECTS = [
  {
    id: 'ai-devkit',
    title: 'AI DevKit',
    category: 'agent',
    featured: true,
    mark: { src: '/projects/ai-devkit.svg', pad: 4, source: 'commandoss.com/assets/projects/ai-devkit.svg' },
    preview: { src: '/previews/ai-devkit.webp', caption: 'Screenshot · skills.commandoss.com' },
    tagline: 'Agent skills and delivery workflows for humans and coding agents.',
    tags: ['Agent skills', 'Docs', 'Delivery'],
    url: 'https://skills.commandoss.com/',
    repo: 'https://github.com/CommandOSSLabs/ai-devkit',
    details: {
      does: 'Evolvable agent skills spanning requirements, design, decisions, and delivery, synced through a living /docs layer that both people and agents read.',
      problem:
        'Coding agents only follow a team’s process if that process is written down as steps they can load. AI DevKit packages it as installable skills.',
      contribution: 'Tyr ships skills under CommandOSS.',
      tech: [
        'Install with `npx skills add CommandOSSLabs/ai-devkit`',
        'Skills include cmk:sui-sdk, cmk:sui-devstack, cmk:delivery-pipeline, cmk:delivery-review, cmk:codebase-docs, cmk:adr',
      ],
    },
  },
  {
    id: 'cmdocs',
    title: 'Cmdocs',
    category: 'agent',
    mark: { src: '/projects/cmdocs.svg', dark: '/projects/cmdocs-dark.svg', pad: 9, source: 'cmdocs.sh/logo/light-logo-only.svg · dark-logo-only.svg' },
    tagline: 'A documentation platform that builds from docs.json and MDX.',
    tags: ['Docs', 'MDX'],
    url: 'https://cmdocs.sh/',
    details: {
      does: 'A documentation platform by CommandOSS. It reads your docs.json and MDX files and publishes a docs site.',
      problem: 'Docs sites often need their own setup before anyone writes a page. Cmdocs builds from files that already live in the repo.',
      contribution: null,
      tech: ['Inputs: docs.json + MDX'],
    },
  },
  {
    id: 'suipay',
    title: 'SuiPay',
    category: 'agent',
    mark: { src: '/projects/sui-agent-payments.svg', bleed: true, source: 'sui.io/agentpayments/icon.svg' },
    tagline: 'Give an AI agent a budget and let it pay for the APIs it calls.',
    tags: ['Agent payments', 'USDC', 'Sui'],
    url: 'https://www.sui.io/agentpayments',
    details: {
      does: 'Set a budget and let your AI agent buy the APIs it needs. Payments settle per call in USDC on Sui.',
      problem: 'Agents can’t sign up for accounts or manage API keys. SuiPay lets them pay per call within a budget, with no accounts and no keys.',
      contribution: null,
      tech: ['Per-call settlement in USDC on Sui'],
    },
  },
  {
    id: 'sui-cli-web',
    title: 'Sui CLI Web',
    category: 'sui',
    featured: true,
    mark: { src: '/projects/sui-cli-web.png', pad: 8, source: 'sui-cli.dev/sui-logo.png' },
    preview: { src: '/previews/sui-cli-web.webp', caption: 'Screenshot · sui-cli.dev' },
    tagline: 'A browser interface for learning and using Sui CLI workflows.',
    tags: ['TypeScript', 'Sui CLI', 'DX'],
    url: 'https://sui-cli.dev/',
    repo: 'https://github.com/CommandOSSLabs/sui-cli-web',
    details: {
      does: 'A keyboard-first web interface for the Sui CLI. It runs against your own sui binary and ~/.sui config.',
      problem: 'The Sui CLI covers everything but asks you to remember a lot of commands. This puts the same workflows in a browser UI while private keys stay on your machine.',
      contribution: null,
      tech: ['Uses the local sui binary and ~/.sui config', 'Keys never leave the machine'],
    },
  },
  {
    id: 'setup-sui-cli',
    title: 'Set up Sui CLI in CI',
    category: 'sui',
    techName: 'setup-sui-cli',
    mark: { src: '/brand-commandoss-mark.svg', pad: 9, invertDark: true, source: 'CommandOSSLabs GitHub org mark (publisher)' },
    tagline: 'GitHub Action that installs the Sui CLI and configures a deployer wallet.',
    tags: ['GitHub Actions', 'CI'],
    repo: 'https://github.com/marketplace/actions/setup-sui-cli',
    details: {
      does: 'Installs a specific Sui CLI release in CI and can import a deployer key for mainnet or testnet.',
      problem: 'CI jobs need the right Sui CLI version, and often a funded wallet, before they can build, test, or publish Move packages.',
      contribution: null,
      tech: ['`uses: CommandOSSLabs/setup-sui-cli@v1`', 'Linux, macOS, and Windows runners'],
    },
  },
  {
    id: 'deploy-sui',
    title: 'Deploy Move packages',
    category: 'sui',
    techName: 'deploy-sui-smart-contract',
    mark: { src: '/brand-commandoss-mark.svg', pad: 9, invertDark: true, source: 'CommandOSSLabs GitHub org mark (publisher)' },
    tagline: 'GitHub Action that publishes or upgrades a Move package.',
    tags: ['Move', 'CI'],
    repo: 'https://github.com/marketplace/actions/deploy-sui-smart-contract',
    details: {
      does: 'Publishes or upgrades a Sui Move package with the Sui CLI, choosing upgrade or fresh publish from Published.toml.',
      problem: 'Publishing and upgrading Move packages by hand is easy to get wrong. This makes it a repeatable CI step with safe-upgrade modes.',
      contribution: null,
      tech: ['Modes: auto, force-publish, safe-upgrade-only', 'Runs after setup-sui-cli'],
    },
  },
  {
    id: 'memwal',
    title: 'MemWal',
    category: 'walrus',
    featured: true,
    mark: { src: '/projects/memwal-mark.svg', pad: 9, source: 'memory.walrus.xyz/walrus-memory-favicon.svg' },
    wordmark: { src: '/projects/memwal.svg', source: 'commandoss.com/assets/projects/memwal-logo.svg' },
    preview: { src: '/previews/memwal.webp', caption: 'Screenshot · memory.walrus.xyz' },
    tagline: 'Long-term, verifiable memory for AI agents, stored on Walrus.',
    tags: ['Walrus', 'Sui', 'Agents'],
    url: 'https://memory.walrus.xyz/',
    repo: 'https://github.com/MystenLabs/MemWal',
    details: {
      does: 'A long-term, verifiable memory layer on Walrus that lets agents remember, share, and reuse information reliably.',
      problem: 'Agents lose context between sessions, and memory kept in one vendor’s database is hard to verify or share. MemWal keeps it on Walrus.',
      contribution: null,
      tech: ['Rust · Sui · Walrus · PostgreSQL'],
    },
  },
  {
    id: 'walform',
    title: 'WalForm',
    category: 'walrus',
    mark: { src: '/projects/walform.svg', pad: 8, source: 'walform.wal.app/icon.svg' },
    tagline: 'Form builder on Walrus with encrypted submissions.',
    tags: ['Walrus', 'Mainnet'],
    url: 'https://walform.wal.app/',
    details: {
      does: 'A decentralized form builder on Walrus with end-to-end encrypted submissions, sponsored gas, and one-click publish to its own Walrus Site.',
      problem: 'Collecting responses usually means trusting a hosted form service with the data. WalForm encrypts submissions end to end, stores them on Walrus, and charges no platform fee.',
      contribution: null,
      tech: ['End-to-end encrypted submissions', 'Sponsored gas'],
    },
  },
  {
    id: 'wal-0',
    title: 'Wal-0',
    category: 'walrus',
    mark: { src: '/projects/wal-0.svg', dark: '/projects/wal-0-dark.svg', pad: 7, source: 'commandoss.com (#portfolio, Wal-0 mark)' },
    tagline: 'Build, edit, and deploy Walrus Sites with AI.',
    tags: ['AI', 'Walrus Sites'],
    url: 'https://wal-0.commandoss.com/',
    details: {
      does: 'Turns ideas into live apps or websites with AI, then deploys them as Walrus Sites.',
      problem: 'AI site builders usually host your result on their own platform. Wal-0 deploys to Walrus Sites so the site outlives any single platform.',
      contribution: null,
      tech: ['Deploys to Walrus Sites'],
    },
  },
  {
    id: 'walrus-console',
    title: 'Walrus Console',
    category: 'walrus',
    mark: { src: '/projects/walrus-icon.png', pad: 9, invertDark: true, source: 'walrus.xyz/favicon-196x196.png' },
    tagline: 'Upload, manage, and share data on Walrus from one console.',
    tags: ['Storage', 'Walrus'],
    url: 'https://console.walrus.xyz/',
    details: {
      does: 'Decentralized storage for teams and individuals: upload, manage, and share data on Walrus from one console.',
      problem: 'Working with Walrus storage directly means CLIs and SDKs. The console gives teams a web interface for the same tasks.',
      contribution: null,
      tech: ['Web console for Walrus storage'],
    },
  },
  {
    id: 'rememe',
    title: 'ReMeme',
    category: 'walrus',
    mark: { src: '/projects/rememe.svg', pad: 3, bg: '#0b0f0e', source: 'commandoss.com/assets/projects/rememe.svg (wordmark on its dark ground)' },
    wordmark: { src: '/projects/rememe.svg', source: 'commandoss.com/assets/projects/rememe.svg' },
    tagline: 'Create, tip, and remix memes as NFTs on Sui.',
    tags: ['Consumer', 'NFTs'],
    url: 'https://rememe.wal.app/',
    details: {
      does: 'Create, share, and earn from memes on Sui. Upload memes as NFTs, get tipped, and remix anyone’s.',
      problem: 'Memes get reshared without anything flowing back to whoever made them. ReMeme makes each one an NFT that can be tipped and remixed.',
      contribution: null,
      tech: ['Hosted as a Walrus Site (rememe.wal.app)'],
    },
  },
  {
    id: 'walrus-site-builder',
    title: 'Walrus Site Builder SDKs',
    category: 'walrus',
    techName: '@cmdoss/walrus-site-builder',
    mark: { src: '/brand-commandoss-mark.svg', pad: 9, invertDark: true, source: 'CommandOSSLabs GitHub org mark (publisher)' },
    tagline: 'TypeScript SDKs for deploying websites to Walrus and Sui.',
    tags: ['TypeScript', 'SDK'],
    repo: 'https://github.com/CommandOSSLabs/ts-sdks',
    details: {
      does: 'TypeScript SDKs and React hooks for building and deploying decentralized websites on Walrus + Sui, with a browser file manager.',
      problem: 'Shipping a Walrus Site from an app needs file handling, encoding, and on-chain steps. The SDKs wrap them in typed APIs.',
      contribution: null,
      tech: ['`npm install @cmdoss/walrus-site-builder`', '@cmdoss/walrus-site-builder-react · @cmdoss/file-manager'],
    },
  },
];

/**
 * "How I can help" demonstration: problem → approach → real project → inspectable evidence.
 *
 * Evidence rules: every `contribution` links to merged work by the GitHub account
 * `harrymove-ctrl` (owner of this portfolio's repository). Team projects stay team projects —
 * the copy says "contributed", never "built" or "owns".
 */
export const HELP = {
  eyebrow: 'How I can help',
  title: 'From a technical problem to something people can use.',
  intro: 'Explore the kinds of problems I work on—and the projects behind them.',
  problems: [
    {
      id: 'workflows',
      tab: 'Make developer workflows easier',
      tabNote: 'Put CLI-heavy work behind a clearer interface.',
      title: 'Make complex tools easier to use.',
      problem: 'CLI commands, configuration, and transaction steps can be difficult to navigate.',
      approach: 'Bring the workflow into a clearer interface with useful context and explicit actions.',
      usefulWhen: 'Useful when your team needs a Sui workflow that new developers can follow without memorising commands.',
      projectId: 'sui-cli-web',
      demo: {
        kind: 'screenshot',
        src: '/previews/sui-cli-web.webp',
        alt: 'Sui CLI Web command bar searching “transfer”, with results grouped into wallets, objects, and packages',
        caption: 'Screenshot · sui-cli.dev',
        explanation:
          'Typing “transfer” in the command bar searches wallets, objects, and packages at once, then offers the matching actions.',
        // Positions are percentages of the screenshot; each note is stated on sui-cli.dev or in the README.
        notes: [
          { x: 6, y: 51, label: 'One command bar for every Sui action' },
          { x: 6, y: 62, label: 'Results grouped by wallets, objects, and packages' },
          { x: 12, y: 28, label: 'Runs locally against your own sui binary and ~/.sui config' },
        ],
      },
      evidence: {
        contribution: 'Contributed the Move Studio entry flow and a server security pass (pairing-token auth, dead-code cleanup).',
        artifacts: [
          { label: 'Merged PR #4 · Move Studio entry flow', href: 'https://github.com/CommandOSSLabs/sui-cli-web/commit/b28f06f864d0f9ef11e605dbede3922f3a3351d7' },
          { label: 'Merged PR #5 · server security hardening', href: 'https://github.com/CommandOSSLabs/sui-cli-web/commit/9cf1ba2f11b4dd85255d4ae7b9bc18a74d2fd4f2' },
        ],
        primary: { label: 'Explore Sui CLI Web', href: 'https://sui-cli.dev/' },
        source: { label: 'View source', href: 'https://github.com/CommandOSSLabs/sui-cli-web' },
      },
    },
    {
      id: 'agents',
      tab: 'Give agents a clearer delivery process',
      tabNote: 'Package a team’s process as skills agents can load.',
      title: 'Turn a process into a workflow people can repeat.',
      problem: 'Requirements, implementation decisions, and review context can become scattered.',
      approach: 'Structure that context into reusable skills and linked documentation.',
      usefulWhen: 'Useful when your team needs coding agents to follow the same requirements-to-release steps your people do.',
      projectId: 'ai-devkit',
      demo: {
        kind: 'workflow',
        src: '/previews/ai-devkit.webp',
        alt: 'AI DevKit site: install panel with “npx skills add CommandOSSLabs/ai-devkit” and “Explore 32 skills”',
        caption: 'Screenshot · skills.commandoss.com',
        // Skill names and phrasings from the AI DevKit README and skill descriptions.
        stages: [
          { id: 'req', label: 'Requirements', skill: 'cmk:requirements', does: 'Drafts or updates requirements, scope, and user needs, saved under /docs.', prompt: 'We just discussed the billing system requirements — save that as requirements' },
          { id: 'design', label: 'Design', skill: 'cmk:design · cmk:adr', does: 'Writes system design and records decisions as ADRs with their rationale.', prompt: 'We decided to use event sourcing over CRUD for the audit trail — record that as an ADR' },
          { id: 'build', label: 'Implementation', skill: 'cmk:delivery-pipeline', does: 'Runs intake → spec → implement for a tracked ticket.', prompt: 'Work on TICKET-123' },
          { id: 'review', label: 'Review', skill: 'cmk:delivery-review', does: 'Reviews the change before it ships.', prompt: 'Review my changes' },
          { id: 'ship', label: 'Delivery', skill: 'cmk:delivery-ship', does: 'Opens the PR, pushes for review, or closes the ticket.', prompt: 'Ship this' },
        ],
      },
      evidence: {
        contribution: 'Contributed the skills explorer redesign with a relationship canvas, and security scanning in the CI/CD skill.',
        artifacts: [
          { label: 'Merged PR #24 · skills explorer + relationship canvas', href: 'https://github.com/CommandOSSLabs/ai-devkit/pull/24' },
          { label: 'Merged PR #26 · security scanning in cicd skill', href: 'https://github.com/CommandOSSLabs/ai-devkit/pull/26' },
        ],
        primary: { label: 'Explore the skills', href: 'https://skills.commandoss.com/' },
        source: { label: 'View source', href: 'https://github.com/CommandOSSLabs/ai-devkit' },
      },
    },
    {
      id: 'memory',
      tab: 'Build with persistent data',
      tabNote: 'Keep useful context beyond a single session.',
      title: 'Make information available beyond a single session.',
      problem: 'Applications and agents need a way to store and retrieve useful context.',
      approach: 'Connect application workflows to persistent storage and retrieval.',
      usefulWhen: 'Useful when your team needs agents or apps to recall what a user said in an earlier session.',
      projectId: 'memwal',
      demo: {
        kind: 'flow',
        // Terminology from the MemWal README: remember(), recall(), the relayer, Walrus.
        sampleInput: 'User prefers dark mode and uses TypeScript.',
        query: 'What are the user’s preferences?',
        nodes: {
          app: { title: 'Your app', detail: 'MemWal SDK' },
          relayer: { title: 'Relayer', detail: 'Embedding, encryption, Walrus upload, retrieval' },
          storage: { title: 'Walrus', detail: 'Stored memory blobs' },
        },
        stored: 'Embedded, encrypted memory',
      },
      evidence: {
        contribution: 'Contributed server fixes to recall and restore, including hiding forgotten memories from recall and making namespace restore atomic.',
        artifacts: [
          { label: 'Merged PR #885 · forgotten memories hidden from recall', href: 'https://github.com/MystenLabs/MemWal/pull/885' },
          { label: 'Merged PR #880 · atomic namespace restore', href: 'https://github.com/MystenLabs/MemWal/pull/880' },
        ],
        primary: { label: 'Explore MemWal', href: 'https://memory.walrus.xyz/' },
        source: { label: 'View source', href: 'https://github.com/MystenLabs/MemWal' },
      },
    },
  ],
};

/** "Inside my toolbox" tree. Leaves carry the preview content. */
export const TOOLBOX = [
  {
    id: 'commandoss',
    label: 'CommandOSS',
    children: [
      {
        id: 'tb-ai-devkit',
        label: 'AI DevKit',
        summary: 'Installable agent skills for the full delivery loop: requirements, design, decisions, and delivery, kept in sync with /docs.',
        related: 'Skills hub',
        href: 'https://skills.commandoss.com/',
        install: 'npx skills add CommandOSSLabs/ai-devkit',
      },
      {
        id: 'tb-delivery',
        label: 'Delivery workflows',
        summary: 'cmk:delivery-pipeline runs intake → spec → implement → review → ship; cmk:delivery-review adds a multi-lens review before anything ships.',
        related: 'AI DevKit source',
        href: 'https://github.com/CommandOSSLabs/ai-devkit',
        install: 'npx skills add CommandOSSLabs/ai-devkit',
      },
      {
        id: 'tb-docs',
        label: 'Documentation tools',
        summary: 'Cmdocs publishes docs from docs.json + MDX; cmk:codebase-docs writes agent-navigable maps under docs/ai/.',
        related: 'Cmdocs',
        href: 'https://cmdocs.sh/',
      },
    ],
  },
  {
    id: 'sui',
    label: 'Sui',
    children: [
      {
        id: 'tb-move',
        label: 'Move',
        summary: 'Sui’s smart contract language. Assets are typed objects with abilities, so they can’t be copied or dropped by accident.',
        related: 'The Move Book',
        href: 'https://move-book.com/',
      },
      {
        id: 'tb-ts-sdk',
        label: 'TypeScript SDK',
        summary: 'The @mysten/sui SDK for clients, wallets, and transactions. Sui CLI Web and cmk:sui-sdk build on the same model.',
        related: 'Sui TypeScript SDK docs',
        href: 'https://sdk.mystenlabs.com/typescript',
      },
      {
        id: 'tb-ptb',
        label: 'Programmable transactions',
        summary: 'Programmable Transaction Blocks chain many Move calls, splits, merges, and transfers into one atomic transaction.',
        related: 'Sui docs: PTBs',
        href: 'https://docs.sui.io/concepts/transactions/prog-txn-blocks',
      },
      {
        id: 'tb-ci',
        label: 'CI for Move',
        summary: 'Two CommandOSS GitHub Actions: install the Sui CLI with a deployer wallet, then publish or safely upgrade a Move package.',
        related: 'deploy-sui-smart-contract',
        href: 'https://github.com/marketplace/actions/deploy-sui-smart-contract',
        install: 'uses: CommandOSSLabs/setup-sui-cli@v1',
      },
      {
        id: 'tb-sui-skills',
        label: 'Official Sui skills',
        summary: 'Mysten’s curated skills for coding agents: object model, PTBs, Move security, Walrus Sites, zkLogin, publishing, and more.',
        related: 'docs.sui.io/skills',
        href: 'https://docs.sui.io/skills',
        install: 'npx skills add mystenlabs/skills --all',
      },
    ],
  },
  {
    id: 'walrus',
    label: 'Walrus',
    children: [
      {
        id: 'tb-storage',
        label: 'Storage',
        summary: 'Decentralized blob storage for the Sui stack. Walrus Console gives teams a web interface for uploading and sharing data.',
        related: 'Walrus docs',
        href: 'https://docs.wal.app/',
      },
      {
        id: 'tb-sites',
        label: 'Sites',
        summary: 'Websites served from Walrus with on-chain site objects. The Walrus Site Builder SDKs deploy them from TypeScript; Wal-0 does it with AI.',
        related: 'Walrus Site Builder SDKs',
        href: 'https://github.com/CommandOSSLabs/ts-sdks',
        install: 'npm install @cmdoss/walrus-site-builder',
      },
      {
        id: 'tb-memory',
        label: 'Memory integrations',
        summary: 'MemWal stores long-term agent memory on Walrus; the Walrus Memory plugin connects agents to it over MCP.',
        related: 'Walrus Memory plugin',
        href: 'https://github.com/CommandOSSLabs/walrus-memory-mcp-plugin',
      },
    ],
  },
];

/** "Explore Sui" playground cards (restored from the original diagonal stream). */
export const SUI_CONCEPTS = [
  {
    id: 'move',
    title: 'Move',
    brand: 'Language',
    subtitle: 'Safe smart contracts with resources',
    description: 'Sui’s contract language. Assets are typed values that can’t be copied or silently dropped.',
    href: 'https://move-book.com/',
    gradient: 'linear-gradient(155deg, #0b1c33 0%, #123a66 45%, #071018 100%)',
    accent: '#4da2ff',
    thumbText: 'move resource struct fun public entry ability key store ',
    rippleColor: '#6fbcf0',
    troughColor: '#1a4a8c',
    icon: '⬡',
  },
  {
    id: 'objects',
    title: 'Objects',
    brand: 'Model',
    subtitle: 'Ownable on-chain assets',
    description: 'Everything on Sui is an object with an ID and an owner: an address, another object, or shared.',
    href: 'https://docs.sui.io/concepts/object-model',
    gradient: 'linear-gradient(155deg, #1a2e14 0%, #2a4a18 45%, #0a1208 100%)',
    accent: '#c4f542',
    thumbText: 'object UID Transfer Cap Shared Owned Delete ',
    rippleColor: '#c4f542',
    troughColor: '#3d5c12',
    icon: '◆',
  },
  {
    id: 'ptb',
    title: 'PTB',
    brand: 'Transactions',
    subtitle: 'Programmable Tx Blocks',
    description: 'Compose many Move calls, splits, merges, and transfers into one atomic transaction.',
    href: 'https://docs.sui.io/concepts/transactions/prog-txn-blocks',
    gradient: 'linear-gradient(155deg, #1e1433 0%, #3b1f66 45%, #0c0818 100%)',
    accent: '#a78bfa',
    thumbText: 'PTB MoveCall TransferObjects SplitCoins MergeCoins ',
    rippleColor: '#c4b5fd',
    troughColor: '#5b21b6',
    icon: '⟫',
  },
  {
    id: 'walrus',
    title: 'Walrus',
    brand: 'Storage',
    subtitle: 'Decentralized blob storage',
    description: 'Store large blobs off-chain with on-chain references, coordinated by Sui.',
    href: 'https://docs.wal.app/',
    gradient: 'linear-gradient(155deg, #0a2428 0%, #0e4a52 45%, #061214 100%)',
    accent: '#22d3ee',
    thumbText: 'walrus blob quilt epoch storage committee ',
    rippleColor: '#67e8f9',
    troughColor: '#0e7490',
    icon: '◈',
  },
  {
    id: 'deepbook',
    title: 'DeepBook',
    brand: 'DEX',
    subtitle: 'On-chain CLOB liquidity',
    description: 'A native central limit order book that other Sui apps can trade against.',
    href: 'https://docs.sui.io/standards/deepbook',
    gradient: 'linear-gradient(155deg, #2a1220 0%, #5c1a3a 45%, #12080e 100%)',
    accent: '#f472b6',
    thumbText: 'DeepBook CLOB orderbook bid ask fill match ',
    rippleColor: '#f9a8d4',
    troughColor: '#9d174d',
    icon: '▣',
  },
  {
    id: 'zklogin',
    title: 'zkLogin',
    brand: 'Auth',
    subtitle: 'Web2 login → Sui wallets',
    description: 'Sign in with an OAuth provider and get a Sui address, backed by zero-knowledge proofs.',
    href: 'https://docs.sui.io/concepts/cryptography/zklogin',
    gradient: 'linear-gradient(155deg, #1a1430 0%, #312e81 45%, #0c0a18 100%)',
    accent: '#818cf8',
    thumbText: 'zkLogin OIDC JWT proof salt ephemeral key ',
    rippleColor: '#a5b4fc',
    troughColor: '#3730a3',
    icon: '◐',
  },
  {
    id: 'suins',
    title: 'SuiNS',
    brand: 'Identity',
    subtitle: 'Human-readable names',
    description: 'Readable .sui names that resolve to addresses and objects.',
    href: 'https://suins.io/',
    gradient: 'linear-gradient(155deg, #0f2418 0%, #14532d 45%, #06120c 100%)',
    accent: '#34d399',
    thumbText: 'SuiNS .sui name resolve register subdomain ',
    rippleColor: '#6ee7b7',
    troughColor: '#047857',
    icon: '◎',
  },
  {
    id: 'sdk',
    title: 'TS SDK',
    brand: 'Tooling',
    subtitle: '@mysten/sui for builders',
    description: 'Build clients, sign, and execute transactions from TypeScript.',
    href: 'https://sdk.mystenlabs.com/typescript',
    gradient: 'linear-gradient(155deg, #2a1c0a 0%, #92400e 45%, #120a04 100%)',
    accent: '#fbbf24',
    thumbText: 'SuiClient Transaction getObject dryRun execute ',
    rippleColor: '#fcd34d',
    troughColor: '#b45309',
    icon: '⚡',
  },
];

export const CONTACT = {
  heading: 'Have a difficult workflow? Let’s make it usable.',
  body: 'Sui tooling, agent workflows, and applications built around persistent data.',
};

/**
 * Selected project stories. Every claim links to something inspectable:
 * `decision` is documented in the project's README or a merged PR; `contribution` cites merged
 * PRs by `harrymove-ctrl`. `note` is the single annotation drawn on the screenshot
 * (x/y = arrow tip as % of the image; the label sits toward `side`).
 */
export const STORIES = [
  {
    projectId: 'ai-devkit',
    kicker: 'AI DevKit · Agent workflows',
    title: 'A team’s delivery process, packaged as skills an agent can load.',
    image: { src: '/previews/ai-devkit.webp', alt: 'AI DevKit install panel: npx skills add CommandOSSLabs/ai-devkit, with links to explore 32 skills', caption: 'skills.commandoss.com' },
    note: { x: 30, y: 52, side: 'right', label: 'One command installs the whole skill set' },
    problem: 'Coding agents only follow a team’s process when that process is written as steps they can load. Otherwise requirements, decisions, and review context stay scattered across chats.',
    decision: 'Documentation-first: skills write their results into the repo’s /docs, so people and agents read the same source of truth — and the skills are vendored so teams can adapt them and still sync upstream.',
    contribution: 'Redesigned the skills explorer with a relationship canvas (PR #24) and added security scanning to the CI/CD skill (PR #26).',
    links: [
      { label: 'Explore the skills', href: 'https://skills.commandoss.com/' },
      { label: 'PR #24', href: 'https://github.com/CommandOSSLabs/ai-devkit/pull/24' },
    ],
  },
  {
    projectId: 'sui-cli-web',
    kicker: 'Sui CLI Web · Sui tooling',
    title: 'Every Sui CLI action behind one keyboard-first command bar.',
    image: { src: '/previews/sui-cli-web.webp', alt: 'Sui CLI Web command bar searching “transfer”, with results grouped into wallets, objects, and packages', caption: 'sui-cli.dev' },
    note: { x: 14, y: 62, side: 'right', label: 'Results grouped by wallets, objects, packages' },
    problem: 'The Sui CLI can do everything, but reading its output is the hard part: addresses copied between terminals and object IDs hunted out of walls of JSON.',
    decision: 'It is not a wallet. A small local server shells out to your own sui binary and ~/.sui config; the browser only renders what comes back, so keys never leave the machine.',
    contribution: 'Contributed the Move Studio entry flow (PR #4) and a server security pass with pairing-token auth (PR #5).',
    links: [
      { label: 'Open Sui CLI Web', href: 'https://sui-cli.dev/' },
      { label: 'Source', href: 'https://github.com/CommandOSSLabs/sui-cli-web' },
    ],
  },
  {
    projectId: 'memwal',
    kicker: 'MemWal · Walrus applications',
    title: 'Agent memory that outlives the session and the app.',
    image: { src: '/previews/memwal.webp', alt: 'Walrus Memory sign-in: start building with portable memory across apps and workflows', caption: 'memory.walrus.xyz' },
    note: { x: 62, y: 33, side: 'right', label: 'Portable memory across apps and workflows' },
    problem: 'Agents lose context between sessions, and memory kept in one vendor’s database is hard to verify or move.',
    decision: 'Two calls: remember() and recall(). A relayer handles embedding, encryption, Walrus upload, and retrieval, so apps don’t carry that pipeline themselves.',
    contribution: 'Fixed recall returning forgotten memories (PR #885) and made namespace restore atomic (PR #880).',
    links: [
      { label: 'Explore MemWal', href: 'https://memory.walrus.xyz/' },
      { label: 'PR #885', href: 'https://github.com/MystenLabs/MemWal/pull/885' },
    ],
  },
];
