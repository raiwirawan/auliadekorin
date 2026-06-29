import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { Wedding, THEMES, MUSIC_TRACKS } from "../types";
import WeddingPageView from "../components/WeddingPageView";
import { motion, AnimatePresence } from "motion/react";
import {
	ChevronRight,
	ChevronLeft,
	Send,
	Eye,
	Edit3,
	CheckCircle,
	Copy,
	Upload,
	Link,
	Loader2,
	X,
	LayoutDashboard,
	Save,
	AlertTriangle,
} from "lucide-react";
import { uploadHeroImage } from "../utils/uploadImage";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";
import { nanoid } from "nanoid";

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
	black: "#111111",
	white: "#FFFFFF",
	beige: "#F5F1E8",
	grey: "#808080",
	taupe: "#B38B6D",
	surface: "#F7F4EF", // slightly off-white for inputs
	border: "#E2DDD7",
} as const;

/* ─── Reusable label ─────────────────────────────────────────────────────── */
const FieldLabel = ({
	children,
	htmlFor,
}: {
	children: React.ReactNode;
	htmlFor?: string;
}) => (
	<label
		htmlFor={htmlFor}
		className="block font-sans font-medium uppercase tracking-[0.18em] mb-2"
		style={{ fontSize: "0.7rem", color: C.grey }}
	>
		{children}
	</label>
);

/* ─── Input base class ───────────────────────────────────────────────────── */
const inputCls =
	"w-full px-4 py-3.5 font-sans text-sm outline-none transition-all border border-[#E2DDD7] bg-[#F7F4EF] focus:border-[#B38B6D] focus:ring-2 focus:ring-[#B38B6D]/20";

/* ─── Step indicator ─────────────────────────────────────────────────────── */
const StepDots = ({ total, current }: { total: number; current: number }) => (
	<div className="flex items-center gap-2">
		{Array.from({ length: total }).map((_, i) => (
			<div
				key={i}
				className="transition-all"
				style={{
					width: i + 1 === current ? 20 : 6,
					height: 6,
					background: i + 1 === current ? C.taupe : C.border,
				}}
			/>
		))}
	</div>
);

