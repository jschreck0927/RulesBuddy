"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DocumentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDoc = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) {
        setDoc(data);
      }
      setLoading(false);
    };
    fetchDoc();
  }, [id]);
  if (loading) return <p>Loading...</p>;
  if (!doc) return <p>Document not found.</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{doc.title}</h1>
      {doc.text_content ? (
        <pre className="whitespace-pre-wrap text-sm bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md overflow-auto">
          {doc.text_content}
        </pre>
      ) : (
        <p>No text content available.</p>
      )}
    </div>
  );
}