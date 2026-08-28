import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { login } from '../api/client.js';

export function LoginPage({ onLoginSuccess, onNavigateToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      onLoginSuccess(data);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-5 py-16 md:py-24">
      <div className="flex items-center gap-3 justify-center mb-8">
        <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck size={22} />
        </span>
        <strong className="font-mono text-sm tracking-tight text-foreground font-bold">
          safespot.pk
        </strong>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to continue checking listings.</p>

        {error && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-bold text-amber-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-bold text-foreground">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-xl border border-input bg-background px-4 font-normal outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-foreground">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 rounded-xl border border-input bg-background px-4 font-normal outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-primary px-5 py-3.5 font-bold text-primary-foreground disabled:opacity-60 transition-all flex items-center justify-center gap-2 hover:bg-primary/90 shadow-md shadow-primary/10"
          >
            {loading ? 'Logging in...' : (<>Log In <ArrowRight size={18} /></>)}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <button onClick={onNavigateToSignup} className="text-primary font-bold hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </section>
  );
}