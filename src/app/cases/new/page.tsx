"use client";
import { useUser } from '@/components/UserProvider';
import Link from 'next/link';

export default function NewCasePage() {
  const { profile, loading } = useUser();
  if (loading) return <p>Loading...</p>;
  if (!profile || (profile.membership_tier !== 'SILVER' && profile.membership_tier !== 'GOLD')) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">New Case</h1>
        <p>You do not have permission to create cases.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create New Case</h1>
      <p className="text-neutral-600">Case creation form not yet implemented.</p>
      <Link href="/cases" className="text-primary underline">Back to cases</Link>
    </div>
  );
}