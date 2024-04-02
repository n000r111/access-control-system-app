import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';

function Hello() {
  const [date, setDate] = useState(new Date());
  const [isEnter, setIsEnter] = useState<boolean>(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="Window">
      <div className="Time">
        <h1>
          {String(date.getHours()).padStart(2, '0')}:
          {String(date.getMinutes()).padStart(2, '0')}:
          {String(date.getSeconds()).padStart(2, '0')}
        </h1>
      </div>
      <div className="Hello">
        <button type="button" onClick={() => setIsEnter(!isEnter)}>
          {isEnter ? '退出' : '入室'}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
