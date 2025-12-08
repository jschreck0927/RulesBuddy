"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [stats, setStats] = useState({
    tierCounts: [],
    deptCount: 0,
    districtCount: 0,
    postCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);

      // MEMBERSHIP TIER COUNTS (no .group() in supabase-js v2)
      const { data: tierCounts } = await supabase
        .from("profiles")
        .select("membership_tier, count:count(*)")
        .order("membership_tier");

      // DEPARTMENTS
      const { count: deptCount } = await supabase
        .from("departments")
        .select("id", { count: "exact", head: true });

      // DISTRICTS
      const { count: districtCount } = await supabase
        .from("districts")
        .select("id", { count: "exact", head: true });

      // POSTS
      const { count: postCount } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true });

      setStats({
        tierCounts: tierCounts || [],
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
          {stats.tierCounts.map((row: any, idx: number) => (
            <li key={idx}>
              <span className="font-medium">
                {row.membership_tier || "Unknown"}:
              </span>{" "}
              {row.count}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-white dark:bg-neutral-800 border rounded-md shadow">
        <h2 className="font-semibold mb-2">Organization Structure</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-medium">Departments:</span>{" "}
            {stats.deptCount}
          </li>
          <li>
            <span className="font-medium">Districts:</span>{" "}
            {stats.districtCount}
          </li>
          <li>
            <span className="font-medium">Posts:</span> {stats.postCount}
          </li>
        </ul>
      </div>
    </div>
  );
}
