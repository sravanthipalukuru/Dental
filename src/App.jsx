import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import ChildPortal from './pages/ChildPortal';
import ParentPortal from './pages/ParentPortal';
import DentistPortal from './pages/DentistPortal';
import DrSmilesChat from './pages/DrSmilesChat';
import GamesLibrary from './pages/GamesLibrary';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Store from './pages/Store';
import ToolMatch from './games/ToolMatch/ToolMatch';
import SugarBugRunner from './games/SugarBugRunner/SugarBugRunner';
import MagicMirror from './games/MagicMirror/MagicMirror';
import ClinicExplorer from './games/ClinicExplorer/ClinicExplorer';
import ToothDefender from './games/ToothDefender/ToothDefender';
import BrushMaster from './games/BrushMaster/BrushMaster';
import FindCavity from './games/FindCavity/FindCavity';
import SmileBuilder from './games/SmileBuilder/SmileBuilder';
import VirtualPetTooth from './games/VirtualPetTooth/VirtualPetTooth';
import BravePatient from './games/BravePatient/BravePatient';
import FlossHero from './games/FlossHero/FlossHero';
import DentalAdventure from './games/DentalAdventure/DentalAdventure';
import AnxietyBattle from './games/AnxietyBattle/AnxietyBattle';
import DentistAssistant from './games/DentistAssistant/DentistAssistant';
import GraduationDay from './games/GraduationDay/GraduationDay';
import ShapeMatcher from './games/ShapeMatcher/ShapeMatcher';
import ToothpastePuzzle from './games/ToothpastePuzzle/ToothpastePuzzle';
import PlaqueBlaster from './games/PlaqueBlaster/PlaqueBlaster';
import LunchboxSorter from './games/LunchboxSorter/LunchboxSorter';
import ToothFairy from './games/ToothFairy/ToothFairy';
import { useStore } from './store/useStore';
import './index.css';

export default function App() {
  const fetchProgress = useStore(state => state.fetchProgress);
  const userId = useStore(state => state.userId);

  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [userId, fetchProgress]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/"             element={<Landing />} />
        <Route path="/child"        element={<ChildPortal />} />
        <Route path="/parent"       element={<ParentPortal />} />
        <Route path="/dentist"      element={<DentistPortal />} />
        <Route path="/dr-smiles"    element={<DrSmilesChat />} />
        <Route path="/games"        element={<GamesLibrary />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/profile"      element={<Profile />} />
        <Route path="/store"        element={<Store />} />
        <Route path="/game/virtual-pet" element={<VirtualPetTooth />} />
        <Route path="/game/clinic-explorer" element={<ClinicExplorer />} />
        <Route path="/game/tool-match" element={<ToolMatch />} />
        <Route path="/game/brave-patient" element={<BravePatient />} />
        <Route path="/game/tooth-defender" element={<ToothDefender />} />
        <Route path="/game/brush-master" element={<BrushMaster />} />
        <Route path="/game/floss-hero" element={<FlossHero />} />
        <Route path="/game/dental-adventure" element={<DentalAdventure />} />
        <Route path="/game/find-cavity" element={<FindCavity />} />
        <Route path="/game/anxiety-battle" element={<AnxietyBattle />} />
        <Route path="/game/smile-builder" element={<SmileBuilder />} />
        <Route path="/game/sugar-bug-runner" element={<SugarBugRunner />} />
        <Route path="/game/dentist-assistant" element={<DentistAssistant />} />
        <Route path="/game/magic-mirror" element={<MagicMirror />} />
        <Route path="/game/shape-matcher" element={<ShapeMatcher />} />
        <Route path="/game/toothpaste-puzzle" element={<ToothpastePuzzle />} />
        <Route path="/game/plaque-blaster" element={<PlaqueBlaster />} />
        <Route path="/game/lunchbox-sorter" element={<LunchboxSorter />} />
        <Route path="/game/tooth-fairy" element={<ToothFairy />} />
        <Route path="/game/graduation-day" element={<GraduationDay />} />
      </Routes>
    </Router>
  );
}
