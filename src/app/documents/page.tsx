"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@/components/UserProvider';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function DocumentsPage() {
  const { profile, loading } = useUser();
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!profile) return;
      setIsFetching(true);
      try {
        let req = supabase.from('documents').select('id, title, level');
        if (query) {
          // simple ilike search on text_content and title
          req = req.ilike('text_content', `%${query}%`);
        }
        const { data, error } = await req.order('created_at', { ascending: false });
        if (!error) {
          setDocuments(data || []);
        } else {
          console.error(error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchDocs();
  }, [profile, query]);
  if (loading) return <p>Loading...</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full p-2 border rounded-md"
        />
      </div>
      {isFetching ? (
        <p>Searching…</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="p-3 border rounded-md bg-white dark:bg-neutral-800">
              <Link href={`/documents/${doc.id}`} className="font-medium text-primary">
                {doc.title}
              </Link>{' '}
              <span className="text-xs text-neutral-500">({doc.level})</span>
            </li>
          ))}
          {documents.length === 0 && <p>No documents found.</p>}
        </ul>
      )}
    </div>
  );
}