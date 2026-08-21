'use client';

export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import EntryFeed from '@/app/components/EntryFeed';
import { supabase } from '@/app/lib/supabase';

interface Member {
  id: string;
  stage_name: string;
  full_name: string;
  sub_unit: string;
  profile_image_url: string | null;
  instagram_handle: string | null;
}

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Check session storage or URL query param to stay logged in across page redirects
  useEffect(() => {
    const isSessionAuthed = sessionStorage.getItem('isAdminAuthed') === 'true';
    const isUrlAdmin = searchParams.get('isAdmin') === 'true';

    if (isSessionAuthed || isUrlAdmin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAdminAuthed', 'true');
    }
  }, [searchParams]);

  // 2. Fetch admin data
  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesRes, membersRes] = await Promise.all([
          supabase
            .from('fashion_entries')
            .select(`
              *,
              entry_images (*),
              entry_members (*)
            `)
            .order('event_date', { ascending: false }),
          supabase.from('members').select('*').order('stage_name', { ascending: true }),
        ]);

        if (entriesRes.data) setEntries(entriesRes.data);
        if (membersRes.data) setMembers(membersRes.data);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAdminAuthed', 'true');
      setError('');
    } else {
      setError('Incorrect Admin PIN');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAdminAuthed');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 max-w-sm w-full space-y-4 shadow-2xl"
        >
          <h1 className="text-2xl font-bold text-center">Admin Portal</h1>
          <p className="text-xs text-neutral-400 text-center">
            Enter your passcode to manage SEVENTEEN Fashion entries.
          </p>

          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-rose-500 text-center text-lg tracking-widest text-white"
          />

          {error && (
            <p className="text-rose-500 text-xs text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      {/* Admin Status Banner */}
      <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-900/50 flex justify-between items-center">
        <span className="text-xs font-semibold text-rose-300">
          🔑 Admin Mode Active — Full management controls enabled
        </span>
        <button
          onClick={handleLogout}
          className="text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-700 transition"
        >
          Lock Admin
        </button>
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-3">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Admin Dashboard
        </h1>
        <Link
          href="/admin/add-entry"
          className="text-xs bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg text-white font-medium transition"
        >
          + Add New Entry
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-500 text-sm">
          Loading entries...
        </div>
      ) : (
        <>
          {/* Main Feed with Admin Controls */}
          <section className="mb-16">
            <EntryFeed initialEntries={entries} members={members} isAdmin={true} />
          </section>

          {/* Members Roster */}
          <section className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6 border-b border-neutral-800 pb-3">
              SEVENTEEN Members ({members?.length || 0})
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {members?.map((member: Member) => (
                <Link
                  key={member.id}
                  href={`/admin/members/${member.id}`}
                  className="group bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 hover:border-rose-400/80 transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-neutral-800 overflow-hidden mb-3 border border-neutral-700 group-hover:border-rose-400 transition">
                    {member.profile_image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={member.profile_image_url} alt={member.stage_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold text-lg">
                        {member.stage_name[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-rose-400 uppercase tracking-wider mb-1">
                    {member.sub_unit}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition">
                    {member.stage_name}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate w-full">{member.full_name}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}