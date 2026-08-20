export const dynamic = 'force-dynamic';

import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import DeleteEntryButton from '@/app/components/DeleteEntryButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params;

  // 1. Fetch Member Info
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (!member) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white p-12 text-center">
        Member not found. <Link href="/" className="text-rose-400 underline">Go Home</Link>
      </div>
    );
  }

  // Helper to format Date of Birth (e.g. 1999-02-11 -> February 11, 1999)
  const formattedDOB = member.date_of_birth
    ? new Date(member.date_of_birth).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null;

  // 2. Fetch Brand Endorsements
  const { data: brands } = await supabase
    .from('member_brand_ambassadors')
    .select('*')
    .eq('member_id', id);

  // 3. Fetch Member's Fashion Entries
  const { data: memberEntries } = await supabase
    .from('entry_members')
    .select(`
      fashion_entries (
        id,
        title,
        event_type,
        event_date,
        location,
        remarks,
        entry_images (image_url)
      )
    `)
    .eq('member_id', id);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-xs text-rose-400 hover:underline">
            ← Back to All Members
          </Link>
          <Link
            href={`/admin/members/${member.id}`}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 text-rose-400 border border-neutral-700 px-3 py-1.5 rounded-lg transition"
          >
            ✏️ Edit Profile (Admin)
          </Link>
        </div>

        {/* Profile Card Header */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-10 mb-12 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-neutral-800 overflow-hidden border-2 border-rose-400/40 shrink-0">
            {member.profile_image_url ? (
              <img src={member.profile_image_url} alt={member.stage_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-600 font-bold text-4xl">
                {member.stage_name ? member.stage_name[0] : '?'}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-white">{member.stage_name}</h1>
              {member.sub_unit && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {member.sub_unit} Unit
                </span>
              )}
            </div>
            <p className="text-neutral-400 text-sm mb-3">
              {member.full_name} • {member.position || 'SEVENTEEN Member'}
            </p>

            {/* DOB & Social Links Badges */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-5 text-xs text-neutral-300">
              {formattedDOB && (
                <span className="bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-lg flex items-center gap-1.5">
                  🎂 <span>{formattedDOB}</span>
                </span>
              )}
             {member.instagram_handle && (
  <a
    href={`https://instagram.com/${member.instagram_handle.replace('@', '')}`}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-lg hover:border-rose-400/60 hover:text-rose-400 transition flex items-center gap-2"
  >
    {/* Clean Instagram SVG Icon */}
    <svg 
      className="w-4 h-4 text-rose-400" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
    <span>@{member.instagram_handle.replace('@', '')}</span>
  </a>
)}
            </div>

            {member.bio && (
              <p className="text-neutral-300 text-sm leading-relaxed mb-6 max-w-2xl">{member.bio}</p>
            )}

            {/* Brand Ambassador Badges */}
            <div className="border-t border-neutral-800/80 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Brand Ambassadorships & Collaborations
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {brands && brands.length > 0 ? (
                  brands.map((b) => (
                    <span key={b.id} className="text-xs px-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-white flex items-center gap-2">
                      <span className="font-bold">{b.brand_name}</span>
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                        {b.partnership_type}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-500">No brand ambassadorships logged yet.</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Fashion Entries Feed */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-neutral-800 pb-3">
            {member.stage_name}'s Fashion Feed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memberEntries && memberEntries.length > 0 ? (
              memberEntries.map((item: any) => {
                const entry = item.fashion_entries;
                if (!entry) return null;
                return (
                  <article key={entry.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    {entry.entry_images && entry.entry_images.length > 0 && (
                      <div className="h-56 w-full bg-neutral-800 overflow-hidden">
                        <img src={entry.entry_images[0].image_url} alt={entry.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">
                        {entry.event_type}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2 mb-1">{entry.title}</h3>

                        <DeleteEntryButton entryId={entry.id} />

                      <p className="text-xs text-neutral-500 mb-3">{entry.event_date} {entry.location ? `• ${entry.location}` : ''}</p>
                      <p className="text-neutral-300 text-xs italic">"{entry.remarks}"</p>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="text-neutral-500 text-sm col-span-2 py-8 text-center">No fashion entries linked to {member.stage_name} yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}