export default function CreatePage() {
	const navigate = useNavigate();
	const { id: editId } = useParams<{ id?: string }>();
	const isEditMode = Boolean(editId);
	const { user } = useAuth();
	const [step, setStep] = useState(1);
	const [isPublishing, setIsPublishing] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const [savedSlug, setSavedSlug] = useState<string | null>(null);
	const [publishError, setPublishError] = useState<string | null>(null);
	const [showPreview, setShowPreview] = useState(false);
	const [heroInputMode, setHeroInputMode] = useState<"upload" | "url">(
		"upload",
	);
	const [isUploadingHero, setIsUploadingHero] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [customSlug, setCustomSlug] = useState("");
	const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
	const [loadError, setLoadError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const previewPanelRef = useRef<HTMLDivElement>(null);
	const [phoneScale, setPhoneScale] = useState(1);

	const PHONE_W = 390;
	const PHONE_H = 844;
	const PHONE_BORDER = 12;

	useEffect(() => {
		const panel = previewPanelRef.current;
		if (!panel) return;
		const PADDING = 64;
		const computeScale = () => {
			const available = panel.clientWidth - PADDING;
			const byWidth = available / (PHONE_W + PHONE_BORDER * 2);
			const byHeight =
				(panel.clientHeight - 120) / (PHONE_H + PHONE_BORDER * 2);
			setPhoneScale(Math.min(1, byWidth, byHeight));
		};
		computeScale();
		const ro = new ResizeObserver(computeScale);
		ro.observe(panel);
		return () => ro.disconnect();
	}, []);

	// Load existing wedding data in edit mode
	useEffect(() => {
		if (!isEditMode || !editId || !user) return;
		const loadWedding = async () => {
			try {
				const { data, error: dbError } = await supabase
					.from("weddings")
					.select("*")
					.eq("id", editId)
					.eq("user_id", user.id)
					.single();
				if (dbError) throw new Error(dbError.message);
				if (!data) throw new Error("Wedding not found.");
				setFormData({
					brideName: data.bride_name ?? "",
					groomName: data.groom_name ?? "",
					date: data.date ?? "",
					time: data.time ?? "",
					venueName: data.venue_name ?? "",
					venueAddress: data.venue_address ?? "",
					venueMapsUrl: data.venue_maps_url ?? "",
					tagline: data.tagline ?? "",
					loveStory: data.love_story ?? "",
					theme: data.theme ?? "pastel",
					fontStyle: data.font_style ?? "serif",
					musicId: data.music_id ?? "romantic-piano",
					showCountdown: data.show_countdown ?? true,
					rsvpDeadline: data.rsvp_deadline ?? "",
					heroImage: data.hero_image ?? "",
					id: data.id,
					slug: data.slug,
					user_id: data.user_id,
					is_published: data.is_published,
				});
				setSavedSlug(data.slug);
			} catch (err: any) {
				setLoadError(err.message);
			} finally {
				setIsLoadingEdit(false);
			}
		};
		loadWedding();
	}, [isEditMode, editId, user]);

	const handleFileUpload = async (file: File) => {
		if (!file.type.startsWith("image/")) {
			setUploadError("Please select a valid image file.");
			return;
		}
		setIsUploadingHero(true);
		setUploadError(null);
		try {
			const publicUrl = await uploadHeroImage(file);
			setFormData((prev) => ({ ...prev, heroImage: publicUrl }));
		} catch (err: any) {
			setUploadError(err.message || "Failed to upload image.");
		} finally {
			setIsUploadingHero(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const file = e.dataTransfer.files?.[0];
		if (file) handleFileUpload(file);
	};

	const [formData, setFormData] = useState<Wedding>({
		brideName: "",
		groomName: "",
		date: "",
		time: "",
		venueName: "",
		venueAddress: "",
		venueMapsUrl: "",
		tagline: "",
		loveStory: "",
		theme: "pastel",
		fontStyle: "serif",
		musicId: "romantic-piano",
		showCountdown: true,
		rsvpDeadline: "",
		heroImage: "",
	});

	const handlePublish = async () => {
		if (!user) return;
		setIsPublishing(true);
		setPublishError(null);
		try {
			if (isEditMode && editId) {
				const { error: dbError } = await supabase
					.from("weddings")
					.update({
						bride_name: formData.brideName,
						groom_name: formData.groomName,
						date: formData.date,
						time: formData.time,
						venue_name: formData.venueName,
						venue_address: formData.venueAddress,
						venue_maps_url: formData.venueMapsUrl,
						tagline: formData.tagline,
						love_story: formData.loveStory,
						theme: formData.theme,
						font_style: formData.fontStyle,
						music_id: formData.musicId,
						show_countdown: formData.showCountdown,
						rsvp_deadline: formData.rsvpDeadline,
						hero_image: formData.heroImage,
					})
					.eq("id", editId)
					.eq("user_id", user.id);
				if (dbError) throw new Error(dbError.message);
				setIsSaved(true);
			} else {
				let slug: string;
				if (customSlug.trim()) {
					slug = customSlug
						.trim()
						.toLowerCase()
						.replace(/\s+/g, "-")
						.replace(/[^a-z0-9-]/g, "");
					if (!slug) {
						setPublishError("Invalid custom slug.");
						return;
					}
					const { data: existing } = await supabase
						.from("weddings")
						.select("id")
						.eq("slug", slug)
						.maybeSingle();
					if (existing) {
						setPublishError(
							"This URL slug is already taken. Please choose another.",
						);
						return;
					}
				} else {
					slug =
						`${formData.brideName.toLowerCase()}-and-${formData.groomName.toLowerCase()}-${nanoid(6)}`.replace(
							/\s+/g,
							"-",
						);
				}

				const { error: dbError } = await supabase.from("weddings").insert({
					slug,
					user_id: user.id,
					is_published: true,
					bride_name: formData.brideName,
					groom_name: formData.groomName,
					date: formData.date,
					time: formData.time,
					venue_name: formData.venueName,
					venue_address: formData.venueAddress,
					venue_maps_url: formData.venueMapsUrl,
					tagline: formData.tagline,
					love_story: formData.loveStory,
					theme: formData.theme,
					font_style: formData.fontStyle,
					music_id: formData.musicId,
					show_countdown: formData.showCountdown,
					rsvp_deadline: formData.rsvpDeadline,
					hero_image: formData.heroImage,
				});

				if (dbError) throw new Error(dbError.message);
				setSavedSlug(slug);
				setIsSaved(true);
			}
		} catch (error: any) {
			console.error(error);
			setPublishError(error.message || "Failed to save wedding page.");
		} finally {
			setIsPublishing(false);
		}
	};

	const copyToClipboard = () => {
		const url = `${window.location.origin}/w/${savedSlug}`;
		navigator.clipboard.writeText(url);
		alert("Link copied to clipboard!");
	};

	/* ── Loading state ────────────────────────────────────────────────────── */
	if (isLoadingEdit) {
		return (
			<div
				className="min-h-screen flex items-center justify-center"
				style={{ background: C.beige }}
			>
				<div
					className="flex flex-col items-center gap-4"
					style={{ color: C.grey }}
				>
					<Loader2
						className="w-8 h-8 animate-spin"
						style={{ color: C.taupe }}
					/>
					<span
						className="font-sans uppercase tracking-widest"
						style={{ fontSize: "0.7rem" }}
					>
						Loading wedding data
					</span>
				</div>
			</div>
		);
	}

	/* ── Load error state ─────────────────────────────────────────────────── */
	if (loadError) {
		return (
			<div
				className="min-h-screen flex items-center justify-center p-4"
				style={{ background: C.beige }}
			>
				<div
					className="p-10 max-w-md w-full text-center border"
					style={{
						background: C.white,
						borderColor: C.border,
						boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
					}}
				>
					<AlertTriangle
						className="w-8 h-8 mx-auto mb-4"
						style={{ color: C.taupe }}
					/>
					<p
						className="font-sans font-medium mb-6 text-sm"
						style={{ color: C.black }}
					>
						{loadError}
					</p>
					<button
						onClick={() => navigate("/dashboard")}
						className="px-6 py-3 font-sans font-semibold text-sm uppercase tracking-widest transition-all hover:opacity-80"
						style={{ background: C.black, color: C.white }}
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	/* ── Success / saved state ────────────────────────────────────────────── */
	if (isSaved) {
		return (
			<div
				className="min-h-screen flex items-center justify-center p-4"
				style={{ background: C.beige }}
			>
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.42, ease: "easeOut" }}
					className="p-10 md:p-14 max-w-lg w-full text-center border"
					style={{
						background: C.white,
						borderColor: C.border,
						boxShadow: "0 2px 24px rgba(0,0,0,0.08)",
					}}
				>
					{/* Success icon */}
					<div
						className="w-14 h-14 flex items-center justify-center mx-auto mb-6"
						style={{
							background: `${C.taupe}15`,
							border: `1px solid ${C.taupe}40`,
						}}
					>
						<CheckCircle className="w-7 h-7" style={{ color: C.taupe }} />
					</div>

					<p
						className="font-sans uppercase tracking-[0.2em] mb-2"
						style={{ fontSize: "0.65rem", color: C.grey }}
					>
						{isEditMode ? "Updated" : "Published"}
					</p>
					<h1
						className="text-2xl md:text-3xl font-bold tracking-tight mb-3"
						style={{ color: C.black }}
					>
						{isEditMode ? "Changes Saved" : "Your Page is Live"}
					</h1>
					<p
						className="text-sm font-sans leading-relaxed mb-8"
						style={{ color: C.grey }}
					>
						{isEditMode
							? "Your wedding page has been updated successfully."
							: "Your personalized wedding invitation is ready to share."}
					</p>

					{/* URL display */}
					<div
						className="flex items-center justify-between px-4 py-3 mb-8 border"
						style={{
							background: C.surface,
							borderColor: C.border,
						}}
					>
						<span
							className="text-xs font-mono truncate mr-3"
							style={{ color: C.grey }}
						>
							{window.location.origin}/w/{savedSlug}
						</span>
						<button
							onClick={copyToClipboard}
							className="p-1.5 transition-all hover:opacity-60 shrink-0"
							title="Copy link"
						>
							<Copy className="w-4 h-4" style={{ color: C.taupe }} />
						</button>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-3">
						<button
							onClick={() => navigate(`/w/${savedSlug}`)}
							className="w-full py-3.5 font-sans font-semibold text-sm uppercase tracking-widest transition-all hover:opacity-80"
							style={{ background: C.black, color: C.white }}
						>
							View My Page
						</button>
						<button
							onClick={() => navigate("/dashboard")}
							className="w-full py-3.5 font-sans font-semibold text-sm uppercase tracking-widest border transition-all hover:opacity-60 flex items-center justify-center gap-2"
							style={{
								background: "transparent",
								color: C.black,
								borderColor: C.border,
							}}
						>
							<LayoutDashboard className="w-4 h-4" />
							Dashboard
						</button>
						<button
							onClick={() => navigate("/")}
							className="w-full py-3.5 font-sans text-sm uppercase tracking-widest transition-all hover:opacity-50"
							style={{ color: C.grey }}
						>
							Back to Home
						</button>
					</div>
				</motion.div>
			</div>
		);
	}

	/* ── Main create/edit layout ──────────────────────────────────────────── */
	return (
		<div
			className="h-screen flex flex-col md:flex-row overflow-hidden"
			style={{ background: C.white }}
		>
			{/* ── Form side ──────────────────────────────────────────────── */}
			<div
				className={`flex-1 flex flex-col h-screen overflow-y-auto ${showPreview ? "hidden md:flex" : "flex"}`}
				style={{ background: C.white }}
			>
				{/* Header */}
				<header
					className="px-6 py-4 flex justify-between items-center sticky top-0 z-10 border-b"
					style={{
						background: C.white,
						borderColor: C.border,
					}}
				>
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 flex items-center justify-center overflow-hidden">
							<img
								src="/aulia_dekorin_logo.png"
								alt="AuliaDekorin Logo"
								className="w-full h-full object-contain"
							/>
						</div>
						<span
							className="font-bold tracking-tight text-lg"
							style={{ color: C.black }}
						>
							AuliaDekorin
						</span>
						{isEditMode && (
							<span
								className="text-xs font-sans font-medium px-2 py-0.5 uppercase tracking-wider border"
								style={{
									fontSize: "0.6rem",
									color: C.taupe,
									borderColor: `${C.taupe}40`,
									background: `${C.taupe}10`,
								}}
							>
								Editing
							</span>
						)}
					</div>

					<div className="flex items-center gap-4">
						<button
							onClick={() => setShowPreview(true)}
							className="md:hidden flex items-center gap-2 text-xs font-sans font-medium px-4 py-2 uppercase tracking-widest border transition-all hover:opacity-70"
							style={{ borderColor: C.border, color: C.black }}
						>
							<Eye className="w-3.5 h-3.5" /> Preview
						</button>
						<StepDots total={4} current={step} />
						<span className="font-sans text-xs" style={{ color: C.grey }}>
							{step} / 4
						</span>
					</div>
				</header>

				{/* Main form content */}
				<main className="flex-1 px-6 py-8 md:px-12 md:py-12 max-w-2xl mx-auto w-full">
					<AnimatePresence mode="wait">
						{/* ── STEP 1: Basic Information ──────────────────────────── */}
						{step === 1 && (
							<motion.div
								key="step1"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								transition={{ duration: 0.25, ease: "easeOut" }}
								className="space-y-8"
							>
								<div>
									<p
										className="font-sans uppercase tracking-[0.2em] mb-2"
										style={{ fontSize: "0.65rem", color: C.taupe }}
									>
										Step 01
									</p>
									<h2
										className="text-2xl md:text-3xl font-bold tracking-tight mb-1"
										style={{ color: C.black }}
									>
										Basic Information
									</h2>
									<p className="text-sm font-sans" style={{ color: C.grey }}>
										Start with the essentials of your big day.
									</p>
								</div>

								<div className="grid grid-cols-2 gap-5">
									<div>
										<FieldLabel htmlFor="brideName">Bride's Name</FieldLabel>
										<input
											id="brideName"
											type="text"
											placeholder="Jane"
											className={inputCls}
											value={formData.brideName}
											onChange={(e) =>
												setFormData({ ...formData, brideName: e.target.value })
											}
										/>
									</div>
									<div>
										<FieldLabel htmlFor="groomName">Groom's Name</FieldLabel>
										<input
											id="groomName"
											type="text"
											placeholder="John"
											className={inputCls}
											value={formData.groomName}
											onChange={(e) =>
												setFormData({ ...formData, groomName: e.target.value })
											}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-5">
									<div>
										<FieldLabel htmlFor="weddingDate">Date</FieldLabel>
										<input
											id="weddingDate"
											type="date"
											className={inputCls}
											value={formData.date}
											onChange={(e) =>
												setFormData({ ...formData, date: e.target.value })
											}
										/>
									</div>
									<div>
										<FieldLabel htmlFor="weddingTime">Time</FieldLabel>
										<input
											id="weddingTime"
											type="time"
											className={inputCls}
											value={formData.time}
											onChange={(e) =>
												setFormData({ ...formData, time: e.target.value })
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<div>
										<FieldLabel htmlFor="venueName">Venue Name</FieldLabel>
										<input
											id="venueName"
											type="text"
											placeholder="The Grand Palace"
											className={inputCls}
											value={formData.venueName}
											onChange={(e) =>
												setFormData({ ...formData, venueName: e.target.value })
											}
										/>
									</div>
									<div>
										<FieldLabel htmlFor="venueAddress">
											Venue Address
										</FieldLabel>
										<input
											id="venueAddress"
											type="text"
											placeholder="123 Wedding St, Love City"
											className={inputCls}
											value={formData.venueAddress}
											onChange={(e) =>
												setFormData({
													...formData,
													venueAddress: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<FieldLabel htmlFor="venueMaps">
											Google Maps URL{" "}
											<span
												className="normal-case"
												style={{ color: C.border, fontWeight: 400 }}
											>
												(optional)
											</span>
										</FieldLabel>
										<input
											id="venueMaps"
											type="url"
											placeholder="https://maps.google.com/..."
											className={inputCls}
											value={formData.venueMapsUrl}
											onChange={(e) =>
												setFormData({
													...formData,
													venueMapsUrl: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</motion.div>
						)}

						{/* ── STEP 2: Love Story ─────────────────────────────────── */}
						{step === 2 && (
							<motion.div
								key="step2"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								transition={{ duration: 0.25, ease: "easeOut" }}
								className="space-y-8"
							>
								<div>
									<p
										className="font-sans uppercase tracking-[0.2em] mb-2"
										style={{ fontSize: "0.65rem", color: C.taupe }}
									>
										Step 02
									</p>
									<h2
										className="text-2xl md:text-3xl font-bold tracking-tight mb-1"
										style={{ color: C.black }}
									>
										Love Story
									</h2>
									<p className="text-sm font-sans" style={{ color: C.grey }}>
										Share the magic of how you both met and fell in love.
									</p>
								</div>

								<div className="space-y-5">
									<div>
										<FieldLabel htmlFor="tagline">
											Tagline / Subtitle
										</FieldLabel>
										<input
											id="tagline"
											type="text"
											placeholder="A journey of a thousand miles begins with a single step..."
											className={inputCls}
											value={formData.tagline}
											onChange={(e) =>
												setFormData({ ...formData, tagline: e.target.value })
											}
										/>
									</div>

									<div>
										<FieldLabel htmlFor="loveStory">The Story</FieldLabel>
										<textarea
											id="loveStory"
											rows={6}
											placeholder="It all started when..."
											className={`${inputCls} resize-none`}
											value={formData.loveStory}
											onChange={(e) =>
												setFormData({ ...formData, loveStory: e.target.value })
											}
										/>
									</div>

									{/* Hero image */}
									<div className="space-y-3">
										<FieldLabel>Hero Image</FieldLabel>

										{/* Mode toggle */}
										<div
											className="flex gap-0 border"
											style={{ borderColor: C.border }}
										>
											<button
												type="button"
												onClick={() => setHeroInputMode("upload")}
												className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-sans font-medium uppercase tracking-wider transition-all"
												style={{
													background:
														heroInputMode === "upload"
															? C.black
															: "transparent",
													color: heroInputMode === "upload" ? C.white : C.grey,
												}}
											>
												<Upload className="w-3.5 h-3.5" /> Upload File
											</button>
											<button
												type="button"
												onClick={() => setHeroInputMode("url")}
												className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-sans font-medium uppercase tracking-wider transition-all border-l"
												style={{
													borderColor: C.border,
													background:
														heroInputMode === "url" ? C.black : "transparent",
													color: heroInputMode === "url" ? C.white : C.grey,
												}}
											>
												<Link className="w-3.5 h-3.5" /> Image URL
											</button>
										</div>

										{heroInputMode === "upload" && (
											<div className="space-y-2">
												<div
													onDragOver={(e) => e.preventDefault()}
													onDrop={handleDrop}
													onClick={() => fileInputRef.current?.click()}
													className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed cursor-pointer transition-all"
													style={{
														borderColor: isUploadingHero ? C.border : C.grey,
													}}
												>
													{isUploadingHero ? (
														<>
															<Loader2
																className="w-7 h-7 animate-spin"
																style={{ color: C.taupe }}
															/>
															<span
																className="text-xs font-sans uppercase tracking-widest"
																style={{ color: C.grey }}
															>
																Uploading…
															</span>
														</>
													) : (
														<>
															<Upload
																className="w-7 h-7"
																style={{ color: C.grey }}
															/>
															<div className="text-center">
																<span
																	className="text-sm font-sans font-medium block"
																	style={{ color: C.black }}
																>
																	Click to upload
																</span>
																<span
																	className="text-xs font-sans"
																	style={{ color: C.grey }}
																>
																	or drag and drop
																</span>
															</div>
															<span
																className="text-xs font-sans uppercase tracking-wider"
																style={{ color: C.border }}
															>
																PNG, JPG, WebP — max 10MB
															</span>
														</>
													)}
													<input
														ref={fileInputRef}
														type="file"
														accept="image/*"
														className="hidden"
														onChange={(e) => {
															const file = e.target.files?.[0];
															if (file) handleFileUpload(file);
															e.target.value = "";
														}}
													/>
												</div>
												{uploadError && (
													<p
														className="text-xs font-sans flex items-center gap-1"
														style={{ color: "#C0392B" }}
													>
														<AlertTriangle className="w-3 h-3" />
														{uploadError}
													</p>
												)}
											</div>
										)}

										{heroInputMode === "url" && (
											<input
												type="url"
												placeholder="https://images.unsplash.com/..."
												className={inputCls}
												value={formData.heroImage}
												onChange={(e) =>
													setFormData({
														...formData,
														heroImage: e.target.value,
													})
												}
											/>
										)}

										{formData.heroImage && (
											<div
												className="relative border overflow-hidden"
												style={{ borderColor: C.border }}
											>
												<img
													src={formData.heroImage}
													alt="Hero preview"
													className="w-full h-40 object-cover"
												/>
												<button
													type="button"
													onClick={() =>
														setFormData({ ...formData, heroImage: "" })
													}
													className="absolute top-2 right-2 p-1.5 transition-all hover:opacity-70"
													style={{ background: "rgba(0,0,0,0.6)" }}
												>
													<X className="w-3.5 h-3.5 text-white" />
												</button>
											</div>
										)}

										<p className="text-xs font-sans" style={{ color: C.grey }}>
											Tip: Use a high-quality landscape photo for the best
											result.
										</p>
									</div>
								</div>
							</motion.div>
						)}

						{/* ── STEP 3: Design & Music ─────────────────────────────── */}
						{step === 3 && (
							<motion.div
								key="step3"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								transition={{ duration: 0.25, ease: "easeOut" }}
								className="space-y-8"
							>
								<div>
									<p
										className="font-sans uppercase tracking-[0.2em] mb-2"
										style={{ fontSize: "0.65rem", color: C.taupe }}
									>
										Step 03
									</p>
									<h2
										className="text-2xl md:text-3xl font-bold tracking-tight mb-1"
										style={{ color: C.black }}
									>
										Design & Music
									</h2>
									<p className="text-sm font-sans" style={{ color: C.grey }}>
										Set the mood and aesthetic for your wedding page.
									</p>
								</div>

								<div className="space-y-8">
									{/* Theme selection */}
									<div className="space-y-4">
										<FieldLabel>Select Theme</FieldLabel>
										<div className="grid grid-cols-2 gap-3">
											{(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(
												(t) => (
													<button
														key={t}
														onClick={() =>
															setFormData({ ...formData, theme: t })
														}
														className="p-4 border-2 text-left transition-all"
														style={{
															borderColor:
																formData.theme === t ? C.taupe : C.border,
															background:
																formData.theme === t
																	? `${C.taupe}08`
																	: "transparent",
														}}
													>
														<div
															className={`w-full h-10 mb-3 border ${THEMES[t].bg}`}
															style={{ borderColor: C.border }}
														/>
														<span
															className="font-sans font-semibold capitalize text-sm"
															style={{ color: C.black }}
														>
															{t.replace("-", " ")}
														</span>
													</button>
												),
											)}
										</div>
									</div>

									{/* Font style */}
									<div className="space-y-4">
										<FieldLabel>Font Style</FieldLabel>
										<div
											className="flex gap-0 border"
											style={{ borderColor: C.border }}
										>
											{["serif", "script", "sans"].map((f, i) => (
												<button
													key={f}
													onClick={() =>
														setFormData({ ...formData, fontStyle: f as any })
													}
													className={`flex-1 py-3 text-sm transition-all ${i > 0 ? "border-l" : ""}`}
													style={{
														borderColor: C.border,
														background:
															formData.fontStyle === f
																? C.black
																: "transparent",
														color: formData.fontStyle === f ? C.white : C.grey,
													}}
												>
													<span
														className={`capitalize ${f === "serif" ? "font-serif" : f === "script" ? "font-script" : "font-sans"}`}
													>
														{f}
													</span>
												</button>
											))}
										</div>
									</div>

									{/* Background music */}
									<div>
										<FieldLabel htmlFor="musicSelect">
											Background Music
										</FieldLabel>
										<select
											id="musicSelect"
											className={inputCls}
											value={formData.musicId}
											onChange={(e) =>
												setFormData({ ...formData, musicId: e.target.value })
											}
										>
											<option value="">No Music</option>
											{MUSIC_TRACKS.map((track) => (
												<option key={track.id} value={track.id}>
													{track.name}
												</option>
											))}
										</select>
									</div>
								</div>
							</motion.div>
						)}

						{/* ── STEP 4: Final Touches ──────────────────────────────── */}
						{step === 4 && (
							<motion.div
								key="step4"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								transition={{ duration: 0.25, ease: "easeOut" }}
								className="space-y-8"
							>
								<div>
									<p
										className="font-sans uppercase tracking-[0.2em] mb-2"
										style={{ fontSize: "0.65rem", color: C.taupe }}
									>
										Step 04
									</p>
									<h2
										className="text-2xl md:text-3xl font-bold tracking-tight mb-1"
										style={{ color: C.black }}
									>
										Final Touches
									</h2>
									<p className="text-sm font-sans" style={{ color: C.grey }}>
										Configure the final details for your guests.
									</p>
								</div>

								<div className="space-y-6">
									{/* Countdown toggle */}
									<div
										className="flex items-center justify-between p-4 border"
										style={{
											background: C.surface,
											borderColor: C.border,
										}}
									>
										<div>
											<h4
												className="font-sans font-semibold text-sm"
												style={{ color: C.black }}
											>
												Countdown Timer
											</h4>
											<p
												className="text-xs font-sans mt-0.5"
												style={{ color: C.grey }}
											>
												Show a live countdown to your wedding day.
											</p>
										</div>
										<button
											onClick={() =>
												setFormData({
													...formData,
													showCountdown: !formData.showCountdown,
												})
											}
											className="w-12 h-6 relative transition-colors shrink-0"
											style={{
												background: formData.showCountdown ? C.taupe : C.border,
											}}
										>
											<div
												className="absolute top-1 w-4 h-4 bg-white transition-all"
												style={{
													left: formData.showCountdown
														? "calc(100% - 20px)"
														: 4,
												}}
											/>
										</button>
									</div>

									{/* RSVP deadline */}
									{/* <div>
										<FieldLabel htmlFor="rsvpDeadline">RSVP Deadline</FieldLabel>
										<input
											id="rsvpDeadline"
											type="date"
											className={inputCls}
											value={formData.rsvpDeadline}
											onChange={(e) =>
												setFormData({
													...formData,
													rsvpDeadline: e.target.value,
												})
											}
										/>
									</div> */}

									{/* Custom slug (new) */}
									{!isEditMode && (
										<div>
											<FieldLabel htmlFor="customSlug">
												Custom URL Slug{" "}
												<span
													className="normal-case"
													style={{ color: C.border, fontWeight: 400 }}
												>
													(optional)
												</span>
											</FieldLabel>
											<div
												className="flex items-center border overflow-hidden focus-within:border-[#B38B6D] focus-within:ring-2 focus-within:ring-[#B38B6D]/20 transition-all"
												style={{
													borderColor: C.border,
													background: C.surface,
												}}
											>
												<span
													className="pl-4 pr-2 text-xs font-sans whitespace-nowrap select-none"
													style={{ color: C.grey }}
												>
													{window.location.host}/w/
												</span>
												<input
													id="customSlug"
													type="text"
													placeholder={`${formData.brideName.toLowerCase() || "bride"}-and-${formData.groomName.toLowerCase() || "groom"}`}
													className="flex-1 py-3.5 pr-4 bg-transparent outline-none text-xs font-mono"
													style={{ color: C.black }}
													value={customSlug}
													onChange={(e) =>
														setCustomSlug(
															e.target.value
																.toLowerCase()
																.replace(/[^a-z0-9-]/g, ""),
														)
													}
												/>
											</div>
											<p
												className="text-xs font-sans mt-1.5"
												style={{ color: C.grey }}
											>
												Leave blank to auto-generate. Lowercase, numbers,
												hyphens only.
											</p>
										</div>
									)}

									{/* Current URL in edit mode */}
									{isEditMode && savedSlug && (
										<div>
											<FieldLabel>Your Page URL</FieldLabel>
											<div
												className="flex items-center px-4 py-3 border"
												style={{
													background: C.surface,
													borderColor: C.border,
												}}
											>
												<span
													className="text-xs font-mono truncate"
													style={{ color: C.grey }}
												>
													{window.location.host}/w/{savedSlug}
												</span>
											</div>
											<p
												className="text-xs font-sans mt-1.5"
												style={{ color: C.grey }}
											>
												The URL slug cannot be changed after creation.
											</p>
										</div>
									)}

									{/* Error message */}
									{publishError && (
										<div
											className="flex items-start gap-2 p-3 border text-sm font-sans"
											style={{
												background: "#FEF2F2",
												borderColor: "#FECACA",
												color: "#C0392B",
											}}
										>
											<AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
											<span>{publishError}</span>
										</div>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</main>

				{/* Footer navigation */}
				<footer
					className="px-6 py-4 border-t sticky bottom-0 z-10"
					style={{ background: C.white, borderColor: C.border }}
				>
					<div className="flex justify-between max-w-2xl mx-auto w-full items-center">
						<button
							disabled={step === 1}
							onClick={() => setStep((s) => s - 1)}
							className="flex items-center gap-2 px-5 py-2.5 font-sans font-medium text-sm uppercase tracking-wider border transition-all disabled:opacity-30 hover:opacity-70"
							style={{ borderColor: C.border, color: C.black }}
						>
							<ChevronLeft className="w-4 h-4" /> Back
						</button>

						{step < 4 ? (
							<button
								onClick={() => setStep((s) => s + 1)}
								className="flex items-center gap-2 px-8 py-2.5 font-sans font-semibold text-sm uppercase tracking-wider transition-all hover:opacity-80"
								style={{ background: C.black, color: C.white }}
							>
								Next <ChevronRight className="w-4 h-4" />
							</button>
						) : (
							<button
								onClick={handlePublish}
								disabled={isPublishing}
								className="flex items-center gap-2 px-8 py-2.5 font-sans font-semibold text-sm uppercase tracking-wider transition-all hover:opacity-80 disabled:opacity-50"
								style={{ background: C.taupe, color: C.white }}
							>
								{isPublishing ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										{isEditMode ? "Saving…" : "Publishing…"}
									</>
								) : isEditMode ? (
									<>
										<Save className="w-4 h-4" /> Save Changes
									</>
								) : (
									<>
										Publish Page <Send className="w-4 h-4" />
									</>
								)}
							</button>
						)}
					</div>
				</footer>
			</div>

			{/* ── Preview Side ────────────────────────────────────────────── */}
			<div
				ref={previewPanelRef}
				className={`flex-1 relative h-screen flex-col border-l ${showPreview ? "flex" : "hidden md:flex"}`}
				style={{ background: C.beige, borderColor: C.border }}
			>
				{/* Back-to-edit button (mobile only) */}
				<button
					onClick={() => setShowPreview(false)}
					className="md:hidden absolute top-4 left-4 z-50 flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-medium border shadow-sm"
					style={{ background: C.white, borderColor: C.border, color: C.black }}
				>
					<Edit3 className="w-3.5 h-3.5" /> Edit
				</button>

				{/* Panel label */}
				<div
					className="hidden md:flex items-center justify-between px-8 pt-5 pb-3 border-b"
					style={{ borderColor: C.border }}
				>
					<span
						className="font-sans font-medium uppercase tracking-widest"
						style={{ fontSize: "0.65rem", color: C.grey }}
					>
						Mobile Preview
					</span>
					<span className="font-mono text-xs" style={{ color: C.border }}>
						390 × 844
					</span>
				</div>

				{/* Centering wrapper */}
				<div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-hidden">
					<div
						aria-hidden
						style={{
							width: (PHONE_W + PHONE_BORDER * 2) * phoneScale,
							height: (PHONE_H + PHONE_BORDER * 2) * phoneScale,
							flexShrink: 0,
							position: "relative",
						}}
					>
						{/* Phone shell */}
						<div
							className="relative"
							style={{
								width: PHONE_W + PHONE_BORDER * 2,
								height: PHONE_H + PHONE_BORDER * 2,
								borderRadius: 48,
								background: "#18181B",
								boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
								transform: `scale(${phoneScale})`,
								transformOrigin: "top left",
								position: "absolute",
								top: 0,
								left: 0,
							}}
						>
							{/* Side buttons */}
							<div
								className="absolute -right-[5px] top-28 w-[5px] h-16 rounded-r-sm"
								style={{ background: "#27272A" }}
							/>
							<div
								className="absolute -left-[5px] top-20 w-[5px] h-8 rounded-l-sm"
								style={{ background: "#27272A" }}
							/>
							<div
								className="absolute -left-[5px] top-32 w-[5px] h-8 rounded-l-sm"
								style={{ background: "#27272A" }}
							/>

							{/* Screen area */}
							<div
								style={{
									position: "absolute",
									inset: PHONE_BORDER,
									borderRadius: 36,
									overflow: "hidden",
									background: "#fff",
								}}
							>
								{/* Dynamic Island */}
								<div
									style={{
										position: "absolute",
										top: 12,
										left: "50%",
										transform: "translateX(-50%)",
										width: 120,
										height: 34,
										background: "#18181B",
										borderRadius: 20,
										zIndex: 20,
									}}
								/>

								{/* Scrollable content */}
								<div className="w-full h-full overflow-y-auto overflow-x-hidden">
									<WeddingPageView wedding={formData} isPreview />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
