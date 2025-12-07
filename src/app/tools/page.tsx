"use client";
import { useUser } from '@/components/UserProvider';
import Link from 'next/link';

interface Tool {
  title: string;
  description: string;
  href: string;
  minTier: 'MEMBER' | 'BRONZE' | 'SILVER' | 'GOLD';
}

const tools: Tool[] = [
  {
    title: 'Post-level Builder',
    description: 'Create Post level governance forms.',
    href: '#',
    minTier: 'BRONZE',
  },
  {
    title: 'District-level Builder',
    description: 'Governance tools for your District.',
    href: '#',
    minTier: 'SILVER',
  },
  {
    title: 'Department-level Builder',
    description: 'Highest level governance builder.',
    href: '#',
    minTier: 'GOLD',
  },
  {
    title: 'Bylaws Builder',
    description: 'Draft and amend bylaws.',
    href: '#',
    minTier: 'BRONZE',
  },
  {
    title: 'Resolution Builder',
    description: 'Create resolutions and amendments.',
    href: '#',
    minTier: 'BRONZE',
  },
  {
    title: 'Meeting Simulator',
    description: 'Simulate meetings to learn procedures.',
    href: '#',
    minTier: 'BRONZE',
  },
  {
    title: 'Leadership Tools',
    description: 'Resources for leaders.',
    href: '#',
    minTier: 'BRONZE',
  },
  {
    title: 'Legislative Tracker',
    description: 'Track legislation relevant to your org.',
    href: '#',
    minTier: 'BRONZE',
  },
  {
    title: 'Article IX Suite',
    description: 'Create and manage Article IX cases.',
    href: '/cases',
    minTier: 'SILVER',
  },
];

function tierIndex(tier: string) {
  return ['MEMBER', 'BRONZE', 'SILVER', 'GOLD'].indexOf(tier);
}

export default function ToolsPage() {
  const { profile, loading, hasTierAtLeast } = useUser();
  if (loading) return <p>Loading...</p>;
  const userTier = profile?.membership_tier || 'MEMBER';
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tools</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const unlocked = hasTierAtLeast(tool.minTier as any);
          return (
            <div key={tool.title} className="p-4 border rounded-md bg-white shadow">
              <h3 className="font-semibold text-lg mb-1">{tool.title}</h3>
              <p className="text-sm text-neutral-600 mb-2">{tool.description}</p>
              {unlocked ? (
                <Link href={tool.href} className="inline-block px-3 py-1 rounded-md bg-primary text-white text-sm">
                  Open
                </Link>
              ) : (
                <button disabled className="inline-block px-3 py-1 rounded-md bg-neutral-300 text-neutral-600 text-sm cursor-not-allowed">
                  Locked ({tool.minTier})
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}