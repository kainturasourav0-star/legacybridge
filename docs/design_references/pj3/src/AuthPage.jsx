import { SignIn, SignUp } from '@clerk/react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, Github, KeyRound, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BridgeMark from './BridgeMark';
import { clerkAppearance, isClerkConfigured } from './clerk';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.9-2.8C16.9 3 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4 9.6-9.8 0-.7-.1-1.4-.2-2H12Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.6c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1l-3.3 2.5C4.8 19.7 8.1 22 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.9c-.2-.6-.4-1.2-.4-1.9s.1-1.3.4-1.9L3.1 7.6C2.4 9 2 10.5 2 12s.4 3 1.1 4.4l3.3-2.5Z" />
      <path fill="#4285F4" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.8C16.9 3 14.7 2 12 2 8.1 2 4.8 4.3 3.1 7.6l3.3 2.5C7.2 7.7 9.4 6 12 6Z" />
    </svg>
  );
}

function PreviewAuthForm({ mode }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');
  const isLogin = mode === 'login';

  const socialPreview = (provider) => setNotice(`${provider} sign-in activates when your Clerk publishable key is connected.`);

  return (
    <form className="auth-preview-form" onSubmit={(event) => { event.preventDefault(); navigate('/dashboard'); }}>
      <div className="auth-preview-notice"><span><Sparkles size={12} /> UI preview</span><p>Connect Clerk to enable live authentication.</p></div>
      <div className="auth-social-grid">
        <button type="button" className="auth-social-button" onClick={() => socialPreview('Google')}><GoogleIcon /> Google</button>
        <button type="button" className="auth-social-button" onClick={() => socialPreview('GitHub')}><Github size={16} /> GitHub</button>
      </div>
      {notice && <div className="auth-inline-notice" role="status">{notice}</div>}
      <div className="auth-divider"><span />or continue with email<span /></div>
      {!isLogin && <label className="auth-field"><span>Workspace name</span><input name="workspace" placeholder="Aspirations HQ" required /></label>}
      <label className="auth-field"><span>Email address</span><input type="email" name="email" placeholder="you@company.com" autoComplete="email" required /></label>
      <label className="auth-field"><span>Password</span><div className="auth-password-wrap"><input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••••••" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={4} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
      {isLogin && <div className="auth-form-options"><label><input type="checkbox" /> <span>Remember this device</span></label><button type="button" onClick={() => setNotice('Password recovery is handled securely by Clerk once connected.')}>Forgot password?</button></div>}
      <button className="auth-submit" type="submit">Preview dashboard <ArrowRight size={15} /></button>
      <p className="auth-preview-foot">Preview only — credentials are not checked, transmitted, or stored.</p>
    </form>
  );
}

export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login';
  return (
    <main className="auth-page">
      <div className="auth-grid-bg" />
      <header className="auth-topbar">
        <Link className="brand" to="/" aria-label="LegacyBridge home"><span className="brand-mark"><BridgeMark /></span><span>LegacyBridge</span></Link>
        <Link className="auth-back-link" to="/"><ArrowLeft size={13} /> Back to website</Link>
      </header>
      <div className="auth-layout">
        <section className="auth-brand-panel">
          <div className="auth-beam" />
          <div className="auth-brand-copy">
            <span className="auth-overline"><i /> AI-POWERED LEGACY CODE MODERNIZATION</span>
            <h1>Understand legacy.<br /><span>Build what's next.</span></h1>
            <p>Recover business rules. Plan service boundaries. Validate behavior with evidence before approving change.</p>
            <div className="auth-secure-points"><span><Check size={12} /> Source-linked findings</span><span><Check size={12} /> Human approvals</span><span><Check size={12} /> Behavioral evidence</span></div>
          </div>
          <div className="auth-mini-product" aria-hidden="true">
            <div className="auth-mini-chrome"><span /><span /><span /><div><LockKeyhole size={10} /> app.legacybridge.io</div><small>SAMPLE</small></div>
            <div className="auth-mini-body">
              <div className="auth-mini-side"><i /><i /><i /><i /></div>
              <div className="auth-mini-main">
                <span className="auth-mini-label">ORDER MANAGEMENT MODERNIZATION</span>
                <div className="auth-mini-task"><Sparkles size={13} /><p>Map order dependencies and check the inventory guard before migration.</p></div>
                <div className="auth-mini-step complete"><CheckCircle2 size={13} /><span>Source map · illustrative</span><small>01</small></div>
                <div className="auth-mini-step complete"><CheckCircle2 size={13} /><span>24 candidate rules · sample</span><small>02</small></div>
                <div className="auth-mini-step active"><ShieldCheck size={13} /><span>Drift review required</span><small>03</small></div>
              </div>
            </div>
            <div className="auth-mini-float"><CheckCircle2 size={15} /><div><strong>Validation review</strong><span>3 illustrative drift risks · no tests executed</span></div></div>
          </div>
        </section>
        <section className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-form-heading"><span>{isLogin ? 'WELCOME BACK' : 'CREATE YOUR WORKSPACE'}</span><h2>{isLogin ? 'Log in to LegacyBridge' : 'Start building with LegacyBridge'}</h2><p>{isLogin ? 'Access modernization projects, migration plans, and validation evidence.' : 'Create an evidence-based legacy modernization workspace.'}</p></div>
            {isClerkConfigured ? (
              <div className="auth-clerk-wrap">
                {isLogin ? <SignIn routing="path" path="/login" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" appearance={clerkAppearance} /> : <SignUp routing="path" path="/sign-up" signInUrl="/login" fallbackRedirectUrl="/dashboard" appearance={clerkAppearance} />}
              </div>
            ) : <PreviewAuthForm mode={mode} />}
            <div className="auth-mode-switch">{isLogin ? 'New to LegacyBridge?' : 'Already have an account?'} <Link to={isLogin ? '/sign-up' : '/login'}>{isLogin ? 'Create an account' : 'Log in'} <ArrowRight size={11} /></Link></div>
            <div className="auth-clerk-assurance"><KeyRound size={12} /><span>{isClerkConfigured ? 'Authentication and session security powered by Clerk.' : 'Clerk-ready · add your publishable key to activate authentication.'}</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
