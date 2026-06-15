import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
	Plus,
	Globe,
	EyeOff,
	ExternalLink,
	Copy,
	LogOut,
	Loader2,
	Calendar,
	Sparkles,
	AlertCircle,
	Pencil,
	Trash2,
	X,
	LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";

interface WeddingSummary {
	id: string;
	slug: string;
	bride_name: string;
	groom_name: string;
	date: string;
	is_published: boolean;
	created_at: string;
}

function DeleteConfirmModal({
	wedding,
	onConfirm,
	onCancel,
	isDeleting,
}: {
	wedding: WeddingSummary;
	onConfirm: () => void;
	onCancel: () => void;
	isDeleting: boolean;
}) {
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
				onClick={onCancel}
			>
				<motion.div
					initial={{ scale: 0.95, opacity: 0, y: 16 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.95, opacity: 0, y: 16 }}
					transition={{ duration: 0.2 }}
					className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-200"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex items-start justify-between mb-6">
						<div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
							<Trash2 className="w-5 h-5 text-red-500" />
						</div>
						<button
							onClick={onCancel}
							className="p-2 text-neutral-400 hover:text-neutral-700 transition-colors rounded-xl hover:bg-neutral-100"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<h2 className="text-xl font-bold tracking-tight text-neutral-900 mb-2">
						Hapus Halaman Undangan?
					</h2>
					<p className="text-neutral-500 text-sm mb-2">
						Halaman undangan untuk{" "}
						<span className="font-semibold text-neutral-800">
							{wedding.bride_name} & {wedding.groom_name}
						</span>{" "}
						akan dihapus secara permanen.
					</p>
					<p className="text-neutral-400 text-xs font-mono mb-8 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
						/w/{wedding.slug}
					</p>

					<div className="flex gap-3">
						<button
							onClick={onCancel}
							disabled={isDeleting}
							className="flex-1 py-3 border border-neutral-200 text-neutral-700 font-semibold rounded-full hover:bg-neutral-50 transition-all disabled:opacity-50"
						>
							Batal
						</button>
						<button
							id={`confirm-delete-${wedding.id}`}
							onClick={onConfirm}
							disabled={isDeleting}
							className="flex-1 py-3 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
						>
							{isDeleting ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" /> Menghapus…
								</>
							) : (
								<>
									<Trash2 className="w-4 h-4" /> Hapus
								</>
							)}
						</button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

