import React, { useState } from 'react';
import { Wedding, THEMES } from '../types';
import CountdownTimer from './CountdownTimer';
import MusicPlayer from './MusicPlayer';
import InvitationOverlay from './InvitationOverlay';
import { MapPin, Calendar, Clock, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface WeddingPageViewProps {
	wedding: Wedding;
	isPreview?: boolean;
	inviteeName?: string; // from ?to= URL param
}

export default function WeddingPageView({ wedding, isPreview = false, inviteeName }: WeddingPageViewProps) {
  const theme = THEMES[wedding.theme] || THEMES.pastel;

  // Overlay: only show if there's an inviteeName AND we're not in preview mode
  const [overlayVisible, setOverlayVisible] = useState(!isPreview);

  const fontClass =
    wedding.fontStyle === 'serif'
      ? 'font-serif'
      : wedding.fontStyle === 'script'
      ? 'font-script'
      : 'font-sans';

  const waMessage = inviteeName
    ? `Halo Kak, saya ${inviteeName} ingin konfirmasi kehadiran di pernikahan ${wedding.brideName} & ${wedding.groomName} 💌`
    : `Halo Kak, saya ingin konfirmasi kehadiran di pernikahan ${wedding.brideName} & ${wedding.groomName} 💌`;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${fontClass} selection:bg-neutral-200`}>
      {/* ── Invitation Overlay (Splash Screen) ─────────────────────────── */}
      <AnimatePresence>
        {overlayVisible && (
          <InvitationOverlay
            wedding={wedding}
            inviteeName={inviteeName}
            onOpen={() => setOverlayVisible(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img
            src={wedding.heroImage || 'https://picsum.photos/seed/wedding/1920/1080'}
            alt="Wedding Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-5 py-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl mb-4 drop-shadow-lg leading-tight">
              {wedding.brideName} &amp; {wedding.groomName}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl italic opacity-90 mb-8 font-serif px-2">
              {wedding.tagline || "We're getting married!"}
            </p>

            {wedding.showCountdown && wedding.date && (
              <CountdownTimer targetDate={wedding.date} className="mt-8 sm:mt-12" />
            )}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="w-5 h-8 border-2 border-white/40 rounded-full flex items-start justify-center pt-1"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Details Section ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${theme.card} p-8 sm:p-12 rounded-3xl border shadow-xl`}
        >
          <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 flex items-center justify-center gap-3">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8" /> Save the Date
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Calendar className="w-6 h-6 mb-2 opacity-60" />
                <p className="text-lg sm:text-xl font-medium">
                  {wedding.date ? format(new Date(wedding.date), 'MMMM do, yyyy') : 'TBD'}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-6 h-6 mb-2 opacity-60" />
                <p className="text-lg sm:text-xl font-medium">{wedding.time || 'TBD'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <MapPin className="w-6 h-6 mb-2 opacity-60" />
                <p className="text-lg sm:text-xl font-medium">{wedding.venueName || 'Venue Name'}</p>
                <p className="opacity-80 text-sm sm:text-base mt-1 px-2">{wedding.venueAddress || 'Venue Address'}</p>
                {wedding.venueMapsUrl && (
                  <a
                    href={wedding.venueMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block underline underline-offset-4 hover:opacity-70 transition-opacity text-sm sm:text-base"
                  >
                    Lihat di Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Story Section ────────────────────────────────────────────── */}
      {wedding.loveStory && (
        <section className="py-16 sm:py-24 px-4 bg-black/5">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-6 sm:mb-8 opacity-20" />
            <h2 className="text-3xl sm:text-4xl mb-8 sm:mb-12">Our Love Story</h2>
            <div className="prose prose-sm sm:prose-lg mx-auto text-inherit opacity-90 leading-relaxed whitespace-pre-wrap">
              {wedding.loveStory}
            </div>
          </div>
        </section>
      )}

      {/* ── Confirmation Section ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${theme.card} p-8 sm:p-12 rounded-3xl border shadow-xl text-center`}
        >
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-5 opacity-30" />
          <h2 className="text-2xl sm:text-3xl mb-4">Konfirmasi Kehadiran</h2>
          <p className="opacity-70 mb-8 max-w-sm mx-auto leading-relaxed text-sm sm:text-base">
            {inviteeName
              ? `Kami sangat berharap kehadiran ${inviteeName} dapat menjadi bagian dari momen bahagia kami.`
              : 'Kami sangat berharap kehadiran Anda dapat menjadi bagian dari momen bahagia kami.'}
          </p>

          {!isPreview ? (
            <a
              id="wa-rsvp-btn"
              href={`https://wa.me/6287126323423?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 rounded-full font-semibold text-base sm:text-lg transition-all hover:scale-105 shadow-lg ${theme.button}`}
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              Konfirmasi via WhatsApp
            </a>
          ) : (
            <div
              className={`inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 rounded-full font-semibold text-base sm:text-lg opacity-50 cursor-not-allowed ${theme.button}`}
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              Konfirmasi via WhatsApp
            </div>
          )}
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="py-10 text-center opacity-40 text-xs sm:text-sm font-sans">
        <p>Dibuat dengan ❤️ oleh AuliaDekorin</p>
      </footer>

      {wedding.musicId && <MusicPlayer musicId={wedding.musicId} />}
    </div>
  );
}
