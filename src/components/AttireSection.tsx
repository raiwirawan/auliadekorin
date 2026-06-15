import React from "react";
import { motion } from "motion/react";

const attires = [
	{
		id: 1,
		image: "/attire/attire.webp",
		title: "Modern Elegance",
		description:
			"Setelan jas modern dengan potongan pas badan untuk tampilan yang elegan.",
	},
	{
		id: 2,
		image: "/attire/attire2.webp",
		title: "Classic Tuxedo",
		description:
			"Tuksedo klasik hitam yang sempurna untuk acara pernikahan formal.",
	},
	{
		id: 3,
		image: "/attire/attire3.webp",
		title: "Traditional Charm",
		description: "Pakaian pengantin dengan sentuhan tradisional yang memukau.",
	},
];

export default function AttireSection() {
	return (
		<section className="py-24 bg-white" id="portfolio">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
					>
						Pilihan Busana Pengantin
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-xl text-neutral-500 max-w-2xl mx-auto"
					>
						Koleksi jas dan busana pengantin premium untuk menyempurnakan
						penampilan Anda di hari bahagia.
					</motion.p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{attires.map((attire, index) => (
						<motion.div
							key={attire.id}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className="group rounded-3xl overflow-hidden bg-neutral-50 border border-neutral-100 hover:shadow-xl transition-all duration-300"
						>
							<div className="aspect-3/4 overflow-hidden relative">
								<img
									src={attire.image}
									alt={attire.title}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
								/>
							</div>
							<div className="p-8">
								<h3 className="text-2xl font-bold mb-3">{attire.title}</h3>
								<p className="text-neutral-500 leading-relaxed mb-6">
									{attire.description}
								</p>
								<a
									href="https://wa.me/6288987135615?text=Halo%20kak%2C%20saya%20tertarik%20dengan%20koleksi%20busana%20pengantinnya"
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-neutral-800 transition-colors w-full"
								>
									Tanya Ketersediaan
								</a>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
