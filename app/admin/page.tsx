'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

interface Member {
  id: string;
  stage_name: string;
}

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [eventType, setEventType] = useState('Airport Fashion');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [brandsInput, setBrandsInput] = useState('');
  const [imageUrlsText, setImageUrlsText] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fetch members on load for dropdown selection
  useEffect(() => {
    async function fetchMembers() {
      const { data } = await supabase
        .from('members')
        .select('id, stage_name')
        .order('stage_name', { ascending: true });
      if (data) setMembers(data);
    }
    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Parse comma-separated brands into a clean text array
      const brandsArray = brandsInput
        .split(',')
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      // 1. Insert into fashion_entries table
      const { data: entryData, error: entryError } = await supabase
        .from('fashion_entries')
        .insert([
          {
            title,
            event_type: eventType,
            event_date: eventDate,
            location: location || null,
            remarks,
            member_id: selectedMember || null,
            brands: brandsArray,
          },
        ])
        .select()
        .single();

      if (entryError) throw entryError;

      const entryId = entryData.id;

      // 2. Insert into entry_members junction table for backwards compatibility
      if (selectedMember) {
        const { error: memberLinkError } = await supabase
          .from('entry_members')
          .insert([{ entry_id: entryId, member_id: selectedMember }]);

        if (memberLinkError) console.warn('Junction table note:', memberLinkError.message);
      }

      // 3. Parse and insert bulk images into entry_images table
      if (imageUrlsText.trim()) {
        const urls = imageUrlsText
          .split(/[\n,]+/)
          .map((url) => url.trim())
          .filter((url) => url.length > 0);

        if (urls.length > 0) {
          const imageRows = urls.map((url, idx) => ({
            entry_id: entryId,
            image_url: url,
            display_order: idx + 1,
          }));

          const { error: imageError } = await supabase
            .from('entry_images')
            .insert(imageRows);

          if (imageError) throw imageError;
        }
      }

      setMessage('✨ Fashion entry created successfully!');
      
      // Reset form
      setTitle('');
      setSelectedMember('');
      setEventDate('');
      setLocation('');
      setBrandsInput('');
      setImageUrlsText('');
      setRemarks('');
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ Error: ${err.message || 'Failed to submit'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Navigation back home */}
        <Link
          href="/"
          className="text-xs text-rose-400 hover:underline mb-6 inline-block font-medium"
        >
          ← Back to Public Archive
        </Link>

        <h1 className="text-3xl font-black text-white mb-2">
          Add New Fashion Entry
        </h1>
        <p className="text-neutral-400 text-sm mb-8">
          Log outfits, brand details, and personal commentary.
        </p>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-medium ${
              message.startsWith('✨')
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-2xl">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Entry Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hoshi - Diesel Spring/Summer Show"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Member
              </label>
              <select
                required
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition text-white"
              >
                <option value="">Select Member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.stage_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition text-white"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Date */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Event Date
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition text-neutral-200"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Incheon Airport, Seoul"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition text-white"
              />
            </div>
          </div>

          {/* Brands */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Brands (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Diesel, Chrome Hearts, Celine"
              value={brandsInput}
              onChange={(e) => setBrandsInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition text-white"
            />
          </div>

          {/* Bulk Image URLs */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Image URLs (Paste multiple links, one per line)
            </label>
            <textarea
              required
              rows={3}
              placeholder={`https://images.unsplash.com/photo1.jpg\nhttps://images.unsplash.com/photo2.jpg`}
              value={imageUrlsText}
              onChange={(e) => setImageUrlsText(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition font-mono text-white"
            />
          </div>

          {/* Personal Fashion Remarks */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Fashion Remarks / Commentary
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write your personal breakdown of the outfit, styling notes, brand choices, etc."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 transition text-white"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 font-bold py-3.5 px-6 rounded-xl transition duration-200 disabled:opacity-50 text-white cursor-pointer"
          >
            {loading ? 'Saving Entry...' : 'Publish Fashion Entry'}
          </button>
        </form>
      </div>
    </main>
  );
}