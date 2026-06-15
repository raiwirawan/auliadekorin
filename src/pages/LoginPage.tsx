import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);
		try {
			await login(email, password);
			navigate("/dashboard");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Navbar */}
			<nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
				<Link to="/" className="flex items-center gap-2">
					<div className="w-10 h-10 rounded-xl flex items-center justify-center">
						<img src="/aulia_dekorin_logo.png" alt="AuliaDekorin Logo" className="w-10 h-10 object-contain" />
					</div>
					<span className="font-bold text-2xl tracking-tighter text-neutral-900">
						AuliaDekorin
					</span>
				</Link>
				<Link
					to="/"
					className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
				>
					← Kembali ke Beranda
				</Link>
			</nav>

			{/* Main content */}
			<div className="flex-1 flex items-center justify-center px-4 py-16">
				<motion.div
					initial={{ y: 24, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="w-full max-w-md"
				>
					{/* Badge */}
					<div className="flex justify-center mb-8">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium">
							<span>🔐</span>
							<span>Admin Access Only</span>
						</div>
					</div>

					<h1 className="text-4xl font-bold tracking-tighter text-center text-neutral-900 mb-2">
						Selamat Datang
					</h1>
					<p className="text-neutral-500 text-center text-base mb-10">
						Masuk untuk mengelola halaman undangan pernikahan
					</p>

					{/* Card */}
					<div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
						{error && (
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
							>
								<AlertCircle className="w-4 h-4 shrink-0" />
								{error}
							</motion.div>
						)}

						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-1.5">
								<label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
									Email
								</label>
								<div className="relative">
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
									<input
										id="login-email"
										type="email"
										required
										autoComplete="email"
										placeholder="you@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 transition-all"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
									Password
								</label>
								<div className="relative">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
									<input
										id="login-password"
										type="password"
										required
										autoComplete="current-password"
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 transition-all"
									/>
								</div>
							</div>

							<button
								id="login-submit"
								type="submit"
								disabled={isLoading}
								className="w-full py-4 mt-2 bg-black text-white font-bold rounded-full hover:bg-neutral-800 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-xl"
							>
								{isLoading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" /> Masuk…
									</>
								) : (
									"Masuk"
								)}
							</button>
						</form>
					</div>
				</motion.div>
			</div>

			{/* Footer */}
			<footer className="py-8 border-t border-neutral-100 px-6">
				<div className="max-w-7xl mx-auto flex justify-center">
					<p className="text-neutral-400 text-sm">
						© 2026 AuliaDekorin. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
