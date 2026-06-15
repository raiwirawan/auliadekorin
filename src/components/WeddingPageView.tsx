import React, { useState } from 'react';
import { Wedding, THEMES } from '../types';
import CountdownTimer from './CountdownTimer';
import MusicPlayer from './MusicPlayer';
import { MapPin, Calendar, Clock, Heart, ChevronDown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface WeddingPageViewProps {
  wedding: Wedding;
  isPreview?: boolean;
  inviteeName?: string; // from ?to= URL param
}

export default function WeddingPageView({ wedding, isPreview = false, inviteeName }: WeddingPageViewProps) {
  const theme = THEMES[wedding.theme] || THEMES.pastel;
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  const fontClass = wedding.fontStyle === 'serif' ? 'font-serif' : wedding.fontStyle === 'script' ? 'font-script' : 'font-sans';

  const waMessage = inviteeName
    ? `Halo Kak, saya ${inviteeName} ingin konfirmasi kehadiran di pernikahan ${wedding.brideName} & ${wedding.groomName} 💌`
    : `Halo Kak, saya ingin konfirmasi kehadiran di pernikahan ${wedding.brideName} & ${wedding.groomName} 💌`;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${fontClass} selection:bg-neutral-200`}>

      {/* ── Personalized Invitation Banner ─────────────────────────── */}
      {inviteeName && (
        <div className="fixed top-0 inset-x-0 z-50">
          <AnimatePresence>
            {!envelopeOpen ? (
              <motion.div
                key="envelope"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="flex items-center justify-between gap-4 px-6 py-4 bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest font-sans font-medium">
                      Undangan untuk
                    </p>
                    <p className="text-base font-bold text-neutral-900 font-sans leading-tight">
                      {inviteeName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEnvelopeOpen(true)}
                  className="text-neutral-400 hover:text-neutral-700 transition-colors p-1 font-sans text-xs flex items-center gap-1"
                  title="Tutup"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className={`relative h-screen flex items-center justify-center overflow-hidden ${inviteeName && !envelopeOpen ? 'pt-16' : ''}`}>
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img
            src={wedding.heroImage || "https://picsum.photos/seed/wedding/1920/1080"}
            alt="Wedding Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-5xl md:text-8xl mb-4 drop-shadow-lg">
              {wedding.brideName} &amp; {wedding.groomName}
            </h1>
            <p className="text-xl md:text-2xl italic opacity-90 mb-8 font-serif">
              {wedding.tagline || "We're getting married!"}
            </p>

            {wedding.showCountdown && wedding.date && (
              <CountdownTimer targetDate={wedding.date} className="mt-12" />
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Details Section ──────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${theme.card} p-12 rounded-3xl border shadow-xl`}
        >
          <h2 className="text-3xl mb-12 flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8" /> Save the Date
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <Calendar className="w-6 h-6 mb-2 opacity-60" />
                <p className="text-xl font-medium">
                  {wedding.date ? format(new Date(wedding.date), 'MMMM do, yyyy') : 'TBD'}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-6 h-6 mb-2 opacity-60" />
                <p className="text-xl font-medium">{wedding.time || 'TBD'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <MapPin className="w-6 h-6 mb-2 opacity-60" />
                <p className="text-xl font-medium">{wedding.venueName || 'Venue Name'}</p>
                <p className="opacity-80">{wedding.venueAddress || 'Venue Address'}</p>
                {wedding.venueMapsUrl && (
                  <a
                    href={wedding.venueMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block underline underline-offset-4 hover:opacity-70 transition-opacity"
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
        <section className="py-24 px-4 bg-black/5">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-12 h-12 mx-auto mb-8 opacity-20" />
            <h2 className="text-4xl mb-12">Our Love Story</h2>
            <div className="prose prose-lg mx-auto text-inherit opacity-90 leading-relaxed whitespace-pre-wrap">
              {wedding.loveStory}
            </div>
          </div>
        </section>
      )}

      {/* ── Confirmation Section ─────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${theme.card} p-8 md:p-12 rounded-3xl border shadow-xl text-center`}
        >
          <Heart className="w-10 h-10 mx-auto mb-6 opacity-30" />
          <h2 className="text-3xl mb-4">Konfirmasi Kehadiran</h2>
          <p className="opacity-70 mb-8 max-w-sm mx-auto leading-relaxed">
            {inviteeName
              ? `Kami sangat berharap kehadiran ${inviteeName} dapat menjadi bagian dari momen bahagia kami.`
              : 'Kami sangat berharap kehadiran Anda dapat menjadi bagian dari momen bahagia kami.'}
          </p>

          {!isPreview ? (
            <a
              href={`https://wa.me/6287126323423?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg ${theme.button}`}
            >
              <MessageCircle className="w-5 h-5" />
              Konfirmasi via WhatsApp
            </a>
          ) : (
            <div className={`inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-semibold text-lg opacity-50 cursor-not-allowed ${theme.button}`}>
              <MessageCircle className="w-5 h-5" />
              Konfirmasi via WhatsApp
            </div>
          )}
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="py-12 text-center opacity-40 text-sm font-sans">
        <p>Dibuat dengan ❤️ oleh AuliaDekorin</p>
      </footer>

      {wedding.musicId && <MusicPlayer musicId={wedding.musicId} />}
    </div>
  );
}
