'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditMemberPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    stage_name: '',
    full_name: '',
    unit: '',
    position: '',
    birth_date: '',
    instagram_handle: '',
    profile_image_url: '',
    bio: '',
  });

  // Fetch current details
  useEffect(() => {
    async function fetchMember() {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setErrorMessage('Failed to load member profile.');
      } else if (data) {
        setFormData({
          stage_name: data.stage_name || '',
          full_name: data.full_name || '',
          unit: data.unit || '',
          position: data.position || '',
          birth_date: data.birth_date || '',
          instagram_handle: data.instagram_handle || '',
          profile_image_url: data.profile_image_url || '',
          bio: data.bio || '',
        });
      }
      setLoading(false);
    }

    fetchMember();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    const { error } = await supabase
      .from('members')
      .update(formData)
      .eq('id', id);

    if (error) {
      console.error('Supabase Update Error:', error);
      setErrorMessage(error.message);
      setSaving(false);
    } else {
      // Refresh cache and navigate back
      router.refresh();
      router.push(`/members/${id}?isAdmin=true`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="text-neutral-400 text-sm">Loading member details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <Link
            href={`/members/${id}?isAdmin=true`}
            className="text-sm text-neutral-400 hover:text-white transition"
          >
            ← Cancel
          </Link>
          <h1 className="text-xl font-bold text-rose-400">Edit Member Profile</h1>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Stage Name *</label>
            <input
              name="stage_name"
              value={formData.stage_name}
              onChange={handleChange}
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Full Name</label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Unit</label>
              <input
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g. Performance Unit"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Position</label>
              <input
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Birth Date</label>
              <input
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                placeholder="YYYY-MM-DD"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Instagram Handle</label>
              <input
                name="instagram_handle"
                value={formData.instagram_handle}
                onChange={handleChange}
                placeholder="@ho5hi_kwon"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Profile Image URL</label>
              <input
                name="profile_image_url"
                value={formData.profile_image_url}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Bio</label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm shadow-lg shadow-rose-900/20"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>

      </div>
    </div>
  );
}