export default function DashboardPage() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<WeddingSummary | null>(null);

	const fetchWeddings = async () => {
		if (!user) return;
		try {
			const { data, error: dbError } = await supabase
				.from("weddings")
				.select(
					"id, slug, bride_name, groom_name, date, is_published, created_at",
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (dbError) throw new Error(dbError.message);
			setWeddings(data ?? []);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchWeddings();
	}, [user]);

	const handleTogglePublish = async (id: string, currentStatus: boolean) => {
		setTogglingId(id);
		try {
			const { error: dbError } = await supabase
				.from("weddings")
				.update({ is_published: !currentStatus })
				.eq("id", id);

			if (dbError) throw new Error(dbError.message);
			setWeddings((prev) =>
				prev.map((w) =>
					w.id === id ? { ...w, is_published: !currentStatus } : w,
				),
			);
		} catch (err: any) {
			alert(err.message);
		} finally {
			setTogglingId(null);
		}
	};

	const handleDelete = async () => {
		if (!confirmDelete) return;
		setDeletingId(confirmDelete.id);
		try {
			const { error: dbError } = await supabase
				.from("weddings")
				.delete()
				.eq("id", confirmDelete.id);

			if (dbError) throw new Error(dbError.message);
			setWeddings((prev) => prev.filter((w) => w.id !== confirmDelete.id));
			setConfirmDelete(null);
		} catch (err: any) {
			alert(err.message);
		} finally {
			setDeletingId(null);
		}
	};

	const copyLink = (slug: string) => {
		navigator.clipboard.writeText(`${window.location.origin}/w/${slug}`);
		setCopiedSlug(slug);
		setTimeout(() => setCopiedSlug(null), 2000);
	};

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			{/* Delete Confirmation Modal */}
			{confirmDelete && (
				<DeleteConfirmModal
					wedding={confirmDelete}
					onConfirm={handleDelete}
					onCancel={() => !deletingId && setConfirmDelete(null)}
					isDeleting={!!deletingId}
				/>
			)}

			{/* Navbar */}
			<header className="border-b border-neutral-100 bg-white sticky top-0 z-20">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<div className="w-9 h-9 flex items-center justify-center">
							<img
								src="/aulia_dekorin_logo.png"
								alt="AuliaDekorin Logo"
								className="w-9 h-9 object-contain"
							/>
						</div>
						<span className="font-bold text-xl tracking-tighter text-neutral-900">
							AuliaDekorin
						</span>
					</Link>

					<div className="flex items-center gap-3">
						<div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2">
							<LayoutDashboard className="w-4 h-4" />
							<span>{user?.email}</span>
						</div>
						<Link
							to="/create"
							id="dashboard-create-btn"
							className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-neutral-800 transition-all hover:scale-105 shadow-md"
						>
							<Plus className="w-4 h-4" /> Buat Baru
						</Link>
						<button
							onClick={handleLogout}
							id="dashboard-logout"
							className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-full hover:bg-neutral-50 transition-colors"
						>
							<LogOut className="w-4 h-4" />
							<span className="hidden sm:inline">Keluar</span>
						</button>
					</div>
				</div>
			</header>

			{/* Main */}
			<main className="max-w-7xl mx-auto px-6 py-12">
				{/* Page header */}
				<motion.div
					initial={{ y: 16, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					className="mb-10"
				>
					<div className="flex items-center gap-2 mb-3">
						<Sparkles className="w-4 h-4 text-amber-500" />
						<span className="text-neutral-500 text-sm font-medium uppercase tracking-wider">
							Undangan Pernikahan
						</span>
					</div>
					<h1 className="text-5xl font-bold tracking-tighter text-neutral-900 mb-2">
						Dashboard
					</h1>
					<p className="text-neutral-500">
						Kelola halaman undangan pernikahan, atur visibilitas, dan bagikan tautan.
					</p>
				</motion.div>

				{/* Content */}
				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-32 gap-4 text-neutral-400">
						<Loader2 className="w-8 h-8 animate-spin" />
						<span className="text-sm">Memuat halaman…</span>
					</div>
				) : error ? (
					<div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600">
						<AlertCircle className="w-5 h-5 shrink-0" />
						{error}
					</div>
				) : weddings.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.97 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex flex-col items-center justify-center py-32 text-center"
					>
						<div className="w-20 h-20 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-3xl flex items-center justify-center mb-6">
							<Plus className="w-10 h-10 text-neutral-300" />
						</div>
						<h2 className="text-2xl font-bold tracking-tight mb-3 text-neutral-900">
							Belum ada halaman
						</h2>
						<p className="text-neutral-500 mb-8 max-w-sm">
							Mulai buat halaman undangan pernikahan pertama yang indah dan berkesan.
						</p>
						<Link
							to="/create"
							className="flex items-center gap-2 px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-neutral-800 transition-all hover:scale-105 shadow-xl"
						>
							<Plus className="w-5 h-5" /> Buat Halaman Pertama
						</Link>
					</motion.div>
				) : (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						<AnimatePresence mode="popLayout">
							{weddings.map((w, i) => (
								<motion.div
									key={w.id}
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ scale: 0.95, opacity: 0 }}
									transition={{ delay: i * 0.06 }}
									layout
									className="group bg-white border border-neutral-200 rounded-3xl p-6 hover:border-neutral-400 hover:shadow-lg transition-all"
								>
									{/* Status badge + open */}
									<div className="flex items-start justify-between mb-4">
										<span
											className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
												w.is_published
													? "bg-emerald-50 text-emerald-700 border-emerald-200"
													: "bg-neutral-100 text-neutral-500 border-neutral-200"
											}`}
										>
											{w.is_published ? (
												<>
													<Globe className="w-3 h-3" /> Publik
												</>
											) : (
												<>
													<EyeOff className="w-3 h-3" /> Offline
												</>
											)}
										</span>

										<a
											href={`/w/${w.slug}`}
											target="_blank"
											rel="noopener noreferrer"
											className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors rounded-lg hover:bg-neutral-100"
											title="Buka halaman"
										>
											<ExternalLink className="w-4 h-4" />
										</a>
									</div>

									{/* Names */}
									<h3 className="text-lg font-bold tracking-tight text-neutral-900 mb-1">
										{w.bride_name}{" "}
										<span className="text-neutral-400 font-normal">&</span>{" "}
										{w.groom_name}
									</h3>

									{/* Slug */}
									<p className="text-neutral-400 text-xs font-mono mb-1 truncate">
										/w/{w.slug}
									</p>

									{/* Date */}
									{w.date && (
										<div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-5">
											<Calendar className="w-3 h-3" />
											{new Date(w.date).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "long",
												year: "numeric",
											})}
										</div>
									)}

									{/* Actions */}
									<div className="flex items-center gap-2">
										{/* Edit */}
										<button
											id={`edit-${w.id}`}
											onClick={() => navigate(`/edit/${w.id}`)}
											className="p-2.5 bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-400 rounded-xl transition-all"
											title="Edit"
										>
											<Pencil className="w-4 h-4" />
										</button>

										{/* Publish toggle */}
										<button
											id={`toggle-publish-${w.id}`}
											onClick={() => handleTogglePublish(w.id, w.is_published)}
											disabled={togglingId === w.id}
											className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all border disabled:opacity-50 ${
												w.is_published
													? "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
													: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
											}`}
										>
											{togglingId === w.id ? (
												<Loader2 className="w-3 h-3 animate-spin" />
											) : w.is_published ? (
												<>
													<EyeOff className="w-3 h-3" /> Sembunyikan
												</>
											) : (
												<>
													<Globe className="w-3 h-3" /> Publikasikan
												</>
											)}
										</button>

										{/* Copy link */}
										<button
											id={`copy-link-${w.id}`}
											onClick={() => copyLink(w.slug)}
											className="p-2.5 bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 hover:border-neutral-400 rounded-xl transition-all"
											title="Salin tautan"
										>
											{copiedSlug === w.slug ? (
												<span className="text-emerald-600 text-xs font-bold px-1">✓</span>
											) : (
												<Copy className="w-4 h-4" />
											)}
										</button>

										{/* Delete */}
										<button
											id={`delete-${w.id}`}
											onClick={() => setConfirmDelete(w)}
											className="p-2.5 bg-neutral-50 border border-neutral-200 text-neutral-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 rounded-xl transition-all"
											title="Hapus"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</motion.div>
							))}
						</AnimatePresence>

						{/* Add new card */}
						<motion.div
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: weddings.length * 0.06 }}
						>
							<Link
								to="/create"
								className="flex flex-col items-center justify-center h-full min-h-[220px] border-2 border-dashed border-neutral-200 rounded-3xl text-neutral-400 hover:border-black hover:text-black hover:bg-neutral-50 transition-all group"
							>
								<Plus className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
								<span className="text-sm font-semibold">Buat Baru</span>
							</Link>
						</motion.div>
					</div>
				)}
			</main>

			{/* Footer */}
			<footer className="mt-20 py-8 border-t border-neutral-100 px-6">
				<div className="max-w-7xl mx-auto flex justify-center">
					<p className="text-neutral-400 text-sm">
						© 2026 AuliaDekorin. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
