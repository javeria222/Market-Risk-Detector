import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { signup } from '../api/client.js';

export function SignupPage({ onSignupSuccess, onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEmailTaken(false);
    setLoading(true);
    try {
      const data = await signup(email, password);
      onSignupSuccess(data);
    } catch (err) {
      if (err.message === 'Email already registered') {
        setEmailTaken(true);
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
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
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>


        {emailTaken && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-bold text-amber-900">
            This email is already registered.{' '}
            <button onClick={onNavigateToLogin} className="underline">
              Log in instead
            </button>
          </div>
        )}

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-11 rounded-xl border border-input bg-background px-4 font-normal outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-primary px-5 py-3.5 font-bold text-primary-foreground disabled:opacity-60 transition-all flex items-center justify-center gap-2 hover:bg-primary/90 shadow-md shadow-primary/10"
          >
            {loading ? 'Creating account...' : (<>Sign Up <ArrowRight size={18} /></>)}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <button onClick={onNavigateToLogin} className="text-primary font-bold hover:underline">
            Log in
          </button>
        </p>
      </div>
    </section>
  );
}