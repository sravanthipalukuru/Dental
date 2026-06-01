import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { User, Mail, Lock, Smile } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(false);
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!isLogin && !parentName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: trimmedEmail, password }
        : { parentName: parentName.trim(), email: trimmedEmail, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        login(data.userId);
        navigate('/profile');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Server connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <Smile size={40} color="white" strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to continue' : 'Join Dental Buddy today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-input-group">
              <User size={20} className="auth-input-icon" />
              <input 
                type="text" 
                placeholder="Parent Name"
                value={parentName}
                onChange={(e) => { setParentName(e.target.value); setError(''); }}
                disabled={loading}
              />
            </div>
          )}

          <div className="auth-input-group">
            <Mail size={20} className="auth-input-icon" />
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
            />
          </div>

          <div className="auth-input-group">
            <Lock size={20} className="auth-input-icon" />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              disabled={loading}
            />
          </div>

          {error && <p className="auth-error-msg">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="auth-toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
