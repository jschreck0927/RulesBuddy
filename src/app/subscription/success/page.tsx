"use client";

import { useUser } from "@/components/UserProvider";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  const { user, profile, loading } = useUser();
  const [ready, setReady] = useState(false);

  // Wait for UserProvider to load profile
  useEffect(() => {
    if (!loading) setReady(true);
  }, [loading]);

  if (!ready) {
    return (
      <div className="text-center py-20">
        <p>Loading your membership...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="text-center py-20">
        <p>We couldn’t find your profile. Please log in and try again.</p>
        <Link href="/account" className="text-blue-600 underline mt-4 inline-block">
          Go to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-20 space-y-6">
      <h1 className="text-3xl font-bold">Welcome to RulesBuddy!</h1>

      <p>Your subscription is active.</p>

      <div className="text-lg">
        <p>
          Your tier: <strong>{profile.membership_tier}</strong>
        </p>
        {profile.group_id && (
          <p>
            Seats for group: <strong>{profile.group_id}</strong>
          </p>
        )}
      </div>

      <Link
        href="/account"
        className="inline-block px-6 py-3 bg-blue-700 text-white rounded-md"
      >
        Continue to Account
      </Link>
    </div>
  );
}
