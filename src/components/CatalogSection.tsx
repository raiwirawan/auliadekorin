import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, MessageCircle } from "lucide-react";

const packages = [
	{
		id: 1,
		title: "Dekorasi A",
		price: "IDR 850.000",
		image: "/decor/wedd2.webp",
		features: [
			"Dekorasi -/+ 3m (artificial flowers)",
			"2 kursi tiffany",
			"Karpet permadani",
			"Lighting",
			"Standing flowers",
		],
		note: "*Free request warna bunga (selama persediaan masih ada)",
	},
	{
		id: 2,
		title: "Dekorasi B",
		price: "IDR 1.200.000",
		image: "/decor/wedd.webp",
		features: [
			"Dekorasi -/+ 3m (artificial flowers)",
			"2 kursi tiffany",
			"Karpet permadani",
			"Lighting",
			"Standing flowers",
		],
		note: "*Free request warna bunga (selama persediaan masih ada)",
		popular: true,
	},
	{
		id: 3,
		title: "Dekorasi C",
		price: "IDR 2.500.000",
		image: "/decor/wedd3.webp",
		features: [
			"Dekorasi -/+ 3m (artificial flowers)",
			"2 kursi tiffany",
			"Karpet permadani",
			"Lighting",
			"Standing seserahan 4 pcs",
		],
		note: "*Free request warna bunga (selama persediaan masih ada)",
	},
];

export default function CatalogSection() {
	return (
		<section className="py-24 bg-neutral-50" id="pricing">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
					>
						Price List 2026
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-xl text-neutral-500 max-w-2xl mx-auto"
					>
						Pilih paket dekorasi terbaik yang sesuai dengan kebutuhan acara
						spesial Anda. Kami siap mewujudkan konsep impian Anda.
					</motion.p>
				</div>

				<div className="grid lg:grid-cols-3 gap-8 items-start">
					{packages.map((pkg, index) => (
						<motion.div
							key={pkg.id}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className={`relative flex flex-col bg-white rounded-3xl overflow-hidden border ${
								pkg.popular ? "border-amber-500 shadow-xl" : "border-neutral-200 shadow-sm"
							} hover:shadow-2xl transition-all duration-300`}
						>
							{pkg.popular && (
								<div className="absolute top-0 inset-x-0 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 text-center z-10">
									Rekomendasi
								</div>
							)}

							{/* Image Header */}
							<div className="h-64 overflow-hidden relative">
								<img
									src={pkg.image}
									alt={pkg.title}
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
								<div className="absolute bottom-4 left-6 right-6 text-white">
									<h3 className="text-2xl font-bold mb-1">{pkg.title}</h3>
									<p className="text-3xl font-bold text-amber-400">{pkg.price}</p>
								</div>
							</div>

							<div className="p-8 flex-1 flex flex-col">
								<ul className="space-y-4 mb-8 flex-1">
									{pkg.features.map((feature, i) => (
										<li key={i} className="flex items-start gap-3">
											<CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
											<span className="text-neutral-600">{feature}</span>
										</li>
									))}
								</ul>

								<div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
									<p className="text-xs text-amber-800 italic leading-relaxed">
										{pkg.note}
									</p>
								</div>

								<a
									href={`https://wa.me/6287126323423?text=${encodeURIComponent(
										`Halo Kak, saya tertarik dengan paket ${pkg.title} seharga ${pkg.price}. Boleh minta info lebih lanjut?`
									)}`}
									target="_blank"
									rel="noreferrer"
									className={`w-full py-4 px-6 rounded-full font-bold text-center flex items-center justify-center gap-2 transition-transform hover:scale-105 ${
										pkg.popular
											? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
											: "bg-black text-white hover:bg-neutral-800"
									}`}
								>
									<MessageCircle className="w-5 h-5" />
									Pesan Sekarang
								</a>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
