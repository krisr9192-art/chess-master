import { HashRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { Home } from './pages/Home';
import { PlayAI } from './pages/PlayAI';
import { PlayFriend } from './pages/PlayFriend';
import { Learn } from './pages/Learn';
import { Tutorials } from './pages/Tutorials';
import { Puzzles } from './pages/Puzzles';
import { Analysis } from './pages/Analysis';
import { Settings } from './pages/Settings';
import { Dashboard } from './pages/Dashboard';
import { PatternTraining } from './pages/PatternTraining';
import { StudyGames } from './pages/StudyGames';
import { TrainingPlan } from './pages/TrainingPlan';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-900">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play-ai" element={<PlayAI />} />
            <Route path="/play-friend" element={<PlayFriend />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/puzzles" element={<Puzzles />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patterns" element={<PatternTraining />} />
            <Route path="/study" element={<StudyGames />} />
            <Route path="/training" element={<TrainingPlan />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
