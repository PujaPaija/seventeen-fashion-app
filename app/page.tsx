import { supabase } from './lib/supabase';
import Link from 'next/link';
import EntryFeed from '@/app/components/EntryFeed';

interface Member {
  id: string;
  stage_name: string;
  full_name: string;
  sub_unit: string;
  profile_image_url: string | null;
  instagram_handle: string | null;
}

export default async function Home() {
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .order('stage_name', { ascending: true });

  const { data: entries } = await supabase
  .from('fashion_entries')
  .select(`
    id,
    title,
    event_type,
    event_date,
    location,
    remarks,
    entry_images (
      image_url,
      caption
    ),
    entry_members (
      member_id
    )
  `)
  .order('event_date', { ascending: false });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans">
      <header className="max-w-6xl mx-auto mb-16 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
          Archive & Tracker
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mt-4 mb-3">
          SEVENTEEN <span className="text-rose-400">FASHION</span>
        </h1>
        <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto">
          Personal commentary, daily outfits, magazine editorials, and brand ambassador logs.
        </p>
      </header>

      {/* Latest Remarks Feed */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Latest Fashion Remarks
          </h2>
        </div>

        <EntryFeed initialEntries={entries || []} members={members || []} isAdmin={false} />
      </section>

      {/* Members Roster (Clickable Cards) */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-6 border-b border-neutral-800 pb-3">
          SEVENTEEN Members ({members?.length || 0})
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {members?.map((member: Member) => (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="group bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 hover:border-rose-400/80 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-neutral-800 overflow-hidden mb-3 border border-neutral-700 group-hover:border-rose-400 transition">
                {member.profile_image_url ? (
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
    </main>
  );
}