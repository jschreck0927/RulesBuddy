"use client";
import { useUser } from '@/components/UserProvider';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { profile, user, loading } = useUser();
  const router = useRouter();
  const [editingProfile, setEditingProfile] = useState(false);
  const [formState, setFormState] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department_id: '',
    district_id: '',
    post_id: '',
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormState({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        department_id: profile.department_id || '',
        district_id: profile.district_id || '',
        post_id: profile.post_id || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const loadDepartments = async () => {
      const { data, error } = await supabase.from('departments').select('id, name, code').eq('is_active', true);
      if (!error) setDepartments(data || []);
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    const loadDistricts = async () => {
      if (!formState.department_id) {
        setDistricts([]);
        return;
      }
      const { data, error } = await supabase
        .from('districts')
        .select('id, name')
        .eq('department_id', formState.department_id)
        .eq('is_active', true);
      if (!error) setDistricts(data || []);
    };
    loadDistricts();
  }, [formState.department_id]);

  useEffect(() => {
    const loadPosts = async () => {
      if (!formState.district_id) {
        setPosts([]);
        return;
      }
      const { data, error } = await supabase
        .from('posts')
        .select('id, name')
        .eq('district_id', formState.district_id)
        .eq('is_active', true);
      if (!error) setPosts(data || []);
    };
    loadPosts();
  }, [formState.district_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };
  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({
        first_name: formState.first_name,
        last_name: formState.last_name,
        phone: formState.phone,
        department_id: formState.department_id || null,
        district_id: formState.district_id || null,
        post_id: formState.post_id || null,
      })
      .eq('user_id', profile.user_id);
    setSaving(false);
    setEditingProfile(false);
  };
  const manageBilling = async () => {
    if (!profile) return;
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: profile.user_id }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  if (loading) return <p>Loading...</p>;
  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p>You are not signed in.</p>
        <Link href="/login" className="text-primary underline">Sign in</Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <div className="p-4 bg-white dark:bg-neutral-800 border rounded-md shadow">
        <h2 className="font-semibold mb-2">Profile</h2>
        {!editingProfile ? (
          <div>
            <ul className="space-y-1 text-sm">
              <li>
                <span className="font-medium">Name:</span> {profile?.first_name} {profile?.last_name}
              </li>
              <li>
                <span className="font-medium">Email:</span> {user.email}
              </li>
              <li>
                <span className="font-medium">Phone:</span> {profile?.phone ?? 'N/A'}
              </li>
              <li>
                <span className="font-medium">Department:</span> {departments.find((d) => d.id === profile?.department_id)?.name || 'N/A'}
              </li>
              <li>
                <span className="font-medium">District:</span> {districts.find((d) => d.id === profile?.district_id)?.name || 'N/A'}
              </li>
              <li>
                <span className="font-medium">Post:</span> {posts.find((p) => p.id === profile?.post_id)?.name || 'N/A'}
              </li>
              <li>
                <span className="font-medium">Tier:</span> {profile?.membership_tier}
              </li>
            </ul>
            <button
              onClick={() => setEditingProfile(true)}
              className="mt-2 inline-block text-primary underline text-sm"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formState.first_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formState.last_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Department</label>
              <select
                name="department_id"
                value={formState.department_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">District</label>
              <select
                name="district_id"
                value={formState.district_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Post</label>
              <select
                name="post_id"
                value={formState.post_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select</option>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white dark:bg-neutral-800 border rounded-md shadow">
        <h2 className="font-semibold mb-2">Billing</h2>
        <p className="text-sm mb-2">Current tier: {profile?.membership_tier}</p>
        <button
          onClick={manageBilling}
          className="inline-block px-4 py-2 rounded-md bg-primary text-white text-sm"
        >
          Manage Billing
        </button>
      </div>
      <div className="p-4 bg-white dark:bg-neutral-800 border rounded-md shadow">
        <h2 className="font-semibold mb-2">Notifications</h2>
        <Link href="#" className="inline-block px-4 py-2 rounded-md bg-primary text-white text-sm">
          Open Notifications
        </Link>
      </div>
      <div>
        <button onClick={signOut} className="px-4 py-2 border rounded-md">
          Sign Out
        </button>
      </div>
    </div>
  );
}