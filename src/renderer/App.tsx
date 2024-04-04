import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';
import { Select } from 'antd';
import axios from 'axios';

type User = {
  id: number;
  name: string;
};

type Record = {
  id: number;
  user: User;
  enterAt: Date;
  exitAt: Date;
};

function Hello() {
  const [date, setDate] = useState(new Date());
  const [users, setUsers] = useState<User[]>([]);
  const [IsGetUser, setIsGetUser] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRecord, setCurrentRecord] = useState<Record | null>(null);

  const usersToOptions = (us: User[]) => {
    return us.map((u) => ({ value: u.id, label: u.name }));
  };

  const getStoreData = async () => {
    try {
      const user = await window.electron.ipcRenderer.getUser();
      setCurrentUser(user);
      setIsGetUser(true);
      const record = await window.electron.ipcRenderer.getRecord();
      setCurrentRecord(record);
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

  const getLatestRecord = async (id: number) => {
    try {
      const res = await axios.post('http://localhost:4040/latest_record', {
        user_id: id,
      });
      console.log(res.data);
      setCurrentRecord(res.data.record);
      await window.electron.ipcRenderer.setRecord(res.data.record);
    } catch (error) {
      console.error(error);
    }
  };

  const enter = async () => {
    try {
      if (!currentUser) {
        return;
      }
      const res = await axios.post('http://localhost:4040/enter', {
        user_id: currentUser.id,
      });
      console.log(res.data);
      setCurrentRecord(res.data.record);
      await window.electron.ipcRenderer.setRecord(res.data.record);
    } catch (error) {
      console.error(error);
    }
  };

  const exit = async () => {
    try {
      if (!currentUser) {
        return;
      }
      await axios.put('http://localhost:4040/exit', {
        user_id: currentUser.id,
      });
      setCurrentRecord(null);
      await window.electron.ipcRenderer.setRecord(null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getStoreData();
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
    window.electron.ipcRenderer.setUser(user);

    getLatestRecord(user.id);
  };

  if (!IsGetUser) {
    return null;
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
          onClick={() => {
            if (!currentUser) {
              console.log('currentUser is null');
              return;
            }

            if (currentRecord) {
              exit();
            } else {
              enter();
            }
          }}
        >
          {currentRecord ? '退出' : '入室'}
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
