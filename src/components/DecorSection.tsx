import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function DecorSection() {
  return (
    <section className="py-32 bg-neutral-950 text-white relative overflow-hidden" id="decor-portfolio">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-300 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mahakarya Dekorasi</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Ubah Tempat Biasa<br/>
              <span className="text-neutral-500 italic font-serif">Menjadi Luar Biasa</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-400 max-w-md pb-2"
          >
            Kami menggabungkan seni floral, tata cahaya dramatis, dan detail estetik untuk menciptakan latar belakang sempurna bagi momen bahagia Anda.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Large Feature */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-8 group relative rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[16/9] bg-neutral-900 border border-white/5"
          >
            <img 
              src="/decor/wedd.webp" 
              alt="Dekorasi Utama" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-3">Signature Grandeur</h3>
              <p className="text-neutral-300 max-w-xl mb-6">
                Kemegahan tanpa batas dengan lorong bunga yang membentang indah, siap mengantarkan langkah pertama Anda.
              </p>
              <a 
                href="https://wa.me/6288987135615?text=Halo%20kak%2C%20saya%20tertarik%20dengan%20konsep%20dekorasi%20Signature%20Grandeur" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 text-amber-300 hover:text-white font-medium transition-colors w-max"
              >
                Konsultasi Konsep <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Secondary Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group relative rounded-3xl overflow-hidden flex-1 min-h-[300px] md:min-h-0 bg-neutral-900 border border-white/5"
            >
              <img 
                src="/decor/wedd2.webp" 
                alt="Dekorasi Rustik" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold mb-2">Earthy Romance</h3>
                <p className="text-sm text-neutral-300 mb-4">Nuansa hangat dengan elemen natural yang romantis.</p>
              </div>
            </motion.div>

            {/* Secondary Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="group relative rounded-3xl overflow-hidden flex-1 min-h-[300px] md:min-h-0 bg-neutral-900 border border-white/5"
            >
              <img 
                src="/decor/wedd3.webp" 
                alt="Dekorasi Intimate" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold mb-2">Intimate Charm</h3>
                <p className="text-sm text-neutral-300 mb-4">Detail klasik untuk momen sakral yang tak terlupakan.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
