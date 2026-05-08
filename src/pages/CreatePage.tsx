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
} from "lucide-react";
import { uploadHeroImage } from "../utils/uploadImage";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";
import { nanoid } from "nanoid";

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
				// --- UPDATE existing record ---
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
				// --- INSERT new record ---
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
					// Check uniqueness
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

	// Loading spinner while fetching existing data in edit mode
	if (isLoadingEdit) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="flex flex-col items-center gap-4 text-neutral-400">
					<Loader2 className="w-10 h-10 animate-spin" />
					<span className="font-medium">Loading wedding data…</span>
				</div>
			</div>
		);
	}

	// Hard error loading the wedding to edit
	if (loadError) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
				<div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
					<p className="text-red-500 font-medium mb-4">{loadError}</p>
					<button
						onClick={() => navigate("/dashboard")}
						className="px-6 py-3 bg-black text-white rounded-full font-bold"
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	if (isSaved) {
		return (
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center"
				>
					<CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
					<h1 className="text-3xl font-bold mb-4">
						{isEditMode ? "Changes Saved!" : "Your Wedding Page is Live!"}
					</h1>
					<p className="text-neutral-600 mb-8">
						{isEditMode
							? "Your wedding page has been updated successfully."
							: "Congratulations! Your personalized wedding invitation is ready to be shared with your loved ones."}
					</p>

					<div className="bg-neutral-100 p-4 rounded-xl flex items-center justify-between mb-8">
						<span className="text-sm font-mono truncate mr-4">
							{window.location.origin}/w/{savedSlug}
						</span>
						<button
							onClick={copyToClipboard}
							className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
						>
							<Copy className="w-5 h-5" />
						</button>
					</div>

					<div className="flex flex-col gap-4">
						<button
							onClick={() => navigate(`/w/${savedSlug}`)}
							className="w-full py-4 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-colors"
						>
							View My Page
						</button>
						<button
							onClick={() => navigate("/dashboard")}
							className="w-full py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
						>
							<LayoutDashboard className="w-5 h-5" /> Go to Dashboard
						</button>
						<button
							onClick={() => navigate("/")}
							className="w-full py-4 border border-neutral-200 rounded-full font-bold hover:bg-neutral-50 transition-colors"
						>
							Back to Home
						</button>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden">
			{/* Form Side — independently scrollable */}
			<div
				className={`flex-1 flex flex-col h-screen overflow-y-auto bg-white ${showPreview ? "hidden md:flex" : "flex"}`}
			>
				<header className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
							E
						</div>
						<span className="font-bold text-xl tracking-tight">
							Everlasting
						</span>
						{isEditMode && (
							<span className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
								Editing
							</span>
						)}
					</div>
					<div className="flex items-center gap-4">
						<button
							onClick={() => setShowPreview(true)}
							className="md:hidden flex items-center gap-2 text-sm font-medium px-4 py-2 bg-neutral-100 rounded-full"
						>
							<Eye className="w-4 h-4" /> Preview
						</button>
						<div className="text-sm font-medium text-neutral-400">
							Step {step} of 4
						</div>
					</div>
				</header>

				<main className="flex-1 p-6 md:p-12 max-w-2xl mx-auto w-full">
					<AnimatePresence mode="wait">
						{step === 1 && (
							<motion.div
								key="step1"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								className="space-y-8"
							>
								<div>
									<h2 className="text-3xl font-bold mb-2">Basic Information</h2>
									<p className="text-neutral-500">
										Let's start with the essentials of your big day.
									</p>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Bride's Name
										</label>
										<input
											type="text"
											placeholder="Jane"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.brideName}
											onChange={(e) =>
												setFormData({ ...formData, brideName: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Groom's Name
										</label>
										<input
											type="text"
											placeholder="John"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.groomName}
											onChange={(e) =>
												setFormData({ ...formData, groomName: e.target.value })
											}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Date
										</label>
										<input
											type="date"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.date}
											onChange={(e) =>
												setFormData({ ...formData, date: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Time
										</label>
										<input
											type="time"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.time}
											onChange={(e) =>
												setFormData({ ...formData, time: e.target.value })
											}
										/>
									</div>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Venue Name
										</label>
										<input
											type="text"
											placeholder="The Grand Palace"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.venueName}
											onChange={(e) =>
												setFormData({ ...formData, venueName: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Venue Address
										</label>
										<input
											type="text"
											placeholder="123 Wedding St, Love City"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.venueAddress}
											onChange={(e) =>
												setFormData({
													...formData,
													venueAddress: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Google Maps URL (Optional)
										</label>
										<input
											type="url"
											placeholder="https://maps.google.com/..."
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
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

						{step === 2 && (
							<motion.div
								key="step2"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								className="space-y-8"
							>
								<div>
									<h2 className="text-3xl font-bold mb-2">Our Love Story</h2>
									<p className="text-neutral-500">
										Share the magic of how you both met and fell in love.
									</p>
								</div>

								<div className="space-y-6">
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Tagline / Subtitle
										</label>
										<input
											type="text"
											placeholder="A journey of a thousand miles begins with a single step..."
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.tagline}
											onChange={(e) =>
												setFormData({ ...formData, tagline: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											The Story
										</label>
										<textarea
											rows={6}
											placeholder="It all started when..."
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
											value={formData.loveStory}
											onChange={(e) =>
												setFormData({ ...formData, loveStory: e.target.value })
											}
										/>
									</div>
									<div className="space-y-3">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Hero Image
										</label>

										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => setHeroInputMode("upload")}
												className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${heroInputMode === "upload" ? "bg-black text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
											>
												<Upload className="w-4 h-4" /> Upload File
											</button>
											<button
												type="button"
												onClick={() => setHeroInputMode("url")}
												className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${heroInputMode === "url" ? "bg-black text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
											>
												<Link className="w-4 h-4" /> Image URL
											</button>
										</div>

										{heroInputMode === "upload" && (
											<div className="space-y-3">
												<div
													onDragOver={(e) => e.preventDefault()}
													onDrop={handleDrop}
													onClick={() => fileInputRef.current?.click()}
													className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isUploadingHero ? "border-neutral-300 bg-neutral-50" : "border-neutral-200 hover:border-black hover:bg-neutral-50"}`}
												>
													{isUploadingHero ? (
														<>
															<Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
															<span className="text-sm text-neutral-500">
																Uploading...
															</span>
														</>
													) : (
														<>
															<Upload className="w-8 h-8 text-neutral-400" />
															<div className="text-center">
																<span className="text-sm font-medium text-neutral-700">
																	Click to upload
																</span>
																<span className="text-sm text-neutral-400">
																	{" "}
																	or drag and drop
																</span>
															</div>
															<span className="text-xs text-neutral-400">
																PNG, JPG, WebP up to 10MB
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
													<p className="text-xs text-red-500">{uploadError}</p>
												)}
											</div>
										)}

										{heroInputMode === "url" && (
											<input
												type="url"
												placeholder="https://images.unsplash.com/..."
												className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
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
											<div className="relative rounded-xl overflow-hidden border border-neutral-200">
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
													className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
												>
													<X className="w-4 h-4" />
												</button>
											</div>
										)}

										<p className="text-xs text-neutral-400">
											Tip: Use a high-quality landscape photo for the best look.
										</p>
									</div>
								</div>
							</motion.div>
						)}

						{step === 3 && (
							<motion.div
								key="step3"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								className="space-y-8"
							>
								<div>
									<h2 className="text-3xl font-bold mb-2">Design & Music</h2>
									<p className="text-neutral-500">
										Set the mood and aesthetic for your wedding page.
									</p>
								</div>

								<div className="space-y-8">
									<div className="space-y-4">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Select Theme
										</label>
										<div className="grid grid-cols-2 gap-4">
											{(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(
												(t) => (
													<button
														key={t}
														onClick={() =>
															setFormData({ ...formData, theme: t })
														}
														className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.theme === t ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"}`}
													>
														<div
															className={`w-full h-12 rounded-lg mb-3 ${THEMES[t].bg} border border-black/5`}
														/>
														<span className="font-bold capitalize">
															{t.replace("-", " ")}
														</span>
													</button>
												),
											)}
										</div>
									</div>

									<div className="space-y-4">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Font Style
										</label>
										<div className="flex gap-4">
											{["serif", "script", "sans"].map((f) => (
												<button
													key={f}
													onClick={() =>
														setFormData({ ...formData, fontStyle: f as any })
													}
													className={`flex-1 py-3 rounded-xl border-2 transition-all ${formData.fontStyle === f ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"}`}
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

									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											Background Music
										</label>
										<select
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
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

						{step === 4 && (
							<motion.div
								key="step4"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: -20, opacity: 0 }}
								className="space-y-8"
							>
								<div>
									<h2 className="text-3xl font-bold mb-2">Final Touches</h2>
									<p className="text-neutral-500">
										Almost there! Configure the final details for your guests.
									</p>
								</div>

								<div className="space-y-8">
									<div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
										<div>
											<h4 className="font-bold">Countdown Timer</h4>
											<p className="text-sm text-neutral-500">
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
											className={`w-14 h-8 rounded-full transition-colors relative ${formData.showCountdown ? "bg-black" : "bg-neutral-200"}`}
										>
											<div
												className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.showCountdown ? "left-7" : "left-1"}`}
											/>
										</button>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
											RSVP Deadline
										</label>
										<input
											type="date"
											className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
											value={formData.rsvpDeadline}
											onChange={(e) =>
												setFormData({
													...formData,
													rsvpDeadline: e.target.value,
												})
											}
										/>
									</div>

									{!isEditMode && (
										<div className="space-y-2">
											<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
												Custom URL Slug{" "}
												<span className="normal-case text-neutral-300">
													(optional)
												</span>
											</label>
											<div className="flex items-center bg-neutral-50 border border-neutral-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black transition-all">
												<span className="pl-4 pr-2 text-sm text-neutral-400 whitespace-nowrap select-none">
													{window.location.host}/w/
												</span>
												<input
													id="custom-slug-input"
													type="text"
													placeholder={`${formData.brideName.toLowerCase() || "bride"}-and-${formData.groomName.toLowerCase() || "groom"}`}
													className="flex-1 py-4 pr-4 bg-transparent outline-none text-sm font-mono"
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
											<p className="text-xs text-neutral-400">
												Leave blank to auto-generate. Only lowercase letters,
												numbers, and hyphens.
											</p>
										</div>
									)}
									{isEditMode && savedSlug && (
										<div className="space-y-2">
											<label className="text-sm font-bold uppercase tracking-wider text-neutral-400">
												Your Page URL
											</label>
											<div className="flex items-center bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3">
												<span className="text-sm font-mono text-neutral-500 truncate">
													{window.location.host}/w/{savedSlug}
												</span>
											</div>
											<p className="text-xs text-neutral-400">
												The URL slug cannot be changed after creation.
											</p>
										</div>
									)}

									{publishError && (
										<div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
											<span className="mt-0.5">⚠️</span>
											<span>{publishError}</span>
										</div>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</main>

				<footer className="p-6 border-t bg-white sticky bottom-0 z-10">
					<div className="flex justify-between max-w-2xl mx-auto w-full">
						<button
							disabled={step === 1}
							onClick={() => setStep((s) => s - 1)}
							className="flex items-center gap-2 px-6 py-3 rounded-full font-bold disabled:opacity-30 hover:bg-neutral-100 transition-colors"
						>
							<ChevronLeft className="w-5 h-5" /> Back
						</button>

						{step < 4 ? (
							<button
								onClick={() => setStep((s) => s + 1)}
								className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-colors"
							>
								Next <ChevronRight className="w-5 h-5" />
							</button>
						) : (
							<button
								onClick={handlePublish}
								disabled={isPublishing}
								className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
							>
								{isPublishing ? (
									isEditMode ? (
										"Saving..."
									) : (
										"Publishing..."
									)
								) : isEditMode ? (
									<>
										<Save className="w-5 h-5" /> Save Changes
									</>
								) : (
									<>
										Publish Page <Send className="w-5 h-5" />
									</>
								)}
							</button>
						)}
					</div>
				</footer>
			</div>

			{/* Preview Side — sticky viewport, phone frame scrolls its content */}
			<div
				className={`flex-1 bg-neutral-100 relative h-screen overflow-y-auto ${showPreview ? "flex" : "hidden md:flex"}`}
			>
				<button
					onClick={() => setShowPreview(false)}
					className="md:hidden absolute top-6 left-6 z-50 p-3 bg-white rounded-full shadow-lg"
				>
					<Edit3 className="w-6 h-6" />
				</button>

				{/* Phone frame wrapper — scrolls with the right panel */}
				<div className="w-full min-h-full flex items-start justify-center py-10 px-6">
					<div
						className="relative w-full shadow-2xl rounded-[2.5rem] border-10 border-neutral-800 overflow-hidden bg-neutral-800"
						style={{ maxWidth: "340px" }}
					>
						{/* Inner content scrolls */}
						<div
							className="overflow-y-auto"
							style={{ maxHeight: "calc(100vh - 80px)" }}
						>
							<WeddingPageView wedding={formData} isPreview />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
