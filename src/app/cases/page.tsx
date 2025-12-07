"use client";
import { useUser } from '@/components/UserProvider';
import Link from 'next/link';

export default function CasesPage() {
  const { profile, loading } = useUser();
  if (loading) return <p>Loading...</p>;
  if (!profile || (profile.membership_tier !== 'SILVER' && profile.membership_tier !== 'GOLD')) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Article IX Cases</h1>
        <p>Your membership tier does not include the Article IX suite.</p>
        <Link href="/account" className="text-primary underline">Upgrade to access cases</Link>
      </div>
    );
  }
  // Placeholder for case list
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Cases</h1>
        <Link href="/cases/new" className="px-4 py-2 rounded-md bg-primary text-white">
          New Case
        </Link>
      </div>
      <p className="text-neutral-600">Cases feature not yet implemented.</p>
    </div>
  );
}