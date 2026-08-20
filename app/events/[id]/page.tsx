import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import DeleteEntryButton from '@/app/components/DeleteEntryButton';
import EditEventModal from '@/app/components/EditEventModal';
import EventGallery from '../EventGallery';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Map of popular fashion brands to their official websites
const OFFICIAL_BRAND_SITES: Record<string, string> = {
  // Luxury Houses
  Dior: 'https://www.dior.com',
  Chanel: 'https://www.chanel.com',
  Celine: 'https://www.celine.com',
  Diesel: 'https://www.diesel.com',
  Prada: 'https://www.prada.com',
  Gucci: 'https://www.gucci.com',
  'Louis Vuitton': 'https://www.louisvuitton.com',
  LouisVuitton: 'https://www.louisvuitton.com',
  YSL: 'https://www.ysl.com',
  'Saint Laurent': 'https://www.ysl.com',
  Balenciaga: 'https://www.balenciaga.com',
  Fendi: 'https://www.fendi.com',
  Burberry: 'https://www.burberry.com',
  Givenchy: 'https://www.givenchy.com',
  'Bottega Veneta': 'https://www.bottegaveneta.com',
  Loewe: 'https://www.loewe.com',
  MiuMiu: 'https://www.miumiu.com',
  'Miu Miu': 'https://www.miumiu.com',
  Versace: 'https://www.versace.com',
  Valentino: 'https://www.valentino.com',
  Moncler: 'https://www.moncler.com',
  
  // Contemporary & Streetwear
  Supreme: 'https://www.supreme.com',
  'Off-White': 'https://www.off---white.com',
  OffWhite: 'https://www.off---white.com',
  Jacquemus: 'https://www.jacquemus.com',
  'Acne Studios': 'https://www.acnestudios.com',
  'Fear of God': 'https://fearofgod.com',
  'Aprese Un': 'https://www.google.com/search?q=Aprese+Un+brand',
  Stussy: 'https://www.stussy.com',
  'Gentle Monster': 'https://www.gentlemonster.com',
  Marni: 'https://www.marni.com',
  
  // Sportswear & Denim
  Nike: 'https://www.nike.com',
  Adidas: 'https://www.adidas.com',
  Puma: 'https://www.puma.com',
  CalvinKlein: 'https://www.calvinklein.com',
  'Calvin Klein': 'https://www.calvinklein.com',
  Levi: 'https://www.levi.com',
  "Levi's": 'https://www.levi.com',
};

// Returns the direct official URL or defaults to a Google search for unmapped brands
const getBrandUrl = (brandName: string) => {
  const trimmed = brandName.trim();
  
  // Direct match check
  if (OFFICIAL_BRAND_SITES[trimmed]) {
    return OFFICIAL_BRAND_SITES[trimmed];
  }

  // Case-insensitive fallback check
  const matchedKey = Object.keys(OFFICIAL_BRAND_SITES).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase()
  );
  if (matchedKey) {
    return OFFICIAL_BRAND_SITES[matchedKey];
  }

  // Google Search fallback
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed + ' official site')}`;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch main entry + linked member via junction table
  const { data: entry, error: entryError } = await supabase
    .from('fashion_entries')
    .select(`
      *,
      entry_members (
        members (*)
      )
    `)
    .eq('id', id)
    .single();

  // 2. Fetch all linked gallery images
  const { data: images } = await supabase
    .from('entry_images')
    .select('*')
    .eq('entry_id', id);

  // 3. Fallback check for direct member_id column if junction table is empty
  let member = entry?.entry_members?.[0]?.members || null;
  if (!member && entry?.member_id) {
    const { data: directMember } = await supabase
      .from('members')
      .select('*')
      .eq('id', entry.member_id)
      .single();
    member = directMember;
  }

  if (entryError || !entry) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-neutral-500 text-sm mb-6">Unable to load details for ID: {id}</p>
          <Link href="/" className="text-rose-400 hover:underline text-sm font-medium">
            ← Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-white transition">
            ← Back to Latest Remarks
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <EditEventModal entry={entry} currentMemberId={member?.id} />
            <DeleteEntryButton entryId={entry.id} />
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="mb-8 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {entry.event_type}
            </span>
            <span className="text-xs text-neutral-400">{entry.event_date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{entry.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {entry.location && (
              <p className="text-sm text-neutral-400">📍 {entry.location}</p>
            )}

            {/* Member Badge Tag */}
            {member && (
              <Link
                href={`/members/${member.id}`}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition group"
              >
                {member.profile_image_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={member.profile_image_url}
                    alt={member.stage_name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                )}
                <span className="text-xs font-semibold text-rose-300 group-hover:text-rose-400">
                  {member.stage_name}
                </span>
              </Link>
            )}

            {/* External Clickable Brand Tags */}
            {entry.brands && entry.brands.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {entry.brands.map((brand: string, idx: number) => (
                  <a
                    key={idx}
                    href={getBrandUrl(brand)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-rose-500/50 hover:text-rose-300 transition inline-flex items-center gap-1 cursor-pointer group/brand"
                    title={`Visit official ${brand} website`}
                  >
                    🏷️ {brand}
                    <span className="text-[10px] opacity-50 group-hover/brand:opacity-100 transition-opacity">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Remarks */}
        {entry.remarks && (
          <div className="mb-10 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl italic text-neutral-200 leading-relaxed">
            "{entry.remarks}"
          </div>
        )}

        {/* Media Gallery */}
        <EventGallery entryId={entry.id} initialImages={images || []} />
      </main>
    </div>
  );
}