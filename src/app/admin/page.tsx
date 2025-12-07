"use client";
import { useUser } from '@/components/UserProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AdminPage() {
  const { profile, loading, isSuperAdmin, isDepartmentAdmin, isGroupAdmin } = useUser();
  const [loadingData, setLoadingData] = useState(true);
  const [groupData, setGroupData] = useState<any>(null);
  const [deptData, setDeptData] = useState<any>(null);
  const [globalData, setGlobalData] = useState<any>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!profile) return;
      setLoadingData(true);
      try {
        if (isGroupAdmin && profile.group_id) {
          // fetch group subscription and group info
          const { data: group } = await supabase
            .from('groups')
            .select('id, name, department_id')
            .eq('id', profile.group_id)
            .single();
          const { data: subscriptions } = await supabase
            .from('group_subscriptions')
            .select('*')
            .eq('group_id', profile.group_id);
          setGroupData({ group, subscriptions });
        }
        if (isDepartmentAdmin && profile.department_id) {
          // fetch revenue shares for department
          const { data: shares } = await supabase
            .from('revenue_shares')
            .select('amount_cents, period_start')
            .eq('department_id', profile.department_id);
          const total = shares?.reduce((sum: number, r: any) => sum + (r.amount_cents || 0), 0);
          setDeptData({ total_cents: total || 0, count: shares?.length || 0 });
        }
        if (isSuperAdmin) {
          // fetch counts of users by tier, number of departments, groups
          const { data: profilesByTier } = await supabase
            .from('profiles')
            .select('membership_tier, count:count(*)')
            .group('membership_tier');
          const { count: deptCount } = await supabase
            .from('departments')
            .select('id', { count: 'exact', head: true });
          const { count: groupCount } = await supabase
            .from('groups')
            .select('id', { count: 'exact', head: true });
          setGlobalData({ profilesByTier, deptCount, groupCount });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchAdminData();
  }, [profile, isGroupAdmin, isDepartmentAdmin, isSuperAdmin]);

  if (loading) return <p>Loading...</p>;
  if (!profile || (!isSuperAdmin && !isDepartmentAdmin && !isGroupAdmin)) {
    return <p>You do not have admin privileges.</p>;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      {isGroupAdmin && groupData && (
        <div className="p-4 border rounded-md bg-white dark:bg-neutral-800">
          <h2 className="font-semibold mb-2">Group Admin Dashboard</h2>
          <p>Group: {groupData.group?.name}</p>
          <p>Subscriptions: {groupData.subscriptions?.length || 0}</p>
          {groupData.subscriptions?.map((sub: any) => (
            <div key={sub.id} className="text-sm">
              Tier: {sub.tier}, Seats: {sub.seat_count}, Status: {sub.status}
            </div>
          ))}
        </div>
      )}
      {isDepartmentAdmin && deptData && (
        <div className="p-4 border rounded-md bg-white dark:bg-neutral-800">
          <h2 className="font-semibold mb-2">Department Admin Dashboard</h2>
          <p>Total revenue share: ${(deptData.total_cents / 100).toFixed(2)}</p>
          <p>Revenue share entries: {deptData.count}</p>
        </div>
      )}
      {isSuperAdmin && globalData && (
        <div className="p-4 border rounded-md bg-white dark:bg-neutral-800">
          <h2 className="font-semibold mb-2">Super Admin Console</h2>
          <p>Departments: {globalData.deptCount || 0}</p>
          <p>Groups: {globalData.groupCount || 0}</p>
          <div className="mt-2">
            <h3 className="font-semibold">Users by Tier</h3>
            <ul className="list-disc ml-4">
              {globalData.profilesByTier?.map((row: any) => (
                <li key={row.membership_tier}>{row.membership_tier}: {row.count}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}