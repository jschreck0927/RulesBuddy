"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Explicit type so Supabase does NOT try to parse "count(*)"
interface TierCountRow {
  membership_tier: string | null;
  count: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState({
    tierCounts: [] as TierCountRow[],
    deptCount: 0,
    districtCount: 0,
    postCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);

      // Force the result into the TierCountRow[] type
      const { data: rawTierCounts } = await supabase
        .from("profiles")
        .select("membership_tier, count:count(*)")
        .order("membership_tier");

      const tierCounts: TierCountRow[] = (rawTierCounts || []).map((row: any) => ({
        membership_tier: row.membership_tier,
        count: row.count,
      }));

      const { count: deptCount } = await supabase
        .from("departments")
        .select("id", { count: "exact", head: true });

      const { count: districtCount } = await supabase
        .from("districts")
        .select("id", { count: "exact", head: true });

      const { count: postCount } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true });

      setStats({
        tierCounts,
        deptCount: deptCount || 0,
        districtCount: districtCount || 0,
        postCount: postCount || 0,
      });

      setLoading(false);
    };

    loadStats();
  }, []);

  if (loading) return <p>Loading admin stats...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <div className="p-4 bg-white dark:bg-neutral-800 border rounded-md shadow">
        <h2 className="font-semibold mb-2">Membership Tiers</h2>
        <ul className="space-y-1 text-sm">
          {stats.tierCounts.map((row, idx) => (
            <li key={idx}>
              <span className="font-medium">{row.membership_tier || "Unknown"}:</span>{" "}
              {row.count}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-white dark:bg-neutral-800 border rounded-md shadow">
        <h2 className="font-semibold mb-2">Organization Structure</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-medium">Departments:</span> {stats.deptCount}
          </li>
          <li>
            <span className="font-medium">Districts:</span> {stats.districtCount}
          </li>
          <li>
            <span className="font-medium">Posts:</span> {stats.postCount}
          </li>
        </ul>
      </div>
    </div>
  );
}
