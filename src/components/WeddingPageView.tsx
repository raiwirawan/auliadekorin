import React, { useState } from "react";
import { Wedding, THEMES } from "../types";
import CountdownTimer from "./CountdownTimer";
import MusicPlayer from "./MusicPlayer";
import InvitationOverlay from "./InvitationOverlay";
import {
	MapPin,
	Calendar,
	Clock,
	Heart,
	MessageCircle,
	Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

interface WeddingPageViewProps {
	wedding: Wedding;
	isPreview?: boolean;
	inviteeName?: string;
}

/* ─── Design tokens (DESIGN_WEDDING.md) ─────────────────────────────────── */
const COLOR = {
	black: "#111111", // off-black per spec
	white: "#FFFFFF",
	beige: "#F5F1E8",
	grey: "#808080",
	taupe: "#B38B6D",
} as const;

/* ─── Thin geometric divider line (Swiss Style) ──────────────────────────── */
const GeometricDivider = ({ className = "" }: { className?: string }) => (
	<div className={`flex items-center gap-3 ${className}`}>
		<div
			className="flex-1 h-px"
			style={{ background: COLOR.grey, opacity: 0.2 }}
		/>
		<div
			className="w-1.5 h-1.5 rotate-45"
			style={{ background: COLOR.taupe, opacity: 0.6 }}
		/>
		<div
			className="flex-1 h-px"
			style={{ background: COLOR.grey, opacity: 0.2 }}
		/>
	</div>
);

/* ─── Section label (caps, letter-spaced) ────────────────────────────────── */
const SectionLabel = ({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) => (
	<p
		className={`font-sans uppercase tracking-[0.25em] ${className}`}
		style={{ fontSize: "0.7rem", color: COLOR.taupe, fontWeight: 500 }}
	>
		{children}
	</p>
);

/* ─── Accent: taupe per-theme fallback ───────────────────────────────────── */
const ACCENT_HEX: Record<string, string> = {
	pastel: "#B38B6D",
	gold: "#B38B6D",
	"dark-romantic": "#B38B6D",
	"modern-minimal": "#B38B6D",
};

/* ─── Motion variants (fade + translateY 16px, 420ms ease-out) ───────────── */
const fadeUp = {
	hidden: { opacity: 0, y: 16 },
	show: (delay = 0) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.42, ease: "easeOut", delay },
	}),
};

