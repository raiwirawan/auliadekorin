import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Mail, ChevronDown, Sparkles } from 'lucide-react';
import { Wedding, THEMES } from '../types';

interface InvitationOverlayProps {
  wedding: Wedding;
  inviteeName?: string;
  onOpen: () => void;
}

export default function InvitationOverlay({ wedding, inviteeName, onOpen }: InvitationOverlayProps) {
  const theme = THEMES[wedding.theme] || THEMES.pastel;
  const [petals, setPetals] = useState<{ id: number; x: number; delay: number; size: number; rotate: number }[]>([]);

  useEffect(() => {
    // Generate random floating petals/particles
    const generated = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 4,
      size: 8 + Math.random() * 14,
      rotate: Math.random() * 360,
    }));
    setPetals(generated);
  }, []);

  // Determine overlay colors based on theme
  const overlayStyles: Record<string, { bg: string; text: string; accent: string; btn: string; subtext: string; petalColor: string }> = {
    pastel: {
      bg: 'from-[#FDF6F0] via-[#F5E6D8] to-[#EDD5BE]',
      text: 'text-[#5A4B41]',
      accent: 'text-[#BC8A5F]',
      btn: 'bg-[#D4A373] hover:bg-[#BC8A5F] text-white',
      subtext: 'text-[#8C7B6E]',
      petalColor: 'bg-[#E8C4A0]/40',
    },
    gold: {
      bg: 'from-[#0D0D0D] via-[#1A1500] to-[#1A1A1A]',
      text: 'text-[#D4AF37]',
      accent: 'text-[#F0D060]',
      btn: 'bg-[#D4AF37] hover:bg-[#B8962E] text-black',
      subtext: 'text-[#9A8030]',
      petalColor: 'bg-[#D4AF37]/20',
    },
    'dark-romantic': {
      bg: 'from-[#1A0D1A] via-[#2D1B2D] to-[#1A0D1A]',
      text: 'text-[#E0C3E0]',
      accent: 'text-[#C47EC4]',
      btn: 'bg-[#8E448E] hover:bg-[#703670] text-white',
      subtext: 'text-[#A080A0]',
      petalColor: 'bg-[#8E448E]/20',
    },
    'modern-minimal': {
      bg: 'from-white via-gray-50 to-gray-100',
      text: 'text-black',
      accent: 'text-gray-500',
      btn: 'bg-black hover:bg-gray-800 text-white',
      subtext: 'text-gray-500',
      petalColor: 'bg-gray-200/60',
    },
  };

  const style = overlayStyles[wedding.theme] || overlayStyles.pastel;

  return (
    <motion.div
      key="overlay"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br ${style.bg} overflow-hidden`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* ── Floating Petals / Particles ── */}
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${style.petalColor} pointer-events-none`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: '-5%',
            rotate: p.rotate,
          }}
          animate={{
            y: ['0vh', '110vh'],
            opacity: [0, 0.8, 0.6, 0],
            rotate: [p.rotate, p.rotate + 180],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* ── Top decorative line ── */}
      <motion.div
        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      />

      {/* ── Main Card ── */}
      <motion.div
        className="relative flex flex-col items-center text-center px-8 max-w-sm w-full mx-auto"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Envelope icon with pulse ring */}
        <div className="relative mb-8">
          <motion.div
            className={`absolute inset-0 rounded-full ${style.petalColor}`}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${style.petalColor}`}>
            <Mail className={`w-9 h-9 ${style.accent}`} strokeWidth={1.5} />
          </div>
        </div>

        {/* Eyebrow label */}
        <motion.div
          className="flex items-center gap-2 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className={`h-px w-8 bg-current opacity-25 ${style.text}`} />
          <span className={`text-xs font-semibold tracking-[0.25em] uppercase ${style.subtext}`}>
            Undangan Pernikahan
          </span>
          <span className={`h-px w-8 bg-current opacity-25 ${style.text}`} />
        </motion.div>

        {/* Couple names */}
        <motion.h1
          className={`text-4xl sm:text-5xl font-serif mb-2 leading-tight ${style.text}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          {wedding.brideName}
          <br />
          <span className={`text-2xl sm:text-3xl font-sans font-light tracking-widest opacity-50 ${style.text}`}>
            &amp;
          </span>
          <br />
          {wedding.groomName}
        </motion.h1>

        {/* Divider */}
        <motion.div
          className={`flex items-center gap-3 my-6 w-full max-w-[200px]`}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <span className={`h-px flex-1 bg-current opacity-20 ${style.text}`} />
          <Heart className={`w-4 h-4 fill-current ${style.accent}`} />
          <span className={`h-px flex-1 bg-current opacity-20 ${style.text}`} />
        </motion.div>

        {/* Invitee greeting */}
        {inviteeName ? (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <p className={`text-sm mb-1 ${style.subtext}`}>Kepada Yth.</p>
            <p className={`text-2xl sm:text-3xl font-bold ${style.text}`}>{inviteeName}</p>
          </motion.div>
        ) : (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className={`text-sm ${style.subtext}`}>Kami mengundang kehadiran Anda</p>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.button
          id="open-invitation-btn"
          onClick={onOpen}
          className={`group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] ${style.btn}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles className="w-4 h-4" />
          Buka Undangan
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </motion.button>

        {/* Subtle hint */}
        <motion.p
          className={`mt-4 text-xs ${style.subtext} opacity-60`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.4 }}
        >
          Ketuk tombol di atas untuk membuka undangan
        </motion.p>
      </motion.div>

      {/* ── Bottom decorative element ── */}
      <motion.div
        className="absolute bottom-8 inset-x-0 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
      >
        <p className={`text-xs font-sans tracking-widest uppercase ${style.subtext}`}>
          AuliaDekorin
        </p>
      </motion.div>
    </motion.div>
  );
}
