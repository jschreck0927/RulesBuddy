"use client";
import Link from 'next/link';
import { useUser } from '@/components/UserProvider';
import TierBadge from '@/components/TierBadge';

export default function HomePage() {
  const { profile, user, loading } = useUser();
  if (loading) {
    return <p>Loading...</p>;
  }
  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Welcome to RulesBuddy</h1>
        <p>Please sign in to access your membership tools.</p>
        {/* Place for Supabase Auth UI or a sign in link */}
        <Link href="/account" className="text-primary underline">Go to Account</Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-300">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="object-cover w-full h-full" />
          ) : null}
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {profile?.first_name} {profile?.last_name}
          </h2>
          {profile && <TierBadge tier={profile.membership_tier} />}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction href="/documents" title="Documents" description="View your governing documents" />
        <QuickAction href="/tools" title="Tools" description="Use builders and forms" />
        {(profile?.membership_tier === 'SILVER' || profile?.membership_tier === 'GOLD') && (
          <QuickAction href="/cases" title="Article IX" description="Manage cases" />
        )}
      </div>
      {/* Upgrade prompts for non-Gold tiers */}
      {profile?.membership_tier !== 'GOLD' && (
        <div className="p-4 border rounded-md bg-white shadow">
          <h3 className="text-lg font-semibold mb-2">Upgrade to unlock more features</h3>
          <p className="mb-4">Unlock all governance tools and unlimited drafts with a Gold membership.</p>
          <Link href="/account" className="inline-block px-4 py-2 rounded-md bg-primary text-white">
            View Plans
          </Link>
        </div>
      )}
    </div>
  );
}

function QuickAction({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="block p-4 bg-white shadow rounded-md border hover:bg-neutral-50">
      <h4 className="text-lg font-semibold mb-1">{title}</h4>
      <p className="text-sm text-neutral-600">{description}</p>
    </Link>
  );
}