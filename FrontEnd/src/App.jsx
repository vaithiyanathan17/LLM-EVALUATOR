import './App.css'
import DropCsvViewer from './pages/DropCsvViewPage.jsx';
import PromptEvaluator from './pages/PromptEvaluationPage.jsx';
import {Toaster} from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar.jsx';

function App() {
  return (
    <Router>
    <Toaster position='top-right' toastOptions={{ duration: 2000 }} />
    <Navbar />
    <Routes>
        <Route path="/" element={<DropCsvViewer />} />
        <Route path="/upload" element={<DropCsvViewer />} />
        <Route path="/evaluate" element={<PromptEvaluator />} />
        {/* <Route path="/results" element={<Results />} /> */}
      </Routes>
  </Router>)
}

export default App
