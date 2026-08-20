'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Member {
  id: string;
  stage_name: string;
}

interface EditEventModalProps {
  entry: {
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    location: string | null;
    remarks: string | null;
    brands?: string[] | null;
  };
  currentMemberId?: string | null;
}

export default function EditEventModal({ entry, currentMemberId }: EditEventModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  // Form State
  const [title, setTitle] = useState(entry.title || '');
  const [eventType, setEventType] = useState(entry.event_type || 'Airport Fashion');
  const [eventDate, setEventDate] = useState(entry.event_date || '');
  const [location, setLocation] = useState(entry.location || '');
  const [brandsInput, setBrandsInput] = useState(entry.brands ? entry.brands.join(', ') : '');
  const [remarks, setRemarks] = useState(entry.remarks || '');
  const [selectedMember, setSelectedMember] = useState(currentMemberId || '');

  const router = useRouter();

  // Keep form state in sync when entry prop changes
  useEffect(() => {
    if (isOpen) {
      setTitle(entry.title || '');
      setEventType(entry.event_type || 'Airport Fashion');
      setEventDate(entry.event_date || '');
      setLocation(entry.location || '');
      setBrandsInput(entry.brands ? entry.brands.join(', ') : '');
      setRemarks(entry.remarks || '');
      setSelectedMember(currentMemberId || '');
    }
  }, [isOpen, entry, currentMemberId]);

  useEffect(() => {
    async function fetchMembers() {
      const { data } = await supabase
        .from('members')
        .select('id, stage_name')
        .order('stage_name', { ascending: true });
      if (data) setMembers(data);
    }
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Saving changes...');

    try {
      // Parse comma-separated string to array
      const brandsArray = brandsInput
        .split(',')
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      // 1. Update main entry details in fashion_entries
      const { error: updateError } = await supabase
        .from('fashion_entries')
        .update({
          title,
          event_type: eventType,
          event_date: eventDate,
          location: location || null,
          remarks: remarks || null,
          brands: brandsArray,
        })
        .eq('id', entry.id);

      if (updateError) {
        throw new Error(`Failed to update entry fields: ${updateError.message}`);
      }

      // 2. Sync member relationship only if member selection changed
      const initialMember = currentMemberId || '';
      if (selectedMember !== initialMember) {
        if (initialMember && selectedMember) {
          const { error: updateMemberErr } = await supabase
            .from('entry_members')
            .update({ member_id: selectedMember })
            .eq('entry_id', entry.id);
          if (updateMemberErr) throw updateMemberErr;
        } else if (!initialMember && selectedMember) {
          const { error: insertMemberErr } = await supabase
            .from('entry_members')
            .insert([{ entry_id: entry.id, member_id: selectedMember }]);
          if (insertMemberErr) throw insertMemberErr;
        } else if (initialMember && !selectedMember) {
          const { error: deleteMemberErr } = await supabase
            .from('entry_members')
            .delete()
            .eq('entry_id', entry.id);
          if (deleteMemberErr) throw deleteMemberErr;
        }
      }

      toast.success('Event updated successfully!', { id: toastId });
      setIsOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update';
      toast.error(`Error updating event: ${errorMessage}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 transition cursor-pointer"
      >
        ✏️ Edit Event
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Event Details</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Member
                  </label>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400"
                  >
                    <option value="">-- No Member --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.stage_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400"
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
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Brands Field */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Brands (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diesel, Celine, Chanel"
                  value={brandsInput}
                  onChange={(e) => setBrandsInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Remarks / Commentary
                </label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}