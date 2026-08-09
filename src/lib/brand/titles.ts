export const BUILDER_TITLES: string[] = [
  "Signal Over Noise",
  "Susegad Shipper",
  "Terminal Dweller",
  "Genesis Day Gremlin",
  "Ship-or-Ship",
  "Beach Deployer",
  "Latency Hater",
  "2:47 AM Committer",
  "Solana Surfer",
  "Midnight Architect",
  "Full-Stack Voyager",
  "Code & Feni",
  "Intentional Builder",
  "Bounty Hunter",
  "Async Master",
  "Residency Resident",
];

export const COMMON_STACKS: string[] = [
  "Full-Stack AI",
  "MERN / React",
  "Rust & Solana",
  "UI / UX Design",
  "iOS / Mobile",
  "ML / Python",
  "Smart Contracts",
  "Product & Growth",
];

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateTitle(name: string, stack: string, nonce: number = 0): string {
  const seed = simpleHash(`${name.trim().toLowerCase()}-${stack.trim().toLowerCase()}-${nonce}`);
  const index = seed % BUILDER_TITLES.length;
  return BUILDER_TITLES[index];
}

export function generateBadgeNumber(name: string, stack: string): string {
  const hash = simpleHash(`${name.trim()}:${stack.trim()}`);
  const num = (hash % 8999) + 1000;
  return `#247-${num}`;
}
