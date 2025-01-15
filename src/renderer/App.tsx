import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import 'tailwindcss/tailwind.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Main from './../routes/Main';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Main />} />
            </Routes>
        </Router>
    );
}
