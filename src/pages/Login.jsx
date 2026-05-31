import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogIn, Send, KeyRound } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useStore(state => state.login);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Server connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), otp: otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        login(username.trim());
        navigate('/profile');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Server connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="login-page">
      <div className="login-container card">
        <div className="text-center mb-8">
          <div className="login-icon">🦷</div>
          <h1 className="text-3xl font-bold text-teal-600 mb-2">Welcome Back!</h1>
          <p className="text-gray-500">
            {step === 1 ? 'Enter your name to receive a secure login code.' : `Enter the 6-digit code sent to ${username}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Email Address</label>
              <input 
                type="email" 
                id="username"
                placeholder="parent@example.com"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                autoComplete="off"
                autoFocus
                disabled={loading}
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'} <Send size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="form-group">
              <label className="text-center w-full block mb-4">Secure Code</label>
              <div className="otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    className="otp-input"
                    autoFocus={index === 0}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {error && <p className="error-msg text-center">{error}</p>}

            <button type="submit" className="btn btn-primary w-full mt-6 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'} <KeyRound size={18} />
            </button>
            <button 
              type="button" 
              className="text-slate-500 hover:text-teal-600 text-sm mt-4 w-full text-center transition-colors"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back to Username
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
