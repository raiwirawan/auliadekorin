import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Wedding } from '../types';
import WeddingPageView from '../components/WeddingPageView';
import { Loader2, AlertTriangle } from 'lucide-react';
import supabase from '../utils/supabase';

/* ─── Design tokens (DESIGN_WEDDING.md) ─────────────────────────────────── */
const C = {
  black: '#111111',
  white: '#FFFFFF',
  beige: '#F5F1E8',
  grey: '#808080',
  taupe: '#B38B6D',
  border: '#E2DDD7',
} as const;

export default function PublicWeddingPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const inviteeName = searchParams.get('to')
    ? decodeURIComponent(searchParams.get('to')!)
    : undefined;
  const navigate = useNavigate();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('weddings')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (dbError || !data) throw new Error('Not found');

        setWedding({
          id: data.id,
          slug: data.slug,
          user_id: data.user_id,
          is_published: data.is_published,
          brideName: data.bride_name,
          groomName: data.groom_name,
          date: data.date,
          time: data.time,
          venueName: data.venue_name,
          venueAddress: data.venue_address,
          venueMapsUrl: data.venue_maps_url,
          tagline: data.tagline,
          loveStory: data.love_story,
          theme: data.theme,
          fontStyle: data.font_style,
          musicId: data.music_id,
          showCountdown: data.show_countdown,
          rsvpDeadline: data.rsvp_deadline,
          heroImage: data.hero_image,
          whatsappNumber: data.whatsapp_number ?? undefined,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchWedding();
  }, [slug]);

  /* ── Loading state ──────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center gap-4"
        style={{ background: C.beige }}
      >
        {/* Animated taupe line — matches design spec's entry animation */}
        <Loader2
          className="w-7 h-7 animate-spin"
          style={{ color: C.taupe }}
        />
        <p
          className="font-sans uppercase tracking-[0.25em]"
          style={{ fontSize: '0.65rem', color: C.grey }}
        >
          Loading invitation
        </p>
      </div>
    );
  }

  /* ── Not found / error state ────────────────────────────────────────────── */
  if (error || !wedding) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center"
        style={{ background: C.beige }}
      >
        {/* Swiss-style error card — sharp corners, minimal shadow */}
        <div
          className="max-w-sm w-full p-10 border"
          style={{
            background: C.white,
            borderColor: C.border,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Icon in a square container */}
          <div
            className="w-12 h-12 flex items-center justify-center mx-auto mb-6"
            style={{
              background: `${C.taupe}12`,
              border: `1px solid ${C.taupe}30`,
            }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: C.taupe }} />
          </div>

          {/* Label */}
          <p
            className="font-sans uppercase tracking-[0.2em] mb-2"
            style={{ fontSize: '0.65rem', color: C.grey }}
          >
            404 — Not Found
          </p>

          {/* Heading */}
          <h1
            className="text-xl font-bold tracking-tight mb-3"
            style={{ color: C.black }}
          >
            Wedding Not Found
          </h1>

          {/* Body */}
          <p
            className="text-sm font-sans leading-relaxed mb-8"
            style={{ color: C.grey }}
          >
            The page you're looking for doesn't exist or has been removed.
          </p>

          {/* Divider */}
          <div
            className="h-px w-full mb-8"
            style={{
              background: `linear-gradient(90deg, transparent, ${C.taupe}60, transparent)`,
            }}
          />

          {/* CTA button — sharp, black fill */}
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 font-sans font-semibold text-xs uppercase tracking-[0.2em] transition-all hover:opacity-80"
            style={{ background: C.black, color: C.white }}
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <WeddingPageView wedding={wedding} inviteeName={inviteeName} />;
}
