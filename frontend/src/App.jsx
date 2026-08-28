import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage.jsx';
import { SubmitPage } from './pages/SubmitPage.jsx';
import { ResultPage } from './pages/ResultPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { SignupPage } from './pages/SignupPage.jsx';
import { submitListing } from './api/client.js';
import { ShieldCheck, ArrowRight, Gauge, Hand } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'submit' | 'result' | 'how' | 'about' | 'login' | 'signup'
  const [listing, setListing] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('auth_token'));
  const [currentUser, setCurrentUser] = useState(() => {
    const email = localStorage.getItem('auth_email');
    return email ? { email } : null;
  });

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('auth_token', authToken);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [authToken]);

  const handleAuthSuccess = (data) => {
    setAuthToken(data.token);
    setCurrentUser({ email: data.email });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_email', data.email);
    navTo('home');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_email');
    navTo('home');
  };

  const handleSubmitListing = async (formData) => {
    setLoading(true);
    setError(null);
    setListing(formData);

    try {
      const res = await submitListing(formData);
      setResult(res);
      setView('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Failed to analyze listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setView('submit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navTo = (target) => {
    setView(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-border bg-background/95 sticky top-0 z-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <button onClick={() => navTo('home')} className="flex items-center gap-3 text-left group">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <ShieldCheck size={22} />
            </span>
            <div>
              <strong className="block font-mono text-sm tracking-tight text-foreground font-bold">
                safespot.pk
              </strong>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Pakistani P2P Marketplace Risk Detector
              </span>
            </div>
          </button>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <button
              onClick={() => navTo('home')}
              aria-current={view === 'home' ? 'page' : undefined}
              className={`hover:text-primary transition-colors ${view === 'home' ? 'text-primary font-bold' : 'text-muted-foreground'}`}
            >
              Home
            </button>
            <button
              onClick={() => navTo('submit')}
              aria-current={view === 'submit' ? 'page' : undefined}
              className={`hover:text-primary transition-colors ${view === 'submit' ? 'text-primary font-bold' : 'text-muted-foreground'}`}
            >
              Check a Listing
            </button>
            <button
              onClick={() => navTo('how')}
              aria-current={view === 'how' ? 'page' : undefined}
              className={`hover:text-primary transition-colors ${view === 'how' ? 'text-primary font-bold' : 'text-muted-foreground'}`}
            >
              How It Works
            </button>
            <button
              onClick={() => navTo('about')}
              aria-current={view === 'about' ? 'page' : undefined}
              className={`hover:text-primary transition-colors ${view === 'about' ? 'text-primary font-bold' : 'text-muted-foreground'}`}
            >
              About
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <span className="hidden sm:block text-xs font-semibold text-muted-foreground">
                  Hi, {currentUser.email.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navTo('login')}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-all"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => navTo('submit')}
              className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all flex items-center gap-1.5"
            >
              Start Checking <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {error && (
          <div className="mx-auto max-w-6xl px-5 pt-6">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-bold text-amber-900">
              {error}
            </div>
          </div>
        )}

        {view === 'home' && (
          <HomePage
            onStartChecking={() => navTo('submit')}
            onNavigateToHowItWorks={() => navTo('how')}
          />
        )}

        {view === 'submit' && (
          <SubmitPage onSubmitListing={handleSubmitListing} loading={loading} />
        )}

        {view === 'result' && result && (
          <ResultPage result={result} listing={listing} onReset={handleReset} />
        )}

        {view === 'login' && (
          <LoginPage
            onLoginSuccess={handleAuthSuccess}
            onNavigateToSignup={() => navTo('signup')}
          />
        )}

        {view === 'signup' && (
          <SignupPage
            onSignupSuccess={handleAuthSuccess}
            onNavigateToLogin={() => navTo('login')}
          />
        )}

        {view === 'how' && (
          <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <button onClick={() => navTo('home')} className="mb-12 text-xs font-bold text-primary hover:underline">
              ← Back to home
            </button>
            <p className="font-mono text-xs uppercase tracking-[.18em] text-primary font-bold">How It Works</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              A clear trust signal for a murky market.
            </h1>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <article className="border-t-2 border-primary pt-6">
                <span className="font-mono text-xs font-bold text-primary uppercase">Step 01</span>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">Paste the Listing</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Paste the text, asking price in PKR, category, and seller info from OLX, Facebook Marketplace, or Daraz.
                </p>
              </article>

              <article className="border-t-2 border-primary pt-6">
                <span className="font-mono text-xs font-bold text-primary uppercase">Step 02</span>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">Two Checks in Parallel</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Price deviation checks the ask against local reference data while AI pattern detection scans for JazzCash/EasyPaisa advance payment demands.
                </p>
              </article>

              <article className="border-t-2 border-primary pt-6">
                <span className="font-mono text-xs font-bold text-primary uppercase">Step 03</span>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">Make a Calmer Decision</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Both checks merge into a single 0–100 score with plain-English red flags and safety tips before you invest time or share your contact number.
                </p>
              </article>
            </div>
          </section>
        )}

        {view === 'about' && (
          <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <button onClick={() => navTo('home')} className="mb-12 text-xs font-bold text-primary hover:underline">
              ← Back to home
            </button>
            <p className="font-mono text-xs uppercase tracking-[.18em] text-primary font-bold">About safespot.pk</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Trust signals before contact, not after.
            </h1>

            <div className="mt-12 max-w-3xl">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Buyers on Pakistani peer-to-peer marketplaces previously had no way to judge listing legitimacy until mid-conversation — often after sharing phone numbers or facing pressure for JazzCash/EasyPaisa advance payments. safespot.pk brings upfront transparency to local listings.
              </p>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="rounded-3xl bg-secondary p-6 border border-border">
                  <Gauge className="text-primary" size={28} />
                  <h2 className="mt-6 text-lg font-bold text-foreground">0–100 Trust Score</h2>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    A quick shared language for risk assessment based on localized price ranges and scam pattern scans.
                  </p>
                </div>

                <div className="rounded-3xl bg-secondary p-6 border border-border">
                  <Hand className="text-primary" size={28} />
                  <h2 className="mt-6 text-lg font-bold text-foreground">Accuracy Feedback Loop</h2>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Buyer thumbs-up and thumbs-down votes feed back into our scam detection models to make future checks sharper.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            <span><strong>Marketplace Risk Detector</strong> · DoraHacks 2.0 Vibe Coding Hackathon</span>
          </div>
          <div className="flex gap-4 font-mono text-[11px]">
            <span>Aug 2026 Build</span>
            <span>Target: Pakistani P2P Marketplaces</span>
          </div>
        </div>
      </footer>
    </div>
  );
}