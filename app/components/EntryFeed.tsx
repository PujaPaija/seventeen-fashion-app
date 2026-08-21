'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeleteEntryButton from '@/app/components/DeleteEntryButton';

interface Member {
  id: string;
  stage_name: string;
}

interface FashionEntry {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  location: string | null;
  remarks: string | null;
  brands?: string[] | null;
  entry_images: { image_url: string; caption?: string | null }[];
  entry_members?: { member_id: string }[];
}

interface EntryFeedProps {
  initialEntries: FashionEntry[];
  members: Member[];
  isAdmin?: boolean;
}

const EVENT_TYPES = [
  'All Types',
  'Airport Fashion',
  'Editorial',
  'Brand Ambassador',
  'Stage Outfit',
  'Daily Instagram',
  'Variety / TV',
  'Concert Tour',
  'Runway Show',
];

export default function EntryFeed({
  initialEntries,
  members,
  isAdmin = false,
}: EntryFeedProps) {
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedMemberId, setSelectedMemberId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = initialEntries.filter((entry) => {
    const matchesType =
      selectedType === 'All Types' || entry.event_type === selectedType;

    const matchesMember =
      selectedMemberId === 'ALL' ||
      entry.entry_members?.some((m) => m.member_id === selectedMemberId);

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      entry.title.toLowerCase().includes(query) ||
      (entry.location ? entry.location.toLowerCase().includes(query) : false) ||
      (entry.remarks ? entry.remarks.toLowerCase().includes(query) : false) ||
      (entry.brands ? entry.brands.some((b) => b.toLowerCase().includes(query)) : false);

    return matchesType && matchesMember && matchesSearch;
  });

  return (
    <div>
      {/* Filter & Search Toolbar */}
      <div className="p-4 mb-8 space-y-4 shadow-xl border rounded-2xl bg-neutral-900/80 backdrop-blur-md border-neutral-800/80">
        {/* Search Bar */}
        <div className="relative group">
          <span className="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none text-neutral-500 group-focus-within:text-rose-400 transition-colors">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by title, brand, location, or remarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2.5 pr-10 pl-11 w-full text-sm text-white rounded-xl border focus:outline-none transition-all duration-200 bg-neutral-950 border-neutral-800/90 placeholder-neutral-500 focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="flex absolute inset-y-0 right-0 items-center pr-3.5 text-xs transition-colors cursor-pointer text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-between items-center pt-3 border-t border-neutral-800/60">
          {/* Event Type Filter Pills */}
          <div className="flex overflow-x-auto gap-2 items-center pb-2 md:pb-0 scrollbar-none">
            {EVENT_TYPES.map((type) => {
              const isActive = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer transform active:scale-95 ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700/80 hover:-translate-y-0.5'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Member Selector */}
          <div className="flex gap-2 items-center w-full md:w-auto">
            <label className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
              Member:
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="px-3 py-1.5 w-full text-xs text-white rounded-xl border transition cursor-pointer md:w-auto bg-neutral-950 border-neutral-800 focus:outline-none focus:border-rose-400"
            >
              <option value="ALL">All Members</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.stage_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feed Grid */}
      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="overflow-hidden relative border rounded-2xl transition-all duration-300 bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:shadow-2xl hover:shadow-rose-950/20 hover:-translate-y-1 group"
            >
              {/* Delete Button - Only renders if user is Admin */}
              {isAdmin && (
                <div className="absolute top-3 right-3 z-20">
                  <DeleteEntryButton entryId={entry.id} />
                </div>
              )}

              {/* Passes ?isAdmin=true when navigated from Admin Dashboard */}
              <Link
                href={isAdmin ? `/events/${entry.id}?isAdmin=true` : `/events/${entry.id}`}
                className="block"
              >
                {entry.entry_images && entry.entry_images.length > 0 && (
                  <div className="overflow-hidden relative w-full h-64 bg-neutral-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.entry_images[0].image_url}
                      alt={entry.title}
                      className="object-cover w-full h-full transition duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient border-0 bg-[linear-gradient(to_top,rgba(23,23,23,0.6),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex gap-2 items-center mb-3">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {entry.event_type}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {entry.event_date}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-rose-400">
                    {entry.title}
                  </h3>

                  {entry.location && (
                    <p className="mb-3 text-xs text-neutral-400">
                      📍 {entry.location}
                    </p>
                  )}

                  {/* Brand Badges */}
                  {entry.brands && entry.brands.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {entry.brands.map((brand, i) => (
                        <span
                          key={`${brand}-${i}`}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 hover:border-rose-500/40 hover:text-rose-300 transition-all duration-150 inline-flex items-center gap-1"
                        >
                          🏷️ {brand}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.remarks && (
                    <p className="pt-3 text-sm italic leading-relaxed border-t text-neutral-300 border-neutral-800/80 line-clamp-2">
                      "{entry.remarks}"
                    </p>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="py-16 px-4 text-center border rounded-2xl bg-neutral-900/40 border-neutral-800/80">
          <p className="text-sm text-neutral-400">
            No fashion entries found matching your search or filters.
          </p>
          <button
            onClick={() => {
              setSelectedType('All Types');
              setSelectedMemberId('ALL');
              setSearchQuery('');
            }}
            className="mt-4 text-xs font-semibold underline transition cursor-pointer text-rose-400 hover:text-rose-300 active:scale-95 underline-offset-4"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}