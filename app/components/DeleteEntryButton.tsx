'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DeleteEntryButtonProps {
  entryId: string;
}

export default function DeleteEntryButton({ entryId }: DeleteEntryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this fashion entry?')) {
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading('Deleting entry...');

    try {
      const { error } = await supabase
        .from('fashion_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Fashion entry deleted successfully!', { id: toastId });
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entry';
      toast.error(`Error: ${errorMessage}`, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-950/80 text-rose-400 border border-neutral-800 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all duration-200 backdrop-blur-md cursor-pointer disabled:opacity-50"
      title="Delete Entry"
    >
      {isDeleting ? 'Deleting...' : '🗑️ Delete'}
    </button>
  );
}