/* ══════════════════════════════════════════════════════════════════════════ */
export default function WeddingPageView({
	wedding,
	isPreview = false,
	inviteeName,
}: WeddingPageViewProps) {
	const theme = THEMES[wedding.theme] || THEMES.pastel;
	const accentHex = ACCENT_HEX[wedding.theme] || COLOR.taupe;
	const [overlayVisible, setOverlayVisible] = useState(!isPreview);

	const fontClass =
		wedding.fontStyle === "serif"
			? "font-serif"
			: wedding.fontStyle === "script"
				? "font-script"
				: "font-sans";

	const waMessage = inviteeName
		? `Halo Kak, saya ${inviteeName} ingin konfirmasi kehadiran di pernikahan ${wedding.brideName} & ${wedding.groomName}`
		: `Halo Kak, saya ingin konfirmasi kehadiran di pernikahan ${wedding.brideName} & ${wedding.groomName}`;

	/* ── Sizing tokens: compact (isPreview) vs full ──────────────────────── */
	const S = isPreview
		? {
				heroH: "h-screen min-h-[480px]",
				namesH1: "text-4xl leading-tight",
				ampersand: "text-lg",
				tagline: "text-xs",
				sectionPy: "py-10 px-4",
				cardP: "p-5",
				sectionTitle: "text-base",
				bodyText: "text-xs",
				btnPx: "px-4 py-2.5 text-xs",
				iconBox: "w-8 h-8",
				iconSize: "w-3.5 h-3.5",
				rowPad: "p-3 gap-3",
				rowTitle: "text-[8px]",
				rowValue: "text-xs",
			}
		: {
				heroH: "min-h-[100dvh]",
				namesH1: "text-5xl md:text-8xl lg:text-9xl leading-tight",
				ampersand: "text-xl md:text-3xl",
				tagline: "text-base md:text-xl",
				sectionPy: "py-20 md:py-32 px-4",
				cardP: "p-8 md:p-12",
				sectionTitle: "text-2xl md:text-3xl",
				bodyText: "text-base md:text-lg",
				btnPx: "px-8 md:px-12 py-4 md:py-5 text-base",
				iconBox: "w-11 h-11 md:w-13 md:h-13",
				iconSize: "w-5 h-5",
				rowPad: "p-4 md:p-5 gap-4",
				rowTitle: "text-[10px]",
				rowValue: "text-base md:text-lg",
			};

	/* ── Determine bg/text from theme ───────────────────────────────────── */
	// Swiss minimalism overrides: use beige/black for pastel & modern-minimal
	const isLight = ["pastel", "modern-minimal"].includes(wedding.theme);
	const pageBg = isLight ? COLOR.beige : undefined;
	const pageText = isLight ? COLOR.black : undefined;

	return (
		<div
			className={`${theme.bg} ${theme.text} ${fontClass} overflow-x-hidden`}
			style={{
				minHeight: "100%",
				backgroundColor: pageBg,
				color: pageText,
			}}
		>
			{/* ── Invitation Overlay ───────────────────────────────────────── */}
			<AnimatePresence>
				{overlayVisible && (
					<InvitationOverlay
						wedding={wedding}
						inviteeName={inviteeName}
						onOpen={() => setOverlayVisible(false)}
					/>
				)}
			</AnimatePresence>

			{/* ══════════════════════════════════════════════════════════════ */}
			{/* HERO                                                           */}
			{/* ══════════════════════════════════════════════════════════════ */}
			<section
				className={`relative ${S.heroH} flex items-center justify-center overflow-hidden`}
			>
				{/* Cinematic background */}
				<motion.div
					className="absolute inset-0 z-0"
					initial={{ scale: 1.08, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 1.8, ease: "easeOut" }}
				>
					<img
						src={wedding.heroImage || "/wedding-view.jpg"}
						alt="Wedding backdrop"
						className="w-full h-full object-cover"
						referrerPolicy="no-referrer"
					/>
					{/* dark gradient overlay */}
					<div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/40 to-black/80" />
					<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
					{/* radial vignette */}
					<div
						className="absolute inset-0"
						style={{
							background:
								"radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
						}}
					/>
				</motion.div>

				{/* ── Hero text ─────────────────────────────────────────── */}
				<div className="relative z-10 text-white text-center px-6 w-full max-w-5xl mx-auto flex flex-col items-center">
					{/* Eyebrow label */}
					<motion.div
						className="flex items-center gap-3 mb-8"
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.42, ease: "easeOut" }}
					>
						<div
							className="h-px w-8"
							style={{ background: "rgba(255,255,255,0.35)" }}
						/>
						<SectionLabel className="text-white opacity-70">
							Wedding Invitation
						</SectionLabel>
						<div
							className="h-px w-8"
							style={{ background: "rgba(255,255,255,0.35)" }}
						/>
					</motion.div>

					{/* Bride name */}
					<motion.h1
						className={`${S.namesH1} font-bold tracking-tight`}
						style={{ textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.42, ease: "easeOut" }}
					>
						{wedding.brideName || "Bride"}
					</motion.h1>

					{/* Divider with taupe diamond */}
					<motion.div
						className="flex items-center gap-4 my-4 w-full max-w-xs"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.46, duration: 0.42, ease: "easeOut" }}
					>
						<div
							className="flex-1 h-px"
							style={{ background: "rgba(255,255,255,0.25)" }}
						/>
						<div
							className="w-2 h-2 rotate-45"
							style={{ background: accentHex, opacity: 0.8 }}
						/>
						<div
							className="flex-1 h-px"
							style={{ background: "rgba(255,255,255,0.25)" }}
						/>
					</motion.div>

					{/* Groom name */}
					<motion.h1
						className={`${S.namesH1} font-bold tracking-tight`}
						style={{ textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.38, duration: 0.42, ease: "easeOut" }}
					>
						{wedding.groomName || "Groom"}
					</motion.h1>

					{/* Tagline */}
					<motion.p
						className={`${S.tagline} font-sans opacity-75 mt-6 px-4 leading-relaxed max-w-lg`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.75 }}
						transition={{ delay: 0.56, duration: 0.42, ease: "easeOut" }}
					>
						{wedding.tagline || "We're getting married"}
					</motion.p>

					{/* Countdown */}
					{wedding.showCountdown && wedding.date && (
						<motion.div
							className="mt-10"
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7, duration: 0.42, ease: "easeOut" }}
						>
							<CountdownTimer targetDate={wedding.date} />
						</motion.div>
					)}
				</div>

				{/* Scroll indicator — thin pulsing line */}
				<motion.div
					className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.4, duration: 0.6 }}
				>
					<motion.div
						className="w-px bg-white/35"
						style={{ height: 40 }}
						animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
						transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
					/>
				</motion.div>
			</section>

			{/* ══════════════════════════════════════════════════════════════ */}
			{/* SAVE THE DATE                                                  */}
			{/* ══════════════════════════════════════════════════════════════ */}
			<section className={S.sectionPy}>
				<motion.div
					className="max-w-3xl mx-auto"
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-60px" }}
					variants={{
						hidden: {},
						show: { transition: { staggerChildren: 0.08 } },
					}}
				>
					{/* Section header */}
					<motion.div
						className="flex flex-col items-center mb-10 text-center gap-3"
						variants={fadeUp}
					>
						<SectionLabel>Save the Date</SectionLabel>
						<h2
							className={`${S.sectionTitle} font-bold tracking-tight`}
							style={{ color: isLight ? COLOR.black : undefined }}
						>
							The Big Day
						</h2>
						<GeometricDivider className="w-32" />
					</motion.div>

					{/* Info card — sharp 0px corners, 1px border */}
					<motion.div
						className={`${theme.card} border overflow-hidden ${S.cardP}`}
						style={{
							borderRadius: 0,
							boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
							borderColor: `${accentHex}30`,
						}}
						variants={fadeUp}
					>
						{/* Top accent strip */}
						<div
							className="h-px w-full mb-6"
							style={{
								background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
							}}
						/>

						<div
							className={`grid gap-4 ${isPreview ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}
						>
							{/* Date */}
							<motion.div
								className={`flex items-start ${S.rowPad}`}
								style={{
									background: `${accentHex}0D`,
									borderLeft: `2px solid ${accentHex}`,
								}}
								variants={fadeUp}
							>
								<div
									className={`${S.iconBox} flex items-center justify-center shrink-0`}
									style={{ background: `${accentHex}18` }}
								>
									<Calendar
										className={S.iconSize}
										style={{ color: accentHex }}
									/>
								</div>
								<div className="ml-3">
									<p
										className={`${S.rowTitle} font-sans uppercase tracking-[0.2em] mb-0.5`}
										style={{ color: COLOR.grey }}
									>
										Tanggal
									</p>
									<p className={`${S.rowValue} font-semibold`}>
										{wedding.date
											? format(new Date(wedding.date), "d MMMM yyyy")
											: "TBD"}
									</p>
								</div>
							</motion.div>

							{/* Time */}
							<motion.div
								className={`flex items-start ${S.rowPad}`}
								style={{
									background: `${accentHex}0D`,
									borderLeft: `2px solid ${accentHex}`,
								}}
								variants={fadeUp}
							>
								<div
									className={`${S.iconBox} flex items-center justify-center shrink-0`}
									style={{ background: `${accentHex}18` }}
								>
									<Clock className={S.iconSize} style={{ color: accentHex }} />
								</div>
								<div className="ml-3">
									<p
										className={`${S.rowTitle} font-sans uppercase tracking-[0.2em] mb-0.5`}
										style={{ color: COLOR.grey }}
									>
										Waktu
									</p>
									<p className={`${S.rowValue} font-semibold`}>
										{wedding.time || "TBD"}
									</p>
								</div>
							</motion.div>

							{/* Venue */}
							<motion.div
								className={`flex items-start ${S.rowPad}`}
								style={{
									background: `${accentHex}0D`,
									borderLeft: `2px solid ${accentHex}`,
								}}
								variants={fadeUp}
							>
								<div
									className={`${S.iconBox} flex items-center justify-center shrink-0`}
									style={{ background: `${accentHex}18` }}
								>
									<MapPin className={S.iconSize} style={{ color: accentHex }} />
								</div>
								<div className="ml-3 min-w-0">
									<p
										className={`${S.rowTitle} font-sans uppercase tracking-[0.2em] mb-0.5`}
										style={{ color: COLOR.grey }}
									>
										Lokasi
									</p>
									<p className={`${S.rowValue} font-semibold`}>
										{wedding.venueName || "Venue Name"}
									</p>
									{wedding.venueAddress && (
										<p
											className="leading-snug mt-0.5"
											style={{
												fontSize: isPreview ? 10 : 13,
												color: COLOR.grey,
											}}
										>
											{wedding.venueAddress}
										</p>
									)}
									{wedding.venueMapsUrl && (
										<a
											href={wedding.venueMapsUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 mt-2 font-sans transition-opacity hover:opacity-80"
											style={{
												fontSize: isPreview ? 9 : 11,
												color: accentHex,
												textDecoration: "underline",
												textUnderlineOffset: 3,
											}}
										>
											<Navigation
												style={{
													width: isPreview ? 9 : 11,
													height: isPreview ? 9 : 11,
												}}
											/>
											Lihat di Google Maps
										</a>
									)}
								</div>
							</motion.div>
						</div>

						{/* Bottom accent strip */}
						<div
							className="h-px w-full mt-6"
							style={{
								background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
							}}
						/>
					</motion.div>
				</motion.div>
			</section>

			{/* ══════════════════════════════════════════════════════════════ */}
			{/* LOVE STORY                                                     */}
			{/* ══════════════════════════════════════════════════════════════ */}
			{wedding.loveStory && (
				<section
					className={`${S.sectionPy} relative overflow-hidden`}
					style={{ background: `${accentHex}07` }}
				>
					{/* Subtle background grid line */}
					<div
						className="absolute inset-0 pointer-events-none"
						style={{
							backgroundImage: `linear-gradient(${accentHex}10 1px, transparent 1px)`,
							backgroundSize: "100% 64px",
						}}
					/>

					<motion.div
						className="max-w-3xl mx-auto relative"
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-60px" }}
						variants={{
							hidden: {},
							show: { transition: { staggerChildren: 0.08 } },
						}}
					>
						{/* Section header */}
						<motion.div
							className="flex flex-col items-center mb-10 text-center gap-3"
							variants={fadeUp}
						>
							<SectionLabel>Our Journey</SectionLabel>
							<h2 className={`${S.sectionTitle} font-bold tracking-tight`}>
								Love Story
							</h2>
							<GeometricDivider className="w-32" />
						</motion.div>

						{/* Story card — sharp, 1px border, minimal shadow */}
						<motion.div
							className={`${theme.card} border relative overflow-hidden ${S.cardP}`}
							style={{
								borderRadius: 0,
								boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
								borderColor: `${accentHex}30`,
							}}
							variants={fadeUp}
						>
							{/* Top accent line */}
							<div
								className="absolute top-0 left-0 right-0 h-px"
								style={{
									background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
								}}
							/>

							{/* Large decorative quote mark */}
							<div
								className="absolute top-3 left-4 font-serif select-none pointer-events-none leading-none"
								style={{
									fontSize: isPreview ? 60 : 120,
									color: accentHex,
									opacity: 0.07,
								}}
							>
								"
							</div>

							<p
								className={`${S.bodyText} leading-relaxed whitespace-pre-wrap relative z-10 mt-4`}
								style={{
									color: isLight ? COLOR.black : undefined,
									opacity: 0.8,
								}}
							>
								{wedding.loveStory}
							</p>

							{/* Bottom accent line */}
							<div
								className="absolute bottom-0 left-0 right-0 h-px"
								style={{
									background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
								}}
							/>
						</motion.div>
					</motion.div>
				</section>
			)}

			{/* ══════════════════════════════════════════════════════════════ */}
			{/* RSVP / KONFIRMASI                                              */}
			{/* ══════════════════════════════════════════════════════════════ */}
			<section className={S.sectionPy}>
				<motion.div
					className="max-w-lg mx-auto"
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-60px" }}
					variants={{
						hidden: {},
						show: { transition: { staggerChildren: 0.08 } },
					}}
				>
					<motion.div
						className={`${theme.card} border overflow-hidden ${S.cardP} text-center`}
						style={{
							borderRadius: 0,
							boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
							borderColor: `${accentHex}30`,
						}}
						variants={fadeUp}
					>
						{/* Top accent strip */}
						<div
							className="h-px w-full mb-8"
							style={{
								background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
							}}
						/>

						{/* Icon */}
						<motion.div
							className="flex flex-col items-center mb-6 gap-4"
							variants={fadeUp}
						>
							<div
								className="flex items-center justify-center"
								style={{
									width: isPreview ? 36 : 52,
									height: isPreview ? 36 : 52,
									background: `${accentHex}15`,
									border: `1px solid ${accentHex}40`,
								}}
							>
								<Heart
									style={{
										width: isPreview ? 16 : 22,
										height: isPreview ? 16 : 22,
										color: accentHex,
									}}
								/>
							</div>
							<SectionLabel>Konfirmasi</SectionLabel>
							<h2 className={`${S.sectionTitle} font-bold tracking-tight`}>
								Kehadiran Anda
							</h2>
							<GeometricDivider className="w-24" />
						</motion.div>

						<motion.p
							className={`${S.bodyText} leading-relaxed mb-8 max-w-sm mx-auto`}
							style={{ color: COLOR.grey }}
							variants={fadeUp}
						>
							{inviteeName
								? `Kami sangat berharap kehadiran ${inviteeName} dapat menjadi bagian dari momen bahagia kami.`
								: "Kami sangat berharap kehadiran Anda dapat menjadi bagian dari momen bahagia kami."}
						</motion.p>

						{!isPreview ? (
							<motion.a
								id="wa-rsvp-btn"
								href={`https://wa.me/6287126323423?text=${encodeURIComponent(waMessage)}`}
								target="_blank"
								rel="noreferrer"
								className={`inline-flex items-center justify-center gap-3 w-full font-semibold font-sans transition-all ${S.btnPx} ${theme.button}`}
								style={{ borderRadius: 0 }}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								variants={fadeUp}
							>
								<MessageCircle className="w-4 h-4 shrink-0" />
								Konfirmasi via WhatsApp
							</motion.a>
						) : (
							<motion.div
								className={`inline-flex items-center justify-center gap-3 w-full font-semibold font-sans opacity-40 cursor-not-allowed ${S.btnPx} ${theme.button}`}
								style={{ borderRadius: 0 }}
								variants={fadeUp}
							>
								<MessageCircle className="w-4 h-4 shrink-0" />
								Konfirmasi via WhatsApp
							</motion.div>
						)}

						{/* Bottom accent strip */}
						<div
							className="h-px w-full mt-8"
							style={{
								background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
							}}
						/>
					</motion.div>
				</motion.div>
			</section>

			{/* ══════════════════════════════════════════════════════════════ */}
			{/* FOOTER                                                         */}
			{/* ══════════════════════════════════════════════════════════════ */}
			<footer
				className="text-center font-sans border-t"
				style={{
					padding: isPreview ? "20px 16px" : "48px 16px",
					borderColor: `${accentHex}20`,
				}}
			>
				<GeometricDivider className="max-w-32 mx-auto mb-4" />
				<p
					className="font-sans uppercase tracking-[0.2em]"
					style={{
						fontSize: isPreview ? 8 : 10,
						color: COLOR.grey,
						opacity: 0.5,
					}}
				>
					Dibuat dengan cinta oleh AuliaDekorin
				</p>
			</footer>

			{/* Music */}
			{wedding.musicId && !isPreview && (
				<MusicPlayer musicId={wedding.musicId} />
			)}
		</div>
	);
}
