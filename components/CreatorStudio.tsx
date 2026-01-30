import React, { useMemo, useRef, useState } from 'react';
import { X, Upload, Image as ImageIcon, Video, Music, Sparkles, CheckCircle2 } from 'lucide-react';

type CreatorAssetType = 'photo' | 'video' | 'short' | 'story' | 'audio';

interface CreatorStudioProps {
  onClose: () => void;
  onPublishToFeed?: (payload: { url: string; mediaType: 'image' | 'video' | 'audio'; postType: 'post' | 'short' | 'story'; caption: string }) => void;
}

const ASSET_TYPES: Array<{ key: CreatorAssetType; label: string; icon: any; accept: string; mediaType: 'image' | 'video' | 'audio'; postType: 'post' | 'short' | 'story' }> = [
  { key: 'photo', label: 'Photo', icon: ImageIcon, accept: 'image/*', mediaType: 'image', postType: 'post' },
  { key: 'video', label: 'Video', icon: Video, accept: 'video/*', mediaType: 'video', postType: 'post' },
  { key: 'short', label: 'Short', icon: Sparkles, accept: 'video/*,image/*', mediaType: 'video', postType: 'short' },
  { key: 'story', label: 'Story', icon: Sparkles, accept: 'video/*,image/*', mediaType: 'image', postType: 'story' },
  { key: 'audio', label: 'Audio', icon: Music, accept: 'audio/*', mediaType: 'audio', postType: 'post' }
];

export default function CreatorStudio({ onClose, onPublishToFeed }: CreatorStudioProps) {
  const [type, setType] = useState<CreatorAssetType>('photo');
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<{ url: string; mediaType: 'image' | 'video' | 'audio'; postType: 'post' | 'short' | 'story' } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = useMemo(() => ASSET_TYPES.find((t) => t.key === type)!, [type]);

  const pickFile = () => inputRef.current?.click();

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onloadend = () => {
      const url = r.result as string;
      const detected: 'image' | 'video' | 'audio' = f.type.startsWith('video')
        ? 'video'
        : f.type.startsWith('audio')
          ? 'audio'
          : 'image';

      setPreview({ url, mediaType: detected, postType: active.postType });
    };
    r.readAsDataURL(f);
  };

  const publish = () => {
    if (!preview) return;
    onPublishToFeed?.({
      url: preview.url,
      mediaType: preview.mediaType,
      postType: preview.postType,
      caption: caption.trim() || 'New drop from my Creator Studio ✨'
    });
    setCaption('');
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 z-[1600] bg-black flex flex-col animate-in slide-in-from-left duration-300">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl p-4 pt-12 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black italic tracking-tighter">Creator Studio</h2>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Videos • photos • shorts • stories • audio</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-28 space-y-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {ASSET_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === type;
            return (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-white/10'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          className="bg-white/5 border-2 border-dashed border-white/15 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={pickFile}
        >
          <div className="p-4 bg-white/5 rounded-full">
            <Upload size={28} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black">Upload {active.label}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tap to choose file</p>
          </div>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept={active.accept}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>

        {preview && (
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-4">
            <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-black">
              {preview.mediaType === 'image' && <img src={preview.url} className="w-full h-72 object-cover" alt="preview" />}
              {preview.mediaType === 'video' && (
                <video src={preview.url} className="w-full h-72 object-cover" autoPlay loop muted playsInline controls />
              )}
              {preview.mediaType === 'audio' && (
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Music size={18} className="text-blue-400" />
                    <p className="font-black">Audio Preview</p>
                  </div>
                  <audio src={preview.url} controls className="w-full" />
                </div>
              )}
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption…"
              className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-5 h-28 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10">
        <button
          onClick={publish}
          disabled={!preview}
          className="w-full bg-blue-600 disabled:opacity-40 text-white font-black py-4 rounded-2xl shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} /> PUBLISH TO FEED
        </button>
      </div>
    </div>
  );
}

