"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Trash2, Star, Plus, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';

interface ProductImageManagerProps {
  initialImage?: string;
  initialImages?: string[];
}

export function ProductImageManager({ initialImage = '', initialImages = [] }: ProductImageManagerProps) {
  // Combine primary and extra images into unique list
  const initialList = Array.from(
    new Set([initialImage, ...initialImages].filter(Boolean))
  );

  const [images, setImages] = useState<string[]>(initialList);
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryImage = images[primaryIndex] || images[0] || '';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        uploadedUrls.push(data.url);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error uploading image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    setImages((prev) => [...prev, manualUrl.trim()]);
    setManualUrl('');
    setShowManualInput(false);
  };

  const handleDelete = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (primaryIndex >= updated.length) {
        setPrimaryIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleSetPrimary = (index: number) => {
    setPrimaryIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Hidden inputs for parent form submission */}
      <input type="hidden" name="image" value={primaryImage} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Product Images ({images.length})
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-mono"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Add by URL</span>
          </button>
        </div>
      </div>

      {showManualInput && (
        <div className="flex gap-2 p-3 bg-muted/20 border border-border/60 rounded-xl animate-in fade-in">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/component.jpg"
            className="flex-1 bg-background/80 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-primary/90 transition"
          >
            Add
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of uploaded images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, index) => {
          const isPrimary = index === primaryIndex;
          return (
            <div
              key={index}
              className={`relative aspect-square rounded-2xl overflow-hidden border bg-background/60 group ${
                isPrimary ? 'border-primary shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-primary' : 'border-border/60'
              }`}
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                sizes="120px"
                className="object-contain p-2"
              />

              {/* Primary badge */}
              {isPrimary && (
                <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md font-mono uppercase tracking-wider shadow-md">
                  Primary
                </span>
              )}

              {/* Action buttons overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    title="Set as Primary"
                    className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground transition-colors"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  title="Delete image"
                  className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Upload Button Box */}
        <label className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer bg-muted/10 hover:bg-primary/5 transition-colors p-4 text-center group">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-[11px] text-muted-foreground font-mono">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">Upload Image</span>
              <span className="text-[9px] text-muted-foreground/60 font-mono">JPG, PNG, WEBP &lt; 5MB</span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
