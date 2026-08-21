import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicMemberPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch Member Profile Details
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  // 2. Fetch Tagged Fashion Entries
  const { data: memberEntries } = await supabase
    .from('entry_members')
    .select(`
      fashion_entries (
        *,
        entry_images (*)
      )
    `)
    .eq('member_id', id);

  const entries = memberEntries?.map((item) => item.fashion_entries).filter(Boolean) || [];

  if (!member) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold">Member Not Found</h1>
          <Link href="/" className="text-rose-500 hover:text-rose-400 text-xs font-semibold">
            ← Back to All Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <main className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-rose-500 hover:text-rose-400 text-xs font-semibold tracking-wide transition"
          >
            ← Back to All Members
          </Link>
        </div>

        {/* Member Profile Main Banner Card */}
        <section className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start gap-8">
            
            {/* Profile Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-rose-500/30 shrink-0 bg-neutral-800">
              {member.profile_image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={member.profile_image_url}
                  alt={member.stage_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-neutral-600">
                  {member.stage_name[0]}
                </div>
              )}
            </div>

            {/* Profile Info Details */}
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  {member.stage_name}
                </h1>
                {member.sub_unit && (
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                    {member.sub_unit}
                  </span>
                )}
              </div>

              {/* Name & Positions */}
              <p className="text-sm text-neutral-400 font-medium">
                {member.full_name} {member.positions ? `• ${member.positions}` : ''}
              </p>

              {/* Birthdate & Instagram */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {member.birthdate && (
                  <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 flex items-center gap-1.5">
                    🎂 {member.birthdate}
                  </span>
                )}
                {member.instagram_handle && (
                  <a
                    href={`https://instagram.com/${member.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-rose-400 hover:border-rose-500/40 transition flex items-center gap-1.5"
                  >
                    📸 @{member.instagram_handle.replace('@', '')}
                  </a>
                )}
              </div>

              {/* Bio Summary */}
              {member.bio && (
                <p className="text-sm text-neutral-300 leading-relaxed pt-2">
                  {member.bio}
                </p>
              )}

              {/* Brand Ambassadorships */}
              {member.brands && Array.isArray(member.brands) && (
                <div className="pt-4 border-t border-neutral-800/80 space-y-2">
                  <h4 className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
                    BRAND AMBASSADORSHIPS & COLLABORATIONS
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {member.brands.map((b: any, index: number) => (
                      <div key={index} className="inline-flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1 text-xs">
                        <span className="font-bold text-white">{b.name}</span>
                        {b.role && (
                          <span className="text-[10px] text-rose-400 font-medium">{b.role}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Fashion Feed Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {member.stage_name}&apos;s Fashion Feed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map((entry: any) => (
              <article
                key={entry.id}
                className="group bg-neutral-900/80 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-lg hover:border-neutral-700 hover:-translate-y-1 transition duration-300"
              >
                {/* Wrapped in Link for Clickability */}
                <Link href={`/events/${entry.id}`} className="block">
                  {/* Image */}
                  {entry.entry_images?.[0] && (
                    <div className="relative h-72 w-full bg-neutral-950 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.entry_images[0].image_url}
                        alt={entry.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                        {entry.event_type}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-rose-400 transition-colors">
                      {entry.title}
                    </h3>

                    <p className="text-xs text-neutral-500 font-medium">
                      {entry.event_date} {entry.location ? `• ${entry.location}` : ''}
                    </p>

                    {entry.description && (
                      <p className="text-xs text-neutral-400 italic leading-relaxed pt-1 line-clamp-2">
                        &quot;{entry.description}&quot;
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}