import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Music2,
  Sparkles,
  Volume2,
  VolumeX,
  AlertCircle,
  Zap,
  CheckCircle,
  Moon,
  Play,
  Pause
} from 'lucide-react';
import { FeedPost, ThrottleStatus } from '../../types';
import { ThrottleOverlay } from './ThrottleOverlay';
import { soundFx } from '../../services/audio';

interface SocialFeedProps {
  throttleStatus: ThrottleStatus;
  onOpenStroopTest: () => void;
  onOpenStudyGate: () => void;
  isDaytimePassActive: boolean;
  passTimeFormatted: string;
}

const MOCK_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    author: 'NeuroLab Bio',
    handle: '@neurolab_ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    caption: 'Why late-night scrolling destroys slow-wave deep sleep 🧠⚡ ipRGCs in your retinas signal the SCN to slash melatonin production by up to 88%. Put the phone down.',
    tags: ['#neuroscience', '#circadian', '#sleephealth', '#biohacking'],
    category: 'science',
    videoUrl: '/videos/clip1.mp4',
    posterBg: 'from-violet-950 via-slate-900 to-indigo-950',
    likes: 14200,
    comments: 894,
    shares: 2310,
    soundtrack: 'Synthwave Reverie - Sleep Architecture Vol. 1'
  },
  {
    id: 'post-2',
    author: 'Deep Work Lab',
    handle: '@cal_newport_vibes',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    caption: 'The brutal math of dopamine loops: 10 seconds of random short clips fragments attention spans for 23 minutes. Reclaim your focus capacity today.',
    tags: ['#deepwork', '#attention', '#focus', '#productivity'],
    category: 'focus',
    videoUrl: '/videos/clip2.mp4',
    posterBg: 'from-cyan-950 via-slate-900 to-blue-950',
    likes: 28900,
    comments: 1420,
    shares: 4890,
    soundtrack: 'Ambient Lo-Fi Beats - Midnight Flow'
  },
  {
    id: 'post-3',
    author: 'Huberman Protocol',
    handle: '@circadian_clock',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    caption: 'Morning sunlight within 30 minutes of waking triggers cortisol peak and starts your 16-hour countdown timer for natural melatonin release! ☀️',
    tags: ['#huberman', '#morningroutine', '#circadianrhythm'],
    category: 'nature',
    videoUrl: '/videos/clip3.mp4',
    posterBg: 'from-amber-950 via-slate-900 to-orange-950',
    likes: 36700,
    comments: 2105,
    shares: 8900,
    soundtrack: 'Dawn Harmonics - Solar Awakening'
  },
  {
    id: 'post-4',
    author: 'Algorithm Breaker',
    handle: '@anti_algorithm',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    caption: 'Infinite scrolling is not your friend. It was literally designed around slot machine mechanics (variable-ratio reward schedules). You are the product.',
    tags: ['#techcritique', '#mindfulness', '#comeback'],
    category: 'tech',
    videoUrl: '/videos/clip4.mp4',
    posterBg: 'from-emerald-950 via-slate-900 to-teal-950',
    likes: 19400,
    comments: 630,
    shares: 3120,
    soundtrack: 'Cyber Pulse - Neon Protocol'
  }
];

