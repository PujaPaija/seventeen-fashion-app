'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';

interface ImageItem {
  id: string;
  image_url: string;
}

export default function EventGallery({
  entryId,
  initialImages,
}: {
  entryId: string;
  initialImages: ImageItem[];
}) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrlsText, setImageUrlsText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

 // 1. Delete single gallery photo handler
  const handleDeletePhoto = async (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation(); // Prevents opening the full-screen modal

    if (!confirm('Delete this image from gallery?')) return;

    const { error } = await supabase
      .from('entry_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      alert('Error deleting image: ' + error.message);
    } else {
      // Force page data refresh and reload state
      router.refresh();
      window.location.reload(); 
    }
  };

  // 2. Bulk add photos handler
  const handleAddPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlsText.trim()) return;

    const urls = imageUrlsText
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) return;

    setIsUploading(true);

    const rowsToInsert = urls.map((url) => ({
      entry_id: entryId,
      image_url: url,
    }));

    const { error } = await supabase.from('entry_images').insert(rowsToInsert);

    setIsUploading(false);

    if (error) {
      alert('Error uploading images: ' + error.message);
    } else {
      setImageUrlsText('');
      setShowUploadModal(false);
      router.refresh();
    }
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Media Gallery</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition"
        >
          + Add Multiple Photos
        </button>
      </div>

      {/* Grid of Images */}
      {initialImages && initialImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img.image_url)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer group"
            >
              {/* Delete button on top-right corner of each picture */}
              <button
                onClick={(e) => handleDeletePhoto(e, img.id)}
                title="Delete Photo"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 bg-black/70 hover:bg-rose-600 text-white text-xs w-7 h-7 rounded-full flex items-center justify-center transition duration-200"
              >
                ✕
              </button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt="Event Media"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">No additional photos found for this event.</p>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-xl bg-neutral-800/80 hover:bg-neutral-700 w-10 h-10 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-2">Add Photo URLs (Bulk)</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Paste multiple image links below (put each URL on a new line).
            </p>

            <form onSubmit={handleAddPhotos} className="space-y-4">
              <div>
                <textarea
                  rows={6}
                  required
                  placeholder={`https://images.com/photo1.jpg\nhttps://images.com/photo2.jpg\nhttps://images.com/photo3.jpg`}
                  value={imageUrlsText}
                  onChange={(e) => setImageUrlsText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500 font-mono resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save All Photos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}