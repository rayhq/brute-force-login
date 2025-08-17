import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, LogOut, Table, ExternalLink } from 'lucide-react';

interface Attempt {
  time: string;
  ip: string;
  username: string;
  password: string;
  success: boolean;
}

function App() {
  const FLAG = "FLAG{bruteforce_success_123}"; // local constant for the flag

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [showAttempts, setShowAttempts] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Check if user is already logged in on app load
  useEffect(() => {
    fetch('http://localhost:5000/api/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => {
        if (data.logged_in) {
          setLoggedInUser(data.username);
        }
      })
      .catch(() => setLoggedInUser(null))
      .finally(() => setLoadingSession(false));
  }, []);

  // Fetch attempts from backend
  const fetchAttempts = () => {
    setLoadingAttempts(true);
    fetch('http://localhost:5000/api/attempts', {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setAttempts(data);
        setShowAttempts(true);
      })
      .catch(() => alert('Could not fetch attempts'))
      .finally(() => setLoadingAttempts(false));
  };

  // Auto-refresh attempts every 5s
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (showAttempts && loggedInUser === 'admin') {
      fetchAttempts(); // Fetch immediately
      intervalId = setInterval(fetchAttempts, 5000);
    }
    return () => clearInterval(intervalId);
  }, [showAttempts, loggedInUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoggedInUser(username);
        setUsername('');
        setPassword('');
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    fetch('http://localhost:5000/api/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(() => {
        setLoggedInUser(null);
        setShowAttempts(false);
      })
      .catch(() => alert('Logout failed'));
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Logged-in view
  if (loggedInUser) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4 p-6 w-full">
        {/* 🎉 Flag message */}
        <h1 className="text-2xl font-bold mb-4 text-green-400">
          🎉 Congratulations! This is the flag: {FLAG}
        </h1>

        {/* Admin view options */}
        {loggedInUser === 'admin' && !showAttempts && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* View attempts inside React */}
            <button
              onClick={() => setShowAttempts(true)}
              className="flex items-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
            >
              <Table className="mr-2" /> View Attempts (Live)
            </button>

            {/* Open in new tab */}
            <a
              href="http://localhost:5000/attempts"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md"
            >
              <ExternalLink className="mr-2" /> Open in New Tab
            </a>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
        >
          <LogOut className="mr-2" /> Logout
        </button>

        {/* Live attempts table */}
        {showAttempts && (
          <div className="overflow-x-auto mt-6 w-full max-w-4xl">
            {loadingAttempts && <p>Loading attempts...</p>}
            <table className="table-auto w-full text-left border border-gray-700 rounded">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-4 py-2 border border-gray-700">Time</th>
                  <th className="px-4 py-2 border border-gray-700">IP Address</th>
                  <th className="px-4 py-2 border border-gray-700">Username</th>
                  <th className="px-4 py-2 border border-gray-700">Password</th>
                  <th className="px-4 py-2 border border-gray-700">Success</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}
                  >
                    <td className="px-4 py-2 border border-gray-700">{a.time}</td>
                    <td className="px-4 py-2 border border-gray-700">{a.ip}</td>
                    <td className="px-4 py-2 border border-gray-700">{a.username}</td>
                    <td className="px-4 py-2 border border-gray-700">{a.password}</td>
                    <td className="px-4 py-2 border border-gray-700 text-center">
                      {a.success ? '✅' : '❌'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Login form view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/20 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800/95 rounded-2xl p-8 border border-orange-500/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome</h1>
          <p className="text-gray-300 text-sm">Please sign in to your account</p>
        </div>

        {errorMsg && (
          <div className="mb-4 text-red-400 text-sm">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-200">Username</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 bg-gray-700/50"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">Password</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 bg-gray-700/50"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