export const SocialFeed: React.FC<SocialFeedProps> = ({
  throttleStatus,
  onOpenStroopTest,
  onOpenStudyGate,
  isDaytimePassActive,
  passTimeFormatted
}) => {
  const [activePostIndex, setActivePostIndex] = useState<number>(0);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    MOCK_POSTS.forEach((p) => {
      map[p.id] = p.likes;
    });
    return map;
  });
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isManuallyPaused, setIsManuallyPaused] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Toggle play/pause when user taps the video
  const handleTogglePlayPause = (idx: number) => {
    const vid = videoRefs.current[idx];
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsManuallyPaused(false)).catch(() => {});
    } else {
      vid.pause();
      setIsManuallyPaused(true);
    }
  };

  // Toggle like
  const handleToggleLike = (postId: string) => {
    soundFx.playSuccess();
    setLikedPosts((prev) => {
      const isLiked = !prev[postId];
      setLikeCounts((counts) => ({
        ...counts,
        [postId]: counts[postId] + (isLiked ? 1 : -1)
      }));
      return { ...prev, [postId]: isLiked };
    });
  };

  // Autoplay visible video, pause others, handle throttle buffering
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      vid.muted = isMuted;

      if (idx === activePostIndex) {
        if (throttleStatus.isBuffering || isManuallyPaused) {
          vid.pause();
        } else {
          // If throttled, simulate slow network by slowing video playback to 0.5x
          try {
            vid.playbackRate = throttleStatus.isThrottled ? 0.5 : 1.0;
          } catch {}
          vid.play().catch((err) => {
            console.log('Autoplay waiting for interaction:', err);
          });
        }
      } else {
        vid.pause();
        try {
          vid.currentTime = 0;
        } catch {}
      }
    });
  }, [activePostIndex, throttleStatus.isBuffering, throttleStatus.isThrottled, isMuted, isManuallyPaused]);

  // Sluggish scroll simulation: when throttled, add touch/wheel drag resistance
  const handleScroll = () => {
    if (!containerRef.current) return;
    const height = containerRef.current.clientHeight;
    const scrollTop = containerRef.current.scrollTop;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== activePostIndex && newIndex >= 0 && newIndex < MOCK_POSTS.length) {
      setActivePostIndex(newIndex);
      setIsManuallyPaused(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-105px)] overflow-hidden bg-black">
      {/* Floating Active Pass / Circadian Banner */}
      <div className="absolute top-2 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
        {isDaytimePassActive ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-[11px] shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span>10-MIN PASS: {passTimeFormatted}</span>
          </div>
        ) : throttleStatus.isThrottled ? (
          <button
            onClick={onOpenStroopTest}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/90 border border-amber-500/60 text-amber-300 font-mono text-[11px] shadow-lg backdrop-blur-md hover:bg-amber-900/90 transition-all"
          >
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span>THROTTLED: Tap for Dawn Stroop</span>
          </button>
        ) : (
          <button
            onClick={onOpenStudyGate}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/90 border border-violet-500/50 text-violet-300 font-mono text-[11px] shadow-lg backdrop-blur-md hover:bg-violet-900/90 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span>Active Recall Gate: Get 10m Pass</span>
          </button>
        )}

        <button
          onClick={() => setIsMuted((m) => !m)}
          className="p-1.5 rounded-full bg-slate-900/80 border border-zinc-700/60 text-zinc-300 backdrop-blur-md"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>

      {/* Throttled Slow Network Indicator Banner */}
      {throttleStatus.isThrottled && (
        <div className="absolute top-11 left-3 right-3 z-20 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/95 border border-amber-500/60 text-amber-300 font-mono text-[10px] shadow-lg backdrop-blur-md animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">SIMULATED 2G NETWORK // 3s BUFFERING EVERY 4s</span>
        </div>
      )}

      {/* Main Reels Snap-Scroll Container with progressive grayscale and sluggish scroll */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          filter: throttleStatus.grayscaleLevel > 0 ? `grayscale(${throttleStatus.grayscaleLevel}%)` : 'none',
          transition: 'filter 0.6s ease-in-out',
          scrollBehavior: throttleStatus.isThrottled ? 'auto' : 'smooth'
        }}
        className={`w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar ${
          throttleStatus.isThrottled ? 'overscroll-none select-none cursor-not-allowed' : ''
        }`}
      >
        {MOCK_POSTS.map((post, index) => {
          const isLiked = !!likedPosts[post.id];
          const isCurrent = index === activePostIndex;

          return (
            <div
              key={post.id}
              className="relative w-full h-full snap-start flex-shrink-0 bg-slate-950 flex flex-col justify-end p-4 pb-16 overflow-hidden select-none"
            >
              {/* Video or Graphic Background */}
              <div
                className="absolute inset-0 z-0 cursor-pointer"
                onClick={() => handleTogglePlayPause(index)}
              >
                {post.videoUrl ? (
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={post.videoUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-b ${post.posterBg} opacity-90`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40 pointer-events-none" />

                {/* Paused icon indicator */}
                {isCurrent && isManuallyPaused && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-fadeIn">
                    <div className="p-4 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                      <Play className="w-8 h-8 fill-current translate-x-0.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bedtime Throttle Forced Buffer Spinner */}
              {isCurrent && (
                <ThrottleOverlay
                  isBuffering={throttleStatus.isBuffering}
                  onOpenStroopTest={onOpenStroopTest}
                  reason={throttleStatus.reason}
                  cooldownSeconds={throttleStatus.failedCooldownRemainingSeconds}
                />
              )}

              {/* Right Interaction Bar */}
              <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-4">
                {/* Like Button */}
                <button
                  onClick={() => handleToggleLike(post.id)}
                  className="flex flex-col items-center group active:scale-125 transition-transform"
                >
                  <div
                    className={`p-2.5 rounded-full backdrop-blur-md border ${
                      isLiked
                        ? 'bg-rose-500/30 border-rose-500 text-rose-500'
                        : 'bg-black/40 border-white/10 text-white group-hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-300 mt-1 font-semibold">
                    {likeCounts[post.id]?.toLocaleString()}
                  </span>
                </button>

                {/* Comment Button */}
                <button className="flex flex-col items-center group">
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white group-hover:text-cyan-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-300 mt-1 font-semibold">
                    {post.comments.toLocaleString()}
                  </span>
                </button>

                {/* Share Button */}
                <button className="flex flex-col items-center group">
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white group-hover:text-emerald-400">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-300 mt-1 font-semibold">
                    {post.shares.toLocaleString()}
                  </span>
                </button>

                {/* Vinyl Record */}
                <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-zinc-700/80 p-1 animate-spin-slow flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                </div>
              </div>

              {/* Bottom Post Metadata */}
              <div className="relative z-10 max-w-[80%] text-left">
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-8 h-8 rounded-full border border-violet-400/50 object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1 font-mono">
                      {post.author}
                      <CheckCircle className="w-3 h-3 text-violet-400 fill-violet-400/20" />
                    </h4>
                    <p className="text-[10px] text-zinc-400">{post.handle}</p>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-xs text-zinc-200 line-clamp-3 leading-relaxed mb-2 font-sans font-normal drop-shadow-sm">
                  {post.caption}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono text-violet-300/90 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Soundtrack */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                  <Music2 className="w-3 h-3 text-violet-400 animate-pulse" />
                  <span className="truncate max-w-[190px]">{post.soundtrack}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
