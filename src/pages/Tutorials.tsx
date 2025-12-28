import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChessBoard } from '../components/Board/ChessBoard';
import { tutorialCategories, getTutorialsByCategory } from '../data/tutorials';
import { useGameStore } from '../store/gameStore';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import type { Tutorial, TutorialCategory } from '../types';

export function Tutorials() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as TutorialCategory | null;

  const [selectedCategory, setSelectedCategory] = useState<TutorialCategory | null>(categoryParam);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const { progress, completeTutorial, settings } = useGameStore();

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleStartTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
    setShowExplanation(false);
  };

  const handleNextStep = () => {
    if (!selectedTutorial) return;

    if (currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      // Tutorial complete
      completeTutorial(selectedTutorial.id);
      setSelectedTutorial(null);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const currentStepData = selectedTutorial?.steps[currentStep];

  // Category List View
  if (!selectedCategory && !selectedTutorial) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/learn"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Tutorials</h1>
              <p className="text-slate-400">Choose a category to start learning</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {tutorialCategories.map(({ value, label, description }) => {
              const categoryTutorials = getTutorialsByCategory(value);
              const completed = categoryTutorials.filter((t) =>
                progress.tutorialsCompleted.includes(t.id)
              ).length;

              return (
                <button
                  key={value}
                  onClick={() => setSelectedCategory(value)}
                  className="card p-6 text-left hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{label}</h3>
                    <span className="text-sm text-slate-400">
                      {completed}/{categoryTutorials.length}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Tutorial List for Selected Category
  if (selectedCategory && !selectedTutorial) {
    const categoryTutorials = getTutorialsByCategory(selectedCategory);
    const categoryInfo = tutorialCategories.find((c) => c.value === selectedCategory);

    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{categoryInfo?.label}</h1>
              <p className="text-slate-400">{categoryInfo?.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            {categoryTutorials.map((tutorial, index) => {
              const isCompleted = progress.tutorialsCompleted.includes(tutorial.id);

              return (
                <button
                  key={tutorial.id}
                  onClick={() => handleStartTutorial(tutorial)}
                  className="card p-4 w-full text-left flex items-center gap-4 hover:border-blue-500 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-600'
                        : 'bg-slate-700'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle size={20} className="text-white" />
                    ) : (
                      <span className="text-white font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{tutorial.title}</h3>
                    <p className="text-sm text-slate-400">{tutorial.description}</p>
                  </div>
                  <div className="text-sm text-slate-400">
                    {tutorial.steps.length} steps
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Tutorial View
  if (selectedTutorial && currentStepData) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedTutorial(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
              Back to tutorials
            </button>
            <div className="text-sm text-slate-400">
              Step {currentStep + 1} of {selectedTutorial.steps.length}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Board */}
            <div className="flex-shrink-0">
              <ChessBoard
                fen={currentStepData.fen}
                disabled={true}
                showCoordinates={settings.showCoordinates}
                showLegalMoves={settings.showLegalMoves}
                boardTheme={settings.boardTheme}
                autoQueen={settings.autoQueen}
                premoveEnabled={settings.premoveEnabled}
                soundEnabled={settings.soundEnabled}
                highlightSquares={currentStepData.highlightSquares}
                arrows={currentStepData.arrows}
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedTutorial.title}
                  </h2>
                </div>

                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  {currentStepData.instruction}
                </p>

                {currentStepData.explanation && (
                  <div className="mb-6">
                    {showExplanation ? (
                      <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                        <p className="text-slate-300">{currentStepData.explanation}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowExplanation(true)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Show explanation
                      </button>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{
                        width: `${((currentStep + 1) / selectedTutorial.steps.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="btn btn-primary flex items-center gap-2 flex-1 justify-center"
                  >
                    {currentStep === selectedTutorial.steps.length - 1 ? (
                      <>
                        Complete
                        <CheckCircle size={16} />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
