import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';
import { Select } from 'antd';
import axios from 'axios';

type User = {
  id: number;
  name: string;
};

function Hello() {
  const [date, setDate] = useState(new Date());
  const [isEnter, setIsEnter] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [IsGetUser, setIsGetUser] = useState<boolean>(false);

  const usersToOptions = (us: User[]) => {
    return us.map((u) => ({ value: u.id, label: u.name }));
  };

  const getUser = async () => {
    try {
      const user = await window.electron.ipcRenderer.getUser();
      setCurrentUser(user);
      setIsGetUser(true);
    } catch (error) {
      console.error(error);
    }
  };

  const listUsers = async () => {
    try {
      const res = await axios.get('http://localhost:4040/users');
      setUsers(res.data.users);

      const user = await window.electron.ipcRenderer.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUser();
    listUsers();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleChange = (value: number) => {
    const user = users.find((u) => u.id === value);
    if (!user) {
      return;
    }
    setCurrentUser(user);
    console.log('selected', user);
    window.electron.ipcRenderer.setUser(user);
  };

  if (!IsGetUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="Window">
      <div className="User">
        <Select
          defaultValue={currentUser?.id}
          onChange={handleChange}
          style={{ width: 120 }}
          options={usersToOptions(users)}
        />
      </div>
      <div className="Time">
        <h1>
          {String(date.getHours()).padStart(2, '0')}:
          {String(date.getMinutes()).padStart(2, '0')}:
          {String(date.getSeconds()).padStart(2, '0')}
        </h1>
      </div>
      <div className="Hello">
        <button
          type="button"
          className="Toggle"
          onClick={() => setIsEnter(!isEnter)}
        >
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
