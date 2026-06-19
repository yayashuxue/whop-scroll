// Mock "my Whop campaigns" — pretend the logged-in creator owns these.
// In v2 this comes from the Whop API: /me/campaigns or /products.
export type MyCampaign = {
  id: string;
  name: string;
  product: string;
  priceUsd: number;
  members: number;
  emoji: string;
};

export const MY_CAMPAIGNS: MyCampaign[] = [
  {
    id: "campaign-prop",
    name: "Prop Trading Hub",
    product: "Daily plans + live mentoring",
    priceUsd: 49,
    members: 8214,
    emoji: "📈",
  },
  {
    id: "campaign-ai",
    name: "AI Creator Toolkit",
    product: "Prompt library + custom GPT + reel templates",
    priceUsd: 29,
    members: 1240,
    emoji: "🤖",
  },
  {
    id: "campaign-ecom",
    name: "Ecom Lab",
    product: "Weekly playbooks + supplier directory",
    priceUsd: 39,
    members: 3942,
    emoji: "🛒",
  },
];

// Composable creative types, ordered by the 80/20 default: creator/offering-
// authored creative leads, generic brand polish trails.
export type CreativeTypeOption = {
  id: "app_demo" | "community_intro" | "creator_video" | "proof_results" | "static_ad";
  title: string;
  subtitle: string;
  emoji: string;
  badge?: string;
};

export const CREATIVE_TYPES: CreativeTypeOption[] = [
  {
    id: "app_demo",
    title: "App demo",
    subtitle: "live mini-product surface · auto-generated",
    emoji: "📱",
    badge: "default",
  },
  {
    id: "community_intro",
    title: "Community intro",
    subtitle: "chat preview · member count · CTA to join",
    emoji: "💬",
  },
  {
    id: "creator_video",
    title: "Creator pitch video",
    subtitle: "30–60s vertical clip · creator-uploaded",
    emoji: "🎬",
  },
  {
    id: "proof_results",
    title: "Proof / results",
    subtitle: "screenshots · numbers · testimonials",
    emoji: "📊",
  },
  {
    id: "static_ad",
    title: "Static brand ad",
    subtitle: "polished poster · campaign-style · last resort",
    emoji: "🖼️",
  },
];

// Default vertical poster templates the creator can pick when they don't
// have their own video ready. Each template has a vibe + Ken Burns animation.
export type PosterTemplate = {
  id: string;
  label: string;
  posterUrl: string;
  vibe: string;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=720&h=1280&fit=crop&q=80&auto=format`;

export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: "neon-city",
    label: "Neon City",
    posterUrl: unsplash("1519501025264-65ba15a82390"),
    vibe: "trader · night vibe",
  },
  {
    id: "studio-light",
    label: "Studio Light",
    posterUrl: unsplash("1492684223066-81342ee5ff30"),
    vibe: "creator · podcast lighting",
  },
  {
    id: "minimal-desk",
    label: "Minimal Desk",
    posterUrl: unsplash("1499951360447-b19be8fe80f5"),
    vibe: "founder · clean focus",
  },
  {
    id: "open-laptop",
    label: "Open Laptop",
    posterUrl: unsplash("1517694712202-14dd9538aa97"),
    vibe: "builder · code-cast",
  },
];
