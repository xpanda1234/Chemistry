import React, { useState } from 'react';
import {
  BookMarked,
  RotateCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Flashcard } from '../types.ts';

interface FlashcardsViewProps {
  cards: Flashcard[];
  onAddCard: (card: Flashcard) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ cards, onAddCard }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New card form state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newTopic, setNewTopic] = useState('organic');

  const filteredCards = cards.filter((c) => selectedTopic === 'all' || c.topic === selectedTopic);
  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((idx) => (idx + 1) % (filteredCards.length || 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((idx) => (idx - 1 + (filteredCards.length || 1)) % (filteredCards.length || 1));
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const card: Flashcard = {
      id: `fc-user-${Date.now()}`,
      topic: newTopic as any,
      front: newFront,
      back: newBack,
      explanation: newExplanation || 'Custom student card created in CHEMIA.',
      difficulty: 'medium',
    };

    onAddCard(card);
    setNewFront('');
    setNewBack('');
    setNewExplanation('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6 space-y-6">
      <div className="max-w-4xl mx-auto w-full space-y-5">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-slate-100">
                Spaced Repetition Flashcards Deck
              </h2>
              <p className="text-xs text-slate-400">
                Active recall & Leitner spaced repetition for high-yield university chemistry principles
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="min-h-[44px] px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between text-xs overflow-x-auto touch-pan-x no-scrollbar pb-1 -mx-1 px-1">
          <div className="flex gap-1.5 shrink-0">
            {(['all', 'organic', 'inorganic', 'physical', 'analytical', 'spectroscopy', 'quantum'] as const).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTopic(t);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl font-medium capitalize transition-all whitespace-nowrap active:scale-95 ${
                    selectedTopic === t
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>
          <span className="text-xs font-mono text-slate-400 shrink-0 ml-4">
            {currentIndex + 1} / {filteredCards.length}
          </span>
        </div>

        {/* 3D Flashcard Container */}
        {activeCard ? (
          <div className="flex flex-col items-center space-y-5">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-2xl min-h-[300px] sm:min-h-[340px] bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between relative group hover:shadow-teal-900/20 select-none active:scale-[0.99]"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-teal-400 uppercase tracking-wider font-bold">
                  {activeCard.topic.toUpperCase()} DISCIPLINE
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <RotateCw className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-180 transition-transform duration-500" />
                  Tap to flip
                </span>
              </div>

              {/* Card Center Content */}
              <div className="py-6 text-center space-y-4">
                {!isFlipped ? (
                  <div>
                    <span className="text-xs font-mono uppercase text-slate-500 block mb-2 font-bold">
                      PROMPT / QUESTION
                    </span>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-100 leading-relaxed">
                      {activeCard.front}
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    <span className="text-xs font-mono uppercase text-teal-400 block mb-1 font-bold">
                      CORE ANSWER
                    </span>
                    <p className="text-lg sm:text-xl font-serif font-bold text-teal-200 leading-relaxed">
                      {activeCard.back}
                    </p>
                    {activeCard.explanation && (
                      <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-lg mx-auto pt-2 border-t border-slate-800">
                        {activeCard.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2 border-t border-slate-800/80">
                <span className="capitalize">Difficulty: {activeCard.difficulty}</span>
                <span>Active Recall Protocol</span>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handlePrev}
                className="min-h-[44px] min-w-[44px] p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all shadow-md flex items-center justify-center active:scale-95"
                aria-label="Previous Flashcard"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 font-medium flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <RotateCw className="w-4 h-4 text-teal-400" />
                <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
              </button>

              <button
                onClick={handleNext}
                className="min-h-[44px] min-w-[44px] p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all shadow-md flex items-center justify-center active:scale-95"
                aria-label="Next Flashcard"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
            No flashcards found in this discipline. Add a card to start reviewing!
          </div>
        )}

        {/* Add Card Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-serif font-bold text-slate-100">
                  Create Chemistry Flashcard
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCard} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-mono block mb-1">Discipline:</label>
                  <select
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                  >
                    <option value="organic">Organic Chemistry</option>
                    <option value="inorganic">Inorganic Chemistry</option>
                    <option value="physical">Physical Chemistry</option>
                    <option value="analytical">Analytical Chemistry</option>
                    <option value="spectroscopy">Spectroscopy</option>
                    <option value="quantum">Quantum Chemistry</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Front (Question / Prompt):</label>
                  <textarea
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="e.g. Why is cyclopentadienyl anion aromatic?"
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Back (Core Answer):</label>
                  <textarea
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="e.g. It has 6 π-electrons (4n+2 with n=1) in a planar cyclic conjugated ring."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono block mb-1">Detailed Explanation (Optional):</label>
                  <textarea
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    placeholder="Add deeper mechanistic or thermodynamic notes..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-md"
                  >
                    Save Flashcard
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
