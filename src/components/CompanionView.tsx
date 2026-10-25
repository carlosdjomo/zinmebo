import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Volume2, Copy, Check, Quote, Heart, Bookmark, BookmarkCheck, ArrowRight, Compass } from 'lucide-react';
import { InspirationalQuote, INSPIRATIONAL_QUOTES, getRandomQuote } from '../data/quotes';
import { sounds } from '../utils/audio';
import { DayRecord, UserSettings } from '../types';

interface CompanionViewProps {
  todayRecord: DayRecord;
  settings: UserSettings;
  weeklyAvg: number;
}

export const CompanionView: React.FC<CompanionViewProps> = ({
  todayRecord,
  settings,
}) => {
  const [currentQuote, setCurrentQuote] = useState<InspirationalQuote>(() => getRandomQuote());
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quoteHistory, setQuoteHistory] = useState<InspirationalQuote[]>([currentQuote]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zinmebo_favorite_quotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'Gentle Pace',
    'Rest & Renewal',
    'Presence & Mind',
    'Nature & Soles',
    'The Extra Mile',
    'Self-Compassion',
  ];

  // Fetch or cycle to next random quote
  const handleShowMeMore = async () => {
    setIsAnimating(true);

    if (settings.soundEnabled) {
      sounds.playStepTap();
    }

    try {
      // Filter candidates if a category is selected
      const filteredPool =
        selectedCategory === 'all'
          ? INSPIRATIONAL_QUOTES
          : INSPIRATIONAL_QUOTES.filter((q) => q.category === selectedCategory);

      const availableCandidates = filteredPool.filter((q) => q.id !== currentQuote.id);
      const nextQuote =
        availableCandidates.length > 0
          ? availableCandidates[Math.floor(Math.random() * availableCandidates.length)]
          : getRandomQuote(currentQuote.id);

      setTimeout(() => {
        setCurrentQuote(nextQuote);
        setQuoteHistory((prev) => {
          if (prev.some((item) => item.id === nextQuote.id)) return prev;
          return [nextQuote, ...prev.slice(0, 8)];
        });
        setIsAnimating(false);
      }, 180);
    } catch {
      const fallback = getRandomQuote(currentQuote.id);
      setCurrentQuote(fallback);
      setIsAnimating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `"${currentQuote.quote}" — ${currentQuote.author}${currentQuote.source ? ` (${currentQuote.source})` : ''}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (quoteId: string) => {
    let updated: string[];
    if (favorites.includes(quoteId)) {
      updated = favorites.filter((id) => id !== quoteId);
    } else {
      updated = [...favorites, quoteId];
      if (settings.soundEnabled) {
        sounds.playMindfulChime();
      }
    }
    setFavorites(updated);
    try {
      localStorage.setItem('zinmebo_favorite_quotes', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const isFavorited = favorites.includes(currentQuote.id);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/5 p-4 sm:p-5 rounded-3xl border border-teal-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3caaa7] flex items-center justify-center text-white shadow-md">
            <Quote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#3caaa7] uppercase tracking-wider">
                Inspirational Mate
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">Daily Walking Wisdom</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Inspirational Quotes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Gentle perspective and words of encouragement to match your rhythm today.
            </p>
          </div>
        </div>

        <button
          onClick={() => sounds.playMindfulChime()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold shadow-2xs transition-all"
        >
          <Volume2 className="w-3.5 h-3.5 text-[#3caaa7]" />
          <span>Mindful Chime</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold px-1 text-[11px] shrink-0">Filter Theme:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-[#3caaa7] text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200/80'
            }`}
          >
            {cat === 'all' ? 'All Wisdom' : cat}
          </button>
        ))}
      </div>

      {/* Main Quote Stage */}
      <div className="relative bg-white rounded-3xl border border-teal-100 p-6 sm:p-10 shadow-sm flex flex-col items-center text-center overflow-hidden">
        {/* Calming background ornaments */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

        {/* Category Pill & ID */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#184f4d] border border-teal-200/60 shadow-2xs">
            {currentQuote.category}
          </span>
          {isFavorited && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" /> Favorited
            </span>
          )}
        </div>

        {/* Decorative Quote Icon */}
        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-[#3caaa7] mb-4">
          <Quote className="w-6 h-6 rotate-180" />
        </div>

        {/* Quote Content with transition animation */}
        <div
          className={`max-w-2xl transition-all duration-200 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 leading-snug tracking-tight">
            "{currentQuote.quote}"
          </blockquote>

          <div className="mt-5 flex flex-col items-center">
            <span className="text-sm sm:text-base font-bold text-teal-800">
              {currentQuote.author}
            </span>
            {currentQuote.source && (
              <span className="text-xs text-slate-400 italic mt-0.5">
                {currentQuote.source}
              </span>
            )}
          </div>

          {currentQuote.reflection && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 max-w-lg mx-auto">
              <Compass className="w-3.5 h-3.5 text-[#3caaa7] shrink-0" />
              <span>
                <strong className="text-slate-700">Mindful thought:</strong> {currentQuote.reflection}
              </span>
            </div>
          )}
        </div>

        {/* Big Prominent "Show me more" Button */}
        <div className="mt-8 pt-4 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleShowMeMore}
            disabled={isAnimating}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#3caaa7] hover:bg-[#349693] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group active:scale-98"
          >
            <RefreshCw className={`w-4 h-4 transition-transform group-hover:rotate-180 duration-500 ${isAnimating ? 'animate-spin' : ''}`} />
            <span>Show me more</span>
            <Sparkles className="w-4 h-4 text-teal-200" />
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            {/* Copy Quote Button */}
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-slate-200 hover:border-teal-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              title="Copy quote"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(currentQuote.id)}
              className={`flex-1 sm:flex-none px-4 py-3 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isFavorited
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-200 hover:border-teal-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title={isFavorited ? 'Remove favorite' : 'Save to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-500' : 'text-slate-400'}`} />
              <span>{isFavorited ? 'Saved' : 'Favorite'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* History of Uncovered Quotes in this Session */}
      {quoteHistory.length > 1 && (
        <div className="bg-white rounded-3xl border border-teal-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#3caaa7]" />
              Recently Viewed Quotes ({quoteHistory.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click any quote to revisit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {quoteHistory.map((q) => {
              const isCurrent = q.id === currentQuote.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setCurrentQuote(q)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isCurrent
                      ? 'border-[#3caaa7] bg-teal-50/80 shadow-2xs ring-1 ring-teal-300'
                      : 'border-slate-100 hover:border-teal-200 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                      "{q.quote}"
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-bold text-teal-800">{q.author}</span>
                      <span>•</span>
                      <span>{q.category}</span>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[#3caaa7] bg-white px-2 py-0.5 rounded-lg border border-teal-200 shrink-0">
                      Viewing
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zinmebo Core Creed */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-500 to-[#184f4d] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
            The Zinmebo Creed
          </div>
          <h4 className="text-sm font-extrabold">
            "Walk your way well. Because we’re all humans."
          </h4>
          <p className="text-xs text-teal-100/90 leading-relaxed max-w-xl">
            Sometimes we go the extra mile and some other times we feel like cutting off and slowing down. Zinmebo is the step companion that matches your pace, mood, and progress – without blaming nor pushing beyond what you can do.
          </p>
        </div>

        <div className="text-[11px] text-teal-200/80 whitespace-nowrap text-center sm:text-right shrink-0">
          © 2026 Carlos Djomo, Ph.D<br />All rights reserved
        </div>
      </div>
    </div>
  );
};
