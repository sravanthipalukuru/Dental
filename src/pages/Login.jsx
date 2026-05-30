import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogIn } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter a valid username');
      return;
    }
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    login(trimmed);
    navigate('/profile');
  };

  return (
    <div className="login-page">
      <div className="login-container card">
        <div className="text-center mb-8">
          <div className="login-icon">🦷</div>
          <h1 className="text-3xl font-bold text-teal-600 mb-2">Welcome Back!</h1>
          <p className="text-gray-500">Enter your name to load your progress or create a new profile instantly.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Your Name / Username</label>
            <input 
              type="text" 
              id="username"
              placeholder="e.g. SuperTommy"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              autoComplete="off"
              autoFocus
            />
            {error && <p className="error-msg">{error}</p>}
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2">
            Let's Go! <LogIn size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
