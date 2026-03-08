import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wedding, THEMES, MUSIC_TRACKS } from '../types';
import WeddingPageView from '../components/WeddingPageView';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Send, Eye, Edit3, CheckCircle, Copy } from 'lucide-react';

export default function CreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<Wedding>({
    brideName: '',
    groomName: '',
    date: '',
    time: '',
    venueName: '',
    venueAddress: '',
    venueMapsUrl: '',
    tagline: '',
    loveStory: '',
    theme: 'pastel',
    fontStyle: 'serif',
    musicId: 'romantic-piano',
    showCountdown: true,
    rsvpDeadline: '',
    heroImage: ''
  });

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setPublishedSlug(data.slug);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to publish wedding page.");
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/w/${publishedSlug}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  if (publishedSlug) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center"
        >
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Wedding Page is Live!</h1>
          <p className="text-neutral-600 mb-8">Congratulations! Your personalized wedding invitation is ready to be shared with your loved ones.</p>
          
          <div className="bg-neutral-100 p-4 rounded-xl flex items-center justify-between mb-8">
            <span className="text-sm font-mono truncate mr-4">
              {window.location.origin}/w/{publishedSlug}
            </span>
            <button onClick={copyToClipboard} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
              <Copy className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate(`/w/${publishedSlug}`)}
              className="w-full py-4 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-colors"
            >
              View My Page
            </button>
            <button 
              onClick={() => navigate('/')}
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
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Form Side */}
      <div className={`flex-1 flex flex-col h-screen overflow-y-auto bg-white ${showPreview ? 'hidden md:flex' : 'flex'}`}>
        <header className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">E</div>
            <span className="font-bold text-xl tracking-tight">Everlasting</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowPreview(true)}
              className="md:hidden flex items-center gap-2 text-sm font-medium px-4 py-2 bg-neutral-100 rounded-full"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <div className="text-sm font-medium text-neutral-400">Step {step} of 4</div>
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
                  <p className="text-neutral-500">Let's start with the essentials of your big day.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Bride's Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane"
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.brideName}
                      onChange={e => setFormData({...formData, brideName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Groom's Name</label>
                    <input 
                      type="text" 
                      placeholder="John"
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.groomName}
                      onChange={e => setFormData({...formData, groomName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Date</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Time</label>
                    <input 
                      type="time" 
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Venue Name</label>
                    <input 
                      type="text" 
                      placeholder="The Grand Palace"
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.venueName}
                      onChange={e => setFormData({...formData, venueName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Venue Address</label>
                    <input 
                      type="text" 
                      placeholder="123 Wedding St, Love City"
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.venueAddress}
                      onChange={e => setFormData({...formData, venueAddress: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Google Maps URL (Optional)</label>
                    <input 
                      type="url" 
                      placeholder="https://maps.google.com/..."
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.venueMapsUrl}
                      onChange={e => setFormData({...formData, venueMapsUrl: e.target.value})}
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
                  <p className="text-neutral-500">Share the magic of how you both met and fell in love.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Tagline / Subtitle</label>
                    <input 
                      type="text" 
                      placeholder="A journey of a thousand miles begins with a single step..."
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.tagline}
                      onChange={e => setFormData({...formData, tagline: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">The Story</label>
                    <textarea 
                      rows={6}
                      placeholder="It all started when..."
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                      value={formData.loveStory}
                      onChange={e => setFormData({...formData, loveStory: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Hero Image URL</label>
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.heroImage}
                      onChange={e => setFormData({...formData, heroImage: e.target.value})}
                    />
                    <p className="text-xs text-neutral-400">Tip: Use a high-quality landscape photo for the best look.</p>
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
                  <p className="text-neutral-500">Set the mood and aesthetic for your wedding page.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Select Theme</label>
                    <div className="grid grid-cols-2 gap-4">
                      {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((t) => (
                        <button
                          key={t}
                          onClick={() => setFormData({...formData, theme: t})}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            formData.theme === t ? 'border-black bg-neutral-50' : 'border-neutral-100 hover:border-neutral-200'
                          }`}
                        >
                          <div className={`w-full h-12 rounded-lg mb-3 ${THEMES[t].bg} border border-black/5`} />
                          <span className="font-bold capitalize">{t.replace('-', ' ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Font Style</label>
                    <div className="flex gap-4">
                      {['serif', 'script', 'sans'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFormData({...formData, fontStyle: f as any})}
                          className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                            formData.fontStyle === f ? 'border-black bg-neutral-50' : 'border-neutral-100 hover:border-neutral-200'
                          }`}
                        >
                          <span className={`capitalize ${f === 'serif' ? 'font-serif' : f === 'script' ? 'font-script' : 'font-sans'}`}>
                            {f}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">Background Music</label>
                    <select 
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.musicId}
                      onChange={e => setFormData({...formData, musicId: e.target.value})}
                    >
                      <option value="">No Music</option>
                      {MUSIC_TRACKS.map(track => (
                        <option key={track.id} value={track.id}>{track.name}</option>
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
                  <p className="text-neutral-500">Almost there! Configure the final details for your guests.</p>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                    <div>
                      <h4 className="font-bold">Countdown Timer</h4>
                      <p className="text-sm text-neutral-500">Show a live countdown to your wedding day.</p>
                    </div>
                    <button 
                      onClick={() => setFormData({...formData, showCountdown: !formData.showCountdown})}
                      className={`w-14 h-8 rounded-full transition-colors relative ${formData.showCountdown ? 'bg-black' : 'bg-neutral-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.showCountdown ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-neutral-400">RSVP Deadline</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-100 focus:ring-2 focus:ring-black outline-none transition-all"
                      value={formData.rsvpDeadline}
                      onChange={e => setFormData({...formData, rsvpDeadline: e.target.value})}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="p-6 border-t bg-white sticky bottom-0 z-10">
          <div className="flex justify-between max-w-2xl mx-auto w-full">
            <button
              disabled={step === 1}
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold disabled:opacity-30 hover:bg-neutral-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            
            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
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
                {isPublishing ? 'Publishing...' : 'Publish Page'} <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </footer>
      </div>

      {/* Preview Side */}
      <div className={`flex-1 bg-neutral-100 relative ${showPreview ? 'flex' : 'hidden md:flex'}`}>
        <button 
          onClick={() => setShowPreview(false)}
          className="md:hidden absolute top-6 left-6 z-50 p-3 bg-white rounded-full shadow-lg"
        >
          <Edit3 className="w-6 h-6" />
        </button>
        
        <div className="w-full h-full overflow-y-auto">
          <div className="scale-[0.85] origin-top shadow-2xl rounded-[3rem] overflow-hidden border-[12px] border-neutral-800 my-12 mx-auto max-w-[450px] md:max-w-none md:w-[90%] md:h-[90%]">
            <WeddingPageView wedding={formData} isPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
