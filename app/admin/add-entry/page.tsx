'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';

interface Member {
  id: string;
  stage_name: string;
}

export default function NewEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Airport Fashion');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  useEffect(() => {
    async function fetchMembers() {
      const { data } = await supabase.from('members').select('id, stage_name').order('stage_name');
      if (data) setMembers(data);
    }
    fetchMembers();
  }, []);

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Insert into fashion_entries
      const { data: entry, error: entryError } = await supabase
        .from('fashion_entries')
        .insert({
          title,
          event_type: eventType,
          event_date: eventDate,
          location,
          remarks,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // 2. Insert into entry_members
      if (selectedMemberIds.length > 0 && entry) {
        const memberRows = selectedMemberIds.map((mId) => ({
          entry_id: entry.id,
          member_id: mId,
        }));
        const { error: memberError } = await supabase.from('entry_members').insert(memberRows);
        if (memberError) throw memberError;
      }

      // 3. Insert into entry_images
      if (imageUrl && entry) {
        const { error: imageError } = await supabase.from('entry_images').insert({
          entry_id: entry.id,
          image_url: imageUrl,
          caption: imageCaption,
        });
        if (imageError) throw imageError;
      }

      // Redirect back to admin route preserving admin mode
      router.push('/admin?isAdmin=true');
      router.refresh();
    } catch (err: any) {
      alert('Error creating entry: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Fashion Entry</h1>
        <Link
          href="/admin?isAdmin=true"
          className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-700 transition"
        >
          ← Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Mingyu - Dior Autumn/Winter"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
            >
              <option value="Airport Fashion">Airport Fashion</option>
              <option value="Editorial">Editorial</option>
              <option value="Brand Ambassador">Brand Ambassador</option>
              <option value="Stage Outfit">Stage Outfit</option>
              <option value="Daily Instagram">Daily Instagram</option>
              <option value="Variety / TV">Variety / TV</option>
              <option value="Concert Tour">Concert Tour</option>
              <option value="Runway Show">Runway Show</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Event Date</label>
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">Location</label>
          <input
            type="text"
            placeholder="e.g. Paris, France"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-2">Tagged Members</label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  selectedMemberIds.includes(m.id)
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                {m.stage_name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">Image URL</label>
          <input
            type="url"
            required
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1">Remarks / Description</label>
          <textarea
            rows={4}
            placeholder="Write commentary on the outfit..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-semibold rounded-xl text-sm transition"
        >
          {loading ? 'Saving Entry...' : 'Create Entry'}
        </button>
      </form>
    </main>
  );
}