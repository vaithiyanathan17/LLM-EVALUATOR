import './App.css'
import ExcelLikeCSVViewer from './components/CsvToTableComponent.jsx'
import {Toaster} from 'react-hot-toast';

function App() {
  return (<div>
    <Toaster position='top-right' toastOptions={{ duration: 2000 }} />
    <ExcelLikeCSVViewer />
  </div>)
}

export default App
