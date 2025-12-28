import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRatingStore } from '../store/ratingStore';
import { trainingPlans, getPlanForRating } from '../data/trainingPlans';
import type { TrainingPlan as TrainingPlanType, TrainingDay, TrainingTask } from '../data/trainingPlans';
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Target,
  Trophy,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Zap,
  BookOpen,
  Puzzle,
  Brain,
  Play,
  Star,
} from 'lucide-react';

type Phase = 'select' | 'plan' | 'day';

interface TaskProgress {
  [taskId: string]: boolean;
}

export function TrainingPlan() {
  const navigate = useNavigate();
  const { rating } = useRatingStore();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlanType | null>(null);
  const [selectedDay, setSelectedDay] = useState<TrainingDay | null>(null);
  const [taskProgress, setTaskProgress] = useState<TaskProgress>({});

  const recommendedPlan = getPlanForRating(rating);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'from-green-500 to-green-700';
      case 'intermediate': return 'from-yellow-500 to-yellow-700';
      case 'advanced': return 'from-orange-500 to-orange-700';
      case 'expert': return 'from-red-500 to-red-700';
      default: return 'from-blue-500 to-blue-700';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'puzzles': return Puzzle;
      case 'patterns': return Brain;
      case 'study': return BookOpen;
      case 'practice': return Play;
      case 'lesson': return GraduationCap;
      default: return Target;
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setTaskProgress(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const getDayProgress = (day: TrainingDay) => {
    const completedTasks = day.tasks.filter(t => taskProgress[t.id]).length;
    return { completed: completedTasks, total: day.tasks.length };
  };

  const handleTaskClick = (task: TrainingTask) => {
    if (task.link) {
      navigate(task.link);
    }
  };

  // Plan Selection Phase
  if (phase === 'select') {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/learn"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Training Plans</h1>
                <p className="text-slate-400">Structured curriculum for improvement</p>
              </div>
            </div>
          </div>

          {/* Recommended Plan Banner */}
          <div className="card p-6 mb-6 border-teal-500/50 bg-gradient-to-r from-teal-900/20 to-slate-800">
            <div className="flex items-center gap-4">
              <Star size={32} className="text-teal-400" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">Recommended for You</h2>
                <p className="text-slate-400">Based on your rating of <span className="text-teal-400 font-semibold">{rating}</span></p>
              </div>
              <button
                onClick={() => { setSelectedPlan(recommendedPlan); setPhase('plan'); }}
                className="btn btn-primary"
              >
                Start {recommendedPlan.title}
              </button>
            </div>
          </div>

          {/* All Plans */}
          <div className="space-y-4">
            {trainingPlans.map((plan) => {
              const isRecommended = plan.id === recommendedPlan.id;

              return (
                <button
                  key={plan.id}
                  onClick={() => { setSelectedPlan(plan); setPhase('plan'); }}
                  className={`card p-5 w-full text-left hover:border-teal-500 transition-all group ${
                    isRecommended ? 'border-teal-500/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getLevelColor(plan.level)} flex items-center justify-center flex-shrink-0`}>
                      <GraduationCap size={28} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
                          {plan.title}
                        </h3>
                        {isRecommended && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                            Recommended
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                        <span className={`capitalize px-2 py-0.5 rounded text-xs bg-gradient-to-r ${getLevelColor(plan.level)} text-white`}>
                          {plan.level}
                        </span>
                        <span>Rating {plan.ratingRange.min}-{plan.ratingRange.max}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {plan.durationWeeks} weeks
                        </span>
                      </div>

                      <p className="text-slate-400 text-sm mb-3">{plan.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {plan.goals.slice(0, 3).map((goal, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                            {goal}
                          </span>
                        ))}
                        {plan.goals.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-400">
                            +{plan.goals.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-500 group-hover:text-teal-400 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Plan Overview Phase
  if (phase === 'plan' && selectedPlan) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setPhase('select')}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{selectedPlan.title}</h1>
              <p className="text-slate-400">{selectedPlan.durationWeeks}-week training program</p>
            </div>
          </div>

          {/* Plan Info */}
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Training Goals</h2>
            <div className="space-y-2">
              {selectedPlan.goals.map((goal, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-teal-400" />
                  <span className="text-slate-300">{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Week 1 Schedule</h2>
            <div className="space-y-3">
              {selectedPlan.days.map((day) => {
                const progress = getDayProgress(day);
                const isComplete = progress.completed === progress.total && progress.total > 0;

                return (
                  <button
                    key={day.day}
                    onClick={() => { setSelectedDay(day); setPhase('day'); }}
                    className="w-full p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isComplete ? 'bg-teal-500' : 'bg-slate-600'
                      }`}>
                        {isComplete ? (
                          <CheckCircle2 size={20} className="text-white" />
                        ) : (
                          <span className="text-white font-bold">{day.day}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                            Day {day.day}: {day.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock size={14} />
                            {day.estimatedMinutes} min
                          </div>
                        </div>
                        <p className="text-sm text-slate-400">{day.focus}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 transition-all"
                              style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {progress.completed}/{progress.total}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-500 group-hover:text-teal-400 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Day Detail Phase
  if (phase === 'day' && selectedPlan && selectedDay) {
    const progress = getDayProgress(selectedDay);

    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setPhase('plan')}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Day {selectedDay.day}: {selectedDay.title}</h1>
              <p className="text-slate-400">{selectedDay.focus}</p>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={18} />
              <span>{selectedDay.estimatedMinutes} minutes</span>
            </div>
          </div>

          {/* Progress */}
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Today's Progress</span>
              <span className="text-sm font-semibold text-white">
                {progress.completed}/{progress.total} tasks completed
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all"
                style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-4">
            {selectedDay.tasks.map((task) => {
              const TaskIcon = getTaskIcon(task.type);
              const isComplete = taskProgress[task.id];

              return (
                <div
                  key={task.id}
                  className={`card p-5 transition-all ${isComplete ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-1"
                    >
                      {isComplete ? (
                        <CheckCircle2 size={24} className="text-teal-400" />
                      ) : (
                        <Circle size={24} className="text-slate-500 hover:text-teal-400 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getLevelColor(selectedPlan.level)} flex items-center justify-center`}>
                          <TaskIcon size={16} className="text-white" />
                        </div>
                        <h3 className={`font-semibold ${isComplete ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </h3>
                      </div>

                      <p className="text-slate-400 text-sm mb-3">{task.description}</p>

                      <div className="flex items-center gap-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 capitalize">
                          {task.type}
                        </span>
                        {task.requiredCount && (
                          <span className="text-xs text-slate-500">
                            {task.requiredCount} to complete
                          </span>
                        )}
                        {task.themes && task.themes.length > 0 && (
                          <span className="text-xs text-slate-500">
                            Focus: {task.themes.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {task.link && !isComplete && (
                      <button
                        onClick={() => handleTaskClick(task)}
                        className="btn btn-primary"
                      >
                        <Zap size={16} />
                        Start
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Message */}
          {progress.completed === progress.total && progress.total > 0 && (
            <div className="card p-6 mt-6 text-center border-teal-500/50 bg-gradient-to-r from-teal-900/20 to-slate-800">
              <Trophy size={48} className="text-teal-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Day Complete!</h3>
              <p className="text-slate-400 mb-4">Great work! You've completed all tasks for today.</p>
              <button
                onClick={() => setPhase('plan')}
                className="btn btn-primary"
              >
                Back to Plan
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
