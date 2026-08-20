'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function EditMemberAdminPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Member Fields
  const [stageName, setStageName] = useState('');
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');

  // Brand Endorsement Fields
  const [brands, setBrands] = useState<any[]>([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [newPartnershipType, setNewPartnershipType] = useState('Global Ambassador');

  // Load existing member details when page loads
  useEffect(() => {
    if (!id) return;

    async function loadData() {
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (member) {
        setStageName(member.stage_name || '');
        setFullName(member.full_name || '');
        setPosition(member.position || '');
        setProfileImageUrl(member.profile_image_url || '');
        setBio(member.bio || '');
        setDateOfBirth(member.date_of_birth || '');
        setInstagramHandle(member.instagram_handle || '');
      }

      const { data: brandData } = await supabase
        .from('member_brand_ambassadors')
        .select('*')
        .eq('member_id', id);

      if (brandData) setBrands(brandData);
    }

    loadData();
  }, [id]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('members')
      .update({
        position,
        profile_image_url: profileImageUrl,
        bio,
        date_of_birth: dateOfBirth || null,
        instagram_handle: instagramHandle,
      })
      .eq('id', id);

    setLoading(false);
    if (error) {
      setMessage(`❌ Error updating profile: ${error.message}`);
    } else {
      setMessage('✨ Profile updated successfully!');
      router.refresh();
    }
  };

  // Add Brand Endorsement
  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;

    const { data } = await supabase
      .from('member_brand_ambassadors')
      .insert([{ member_id: id, brand_name: newBrandName, partnership_type: newPartnershipType }])
      .select()
      .single();

    if (data) {
      setBrands([...brands, data]);
      setNewBrandName('');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href={`/members/${id}`} className="text-xs text-rose-400 hover:underline mb-6 inline-block">
          ← View {stageName || 'Member'}'s Profile
        </Link>

        <h1 className="text-3xl font-black text-white mb-2">Edit Profile: {stageName || 'Loading...'}</h1>
        <p className="text-neutral-400 text-sm mb-8">{fullName}</p>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-sm font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Instagram Handle</label>
              <input
                type="text"
                placeholder="e.g. feat.dino"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Position / Role</label>
            <input
              type="text"
              placeholder="e.g. Lead Rapper, Visual"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Profile Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Biography</label>
            <textarea
              rows={4}
              placeholder="Fashion profile summary..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 font-bold py-3 rounded-xl transition text-white"
          >
            {loading ? 'Saving...' : 'Update Profile Info'}
          </button>
        </form>

        {/* Brand Ambassador Section */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-4">Brand Ambassadorships</h2>

          <div className="space-y-2 mb-6">
            {brands.map((b) => (
              <div key={b.id} className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl text-sm border border-neutral-800">
                <span className="font-bold text-white">{b.brand_name}</span>
                <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{b.partnership_type}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddBrand} className="flex gap-2">
            <input
              type="text"
              placeholder="Brand Name (e.g. Dior)"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
            />
            <select
              value={newPartnershipType}
              onChange={(e) => setNewPartnershipType(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
            >
              <option value="Global Ambassador">Global Ambassador</option>
              <option value="Local Ambassador">Local Ambassador</option>
              <option value="Brand Collab">Brand Collab</option>
              <option value="Friend of House">Friend of House</option>
            </select>
            <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-rose-400 font-bold px-4 py-2 rounded-xl text-sm">
              + Add
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}