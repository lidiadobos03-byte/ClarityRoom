import React, { useCallback, useEffect, useState } from 'react';
import { api, authStore } from './api.js';

const categories = ['Work pressure', 'Burnout', 'Career transition', 'Leadership', 'Other'];

function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value.replace(' ', 'T')}Z`));
}

function Icon({ name }) {
  const paths = {
    arrow: <><path d="M5 12h14M14 6l6 6-6 6" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    spark: <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 2.7-7 6-7s6 3 6 7M16 4.5a3 3 0 0 1 0 6M17 13c2.4.7 4 3.4 4 7" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /></>,
    logout: <><path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5M14 8l4 4-4 4M18 12H8" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function Status({ value }) {
  const labels = {
    open: 'Open for guides',
    matched: 'Guide selected',
    interested: 'Interested',
    selected: 'Selected',
    not_selected: 'Closed',
    scheduled: 'Scheduled',
  };
  return <span className={`status status-${value}`}>{labels[value] || value}</span>;
}

function AuthPanel({ role, setRole, onAuthenticated }) {
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({ email: '', password: '', alias: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = mode === 'register' ? { ...form, role } : { email: form.email, password: form.password };
      const data = await api(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify(body) });
      authStore.set(data.token);
      onAuthenticated(data.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-copy">
        <p className="kicker">Founding preview</p>
        <h2>A thoughtful space,<br />ready when you are.</h2>
        <p>Join the private preview and explore the complete matching experience. No payment details needed.</p>
        <div className="welcome-credit"><Icon name="spark" /><span><strong>30 welcome credits</strong><small>Automatically added to your account</small></span></div>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-tabs">
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button>
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
        </div>
        {mode === 'register' && (
          <>
            <div className="account-type">
              <button type="button" className={role === 'client' ? 'active' : ''} onClick={() => setRole('client')}>
                <span>Client</span><small>I need a private conversation</small>
              </button>
              <button type="button" className={role === 'guide' ? 'active' : ''} onClick={() => setRole('guide')}>
                <span>Guide</span><small>I offer thoughtful support</small>
              </button>
            </div>
            <label>Public alias<input required minLength="2" maxLength="40" placeholder="e.g. Quiet Oak" value={form.alias} onChange={event => setForm({ ...form, alias: event.target.value })} /></label>
          </>
        )}
        <label>Email address<input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
        <label>Password<input required type="password" minLength="10" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder="At least 10 characters" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button-dark wide" disabled={busy}>
          {busy ? 'One moment…' : mode === 'register' ? 'Enter ClarityRoom' : 'Welcome back'} <Icon name="arrow" />
        </button>
        <p className="form-note">By continuing, you agree to respectful, strictly platonic use of the platform.</p>
      </form>
    </div>
  );
}

function Landing({ onAuthenticated }) {
  const [role, setRole] = useState('client');
  return (
    <main className="landing">
      <nav className="marketing-nav shell">
        <a className="brand" href="#top">Clarity<span>Room</span></a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#principles">Our principles</a>
          <a className="nav-cta" href="#join">Join preview</a>
        </div>
      </nav>

      <header id="top" className="hero shell">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <p className="kicker">Private listening for UK professionals</p>
        <h1>A quieter place<br />for a <em>louder mind.</em></h1>
        <p className="hero-lead">Step outside the corporate noise. Speak freely with a carefully vetted guide who listens without judgement, agenda or office politics.</p>
        <div className="hero-actions">
          <a className="button button-dark" href="#join">Find your space <Icon name="arrow" /></a>
          <a className="text-link" href="#how">See how it works</a>
        </div>
        <div className="hero-proof">
          <div className="avatar-stack"><span>AL</span><span>MK</span><span>SR</span></div>
          <p><strong>Private by design</strong><br />Your guide sees an alias, never your employer.</p>
        </div>
      </header>

      <section className="marquee">
        <div className="shell">
          <span><Icon name="lock" /> Pseudonymous</span>
          <span><Icon name="people" /> Vetted guides</span>
          <span><Icon name="chat" /> Strictly platonic</span>
          <span><Icon name="spark" /> Non-clinical</span>
        </div>
      </section>

      <section id="how" className="section shell how-section">
        <div className="split-heading">
          <div><p className="kicker">How it works</p><h2>Less friction.<br />More clarity.</h2></div>
          <p>ClarityRoom is designed to feel calm from the first click. No oversharing, no complicated intake, no corporate trail.</p>
        </div>
        <div className="steps">
          <article><span className="step-number">01</span><div className="step-icon"><Icon name="lock" /></div><h3>Choose an alias</h3><p>Create a private profile that keeps your professional identity outside the room.</p></article>
          <article><span className="step-number">02</span><div className="step-icon"><Icon name="chat" /></div><h3>Share what you need</h3><p>Post a brief, discreet request and tell guides when you would like to talk.</p></article>
          <article><span className="step-number">03</span><div className="step-icon"><Icon name="people" /></div><h3>Choose your guide</h3><p>Review thoughtful introductions and select the person who feels right for you.</p></article>
          <article><span className="step-number">04</span><div className="step-icon"><Icon name="calendar" /></div><h3>Enter the room</h3><p>Your private session is organised in one clear place, without workplace noise.</p></article>
        </div>
      </section>

      <section id="principles" className="principles">
        <div className="shell principles-grid">
          <div className="principles-quote">
            <p className="kicker light">Our point of view</p>
            <blockquote>“Sometimes you do not need advice. You need enough quiet to hear yourself think.”</blockquote>
          </div>
          <div className="principle-list">
            <div><span>01</span><h3>Human, not clinical</h3><p>Active listening and grounded perspective, without diagnosis or therapy.</p></div>
            <div><span>02</span><h3>Private, not invisible</h3><p>Clear pseudonymity, responsible safety boundaries and honest language.</p></div>
            <div><span>03</span><h3>Premium, not performative</h3><p>A considered experience where calm is built into every detail.</p></div>
          </div>
        </div>
      </section>

      <section id="join" className="section shell">
        <AuthPanel role={role} setRole={setRole} onAuthenticated={onAuthenticated} />
      </section>

      <section className="section reviews-section">
        <div className="shell">
          <div className="reviews-heading">
            <div>
              <p className="kicker">Inside the room</p>
              <h2>What clarity can<br /><em>feel like.</em></h2>
            </div>
            <p>Sample feedback for the founding preview. These will be replaced with verified member reviews as the community grows.</p>
          </div>
          <div className="reviews-grid">
            <article className="review-card">
              <div className="review-mark">“</div>
              <blockquote>I did not need another productivity framework. I needed one thoughtful person who could sit with the mess and help me hear what I already knew.</blockquote>
              <div className="review-author">
                <span>EM</span>
                <div><strong>Executive Manager</strong><small>Financial services, London</small></div>
              </div>
            </article>
            <article className="review-card featured-review">
              <div className="review-mark">“</div>
              <blockquote>The alias made it easier to be honest. There was no performance, no office language, just a calm conversation at exactly the right moment.</blockquote>
              <div className="review-author">
                <span>PD</span>
                <div><strong>Product Director</strong><small>Technology, Manchester</small></div>
              </div>
            </article>
            <article className="review-card">
              <div className="review-mark">“</div>
              <blockquote>As a guide, I appreciate the boundaries. The platform makes it clear that good listening is valuable without pretending it is clinical therapy.</blockquote>
              <div className="review-author">
                <span>HG</span>
                <div><strong>HR Guide</strong><small>People and culture specialist</small></div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer><div className="shell"><a className="brand" href="#top">Clarity<span>Room</span></a><p>Private, platonic, non-clinical listening.</p><p>© {new Date().getFullYear()} ClarityRoom UK</p></div></footer>
    </main>
  );
}

function Sidebar({ user, active, setActive, logout, unreadCount, openNotifications }) {
  return (
    <aside className="sidebar">
      <a className="brand dashboard-brand" href="#">Clarity<span>Room</span></a>
      <nav>
        <button className={active === 'home' ? 'active' : ''} onClick={() => setActive('home')}><Icon name="home" /> Overview</button>
        <button className={active === 'requests' ? 'active' : ''} onClick={() => setActive('requests')}><Icon name="chat" /> {user.role === 'client' ? 'My requests' : 'Opportunity room'}</button>
        <button className={active === 'sessions' ? 'active' : ''} onClick={() => setActive('sessions')}><Icon name="calendar" /> Sessions</button>
        <button className={active === 'credits' ? 'active' : ''} onClick={() => setActive('credits')}><Icon name="card" /> Credits</button>
        <button onClick={openNotifications}><span className="nav-icon-wrap"><Icon name="bell" />{unreadCount > 0 && <b>{unreadCount > 9 ? '9+' : unreadCount}</b>}</span> Notifications</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="mini-profile"><span>{user.alias.slice(0, 2).toUpperCase()}</span><div><strong>{user.alias}</strong><small>{user.role}</small></div></div>
        <button className="logout" onClick={logout}><Icon name="logout" /> Sign out</button>
      </div>
    </aside>
  );
}

function RequestForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ category: 'Work pressure', topic: '', summary: '', preferredTime: '', durationMinutes: 50 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/requests', { method: 'POST', body: JSON.stringify(form) });
      onCreated();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="request-form" onSubmit={submit}>
      <div className="form-head"><div><p className="kicker">New private request</p><h2>What would feel useful?</h2></div><button type="button" className="close-button" onClick={onCancel}>×</button></div>
      <p className="form-intro">Share only what feels comfortable. Guides see your alias and this brief, never your email or employer.</p>
      <label>Conversation area<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
      <label>A short title<input required minLength="3" maxLength="80" placeholder="e.g. I need perspective before a difficult meeting" value={form.topic} onChange={event => setForm({ ...form, topic: event.target.value })} /></label>
      <label>Private brief<textarea required minLength="20" maxLength="800" rows="5" placeholder="Give your future guide enough context to understand what kind of conversation would help…" value={form.summary} onChange={event => setForm({ ...form, summary: event.target.value })} /><small>{form.summary.length}/800</small></label>
      <div className="form-row">
        <label>Preferred time<input required placeholder="e.g. Thursday after 18:00" value={form.preferredTime} onChange={event => setForm({ ...form, preferredTime: event.target.value })} /></label>
        <label>Session length<select value={form.durationMinutes} onChange={event => setForm({ ...form, durationMinutes: Number(event.target.value) })}><option value="30">30 minutes</option><option value="50">50 minutes</option><option value="75">75 minutes</option></select></label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions"><button type="button" className="button button-ghost" onClick={onCancel}>Not now</button><button className="button button-dark" disabled={busy}>{busy ? 'Publishing…' : 'Publish privately'} <Icon name="arrow" /></button></div>
    </form>
  );
}

function ClientDashboard({ user, refreshUser, active, onMessagesRead }) {
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const [requestData, sessionData] = await Promise.all([api('/api/client/requests'), api('/api/sessions')]);
    setRequests(requestData.requests);
    setSessions(sessionData.sessions);
  }, []);

  useEffect(() => { load().catch(error => setNotice(error.message)); }, [load]);

  async function selectGuide(requestId, unlockId) {
    try {
      await api(`/api/requests/${requestId}/select-guide`, { method: 'POST', body: JSON.stringify({ unlockId }) });
      setNotice('Your guide is selected. The session is now in your diary.');
      await load();
    } catch (error) {
      setNotice(error.message);
    }
  }

  const pages = {
    home: (
      <>
        <div className="dashboard-hero">
          <div><p className="kicker">Good to see you, {user.alias}</p><h1>What needs a little<br /><em>room today?</em></h1><p>Your private space is ready whenever the noise gets too loud.</p></div>
          <button className="button button-cream" onClick={() => setShowForm(true)}><Icon name="plus" /> Start a new request</button>
        </div>
        <div className="stat-grid">
          <article><span className="stat-icon"><Icon name="spark" /></span><small>Available balance</small><strong>{user.balance}</strong><p>clarity credits</p></article>
          <article><span className="stat-icon"><Icon name="chat" /></span><small>Open conversations</small><strong>{requests.filter(item => item.status === 'open').length}</strong><p>{requests.reduce((sum, item) => sum + item.interest_count, 0)} guide introductions</p></article>
          <article><span className="stat-icon"><Icon name="calendar" /></span><small>Upcoming sessions</small><strong>{sessions.length}</strong><p>{sessions[0]?.scheduled_for || 'Nothing scheduled yet'}</p></article>
        </div>
        <div className="content-section">
          <div className="content-head"><div><p className="kicker">Recent activity</p><h2>Your private requests</h2></div>{requests.length > 0 && <button className="text-button" onClick={() => setShowForm(true)}>Create another <Icon name="arrow" /></button>}</div>
          {requests.length === 0 ? <EmptyState icon="chat" title="A clear page, for now" text="When you need to talk something through, your first private request starts here." action={() => setShowForm(true)} actionLabel="Create first request" /> : <RequestList requests={requests.slice(0, 3)} onSelect={selectGuide} />}
        </div>
        {showForm && <div className="modal-backdrop"><div className="modal"><RequestForm onCancel={() => setShowForm(false)} onCreated={async () => { setShowForm(false); setNotice('Your request is now open to vetted guides.'); await load(); await refreshUser(); }} /></div></div>}
        {notice && <Toast text={notice} close={() => setNotice('')} />}
      </>
    ),
    requests: (
      <div className="page-section">
        <div className="page-title"><div><p className="kicker">My requests</p><h1>Conversations,<br /><em>on your terms.</em></h1></div><button className="button button-dark" onClick={() => setShowForm(true)}><Icon name="plus" /> New request</button></div>
        {requests.length ? <RequestList requests={requests} onSelect={selectGuide} /> : <EmptyState icon="chat" title="No requests yet" text="Create a private brief when you are ready." action={() => setShowForm(true)} actionLabel="Create request" />}
        {showForm && <div className="modal-backdrop"><div className="modal"><RequestForm onCancel={() => setShowForm(false)} onCreated={async () => { setShowForm(false); await load(); }} /></div></div>}
        {notice && <Toast text={notice} close={() => setNotice('')} />}
      </div>
    ),
    sessions: <SessionsPage sessions={sessions} user={user} onMessagesRead={onMessagesRead} />,
    credits: <CreditsPage user={user} refreshUser={refreshUser} />,
  };
  return pages[active];
}

function RequestList({ requests, onSelect }) {
  return <div className="request-list">{requests.map(request => (
    <article className="request-card" key={request.id}>
      <div className="request-main">
        <div className="request-meta"><span>{request.category}</span><span>•</span><span>{request.duration_minutes} min</span><span>•</span><span>{formatDate(request.created_at)}</span></div>
        <h3>{request.topic}</h3>
        <p>{request.summary}</p>
        <div className="request-footer"><Status value={request.status} /><span><Icon name="clock" /> {request.preferred_time}</span></div>
      </div>
      <div className="interest-panel">
        <p className="kicker">{request.interest_count} {request.interest_count === 1 ? 'introduction' : 'introductions'}</p>
        {request.interests.length === 0 && <p className="muted">Your brief is quietly waiting for the right guide.</p>}
        {request.interests.map(interest => (
          <div className="interest" key={interest.id}>
            <div className="guide-avatar">{interest.guide_alias.slice(0, 2).toUpperCase()}</div>
            <div><strong>{interest.guide_alias}</strong><p>{interest.message}</p><Status value={interest.status} /></div>
            {request.status === 'open' && <button className="select-guide" onClick={() => onSelect(request.id, interest.id)}><Icon name="check" /> Choose</button>}
          </div>
        ))}
      </div>
    </article>
  ))}</div>;
}

function GuideDashboard({ user, refreshUser, active, onMessagesRead }) {
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [unlocking, setUnlocking] = useState(null);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const [requestData, sessionData] = await Promise.all([api('/api/requests'), api('/api/sessions')]);
    setRequests(requestData.requests);
    setSessions(sessionData.sessions);
  }, []);
  useEffect(() => { load().catch(error => setNotice(error.message)); }, [load]);

  async function unlock(request) {
    try {
      await api(`/api/requests/${request.id}/unlock`, { method: 'POST', body: JSON.stringify({ message }) });
      setUnlocking(null);
      setMessage('');
      setNotice('Introduction sent privately. Five guide credits were used.');
      await Promise.all([load(), refreshUser()]);
    } catch (error) {
      setNotice(error.message);
    }
  }

  const available = requests.filter(item => item.status === 'open' && !item.unlocked);
  const introduced = requests.filter(item => item.unlocked);
  const opportunityList = (
    <div className="opportunity-grid">
      {requests.map(request => (
        <article className={`opportunity-card ${request.unlocked ? 'unlocked' : ''}`} key={request.id}>
          <div className="opportunity-top"><span className="category-pill">{request.category}</span><Status value={request.status} /></div>
          <h3>{request.topic}</h3>
          <p>{request.summary}</p>
          <div className="opportunity-details"><span><Icon name="clock" /> {request.duration_minutes} minutes</span><span><Icon name="calendar" /> {request.preferred_time}</span></div>
          {request.unlocked ? <div className="unlocked-note"><Icon name="check" /> Introduction sent</div> : request.status === 'open' ? <button className="button button-dark wide" onClick={() => setUnlocking(request)}>View brief & introduce yourself <span>5 credits</span></button> : <div className="unlocked-note">This conversation has been matched</div>}
        </article>
      ))}
    </div>
  );

  const pages = {
    home: (
      <>
        <div className="dashboard-hero guide-hero">
          <div><p className="kicker">Guide studio</p><h1>Your attention is<br /><em>the offering.</em></h1><p>Find the conversations where your experience can genuinely help.</p></div>
          <div className="availability"><span className="pulse" /><div><strong>Available for matching</strong><small>Your profile is visible in the private room</small></div></div>
        </div>
        <div className="stat-grid">
          <article><span className="stat-icon"><Icon name="spark" /></span><small>Guide balance</small><strong>{user.balance}</strong><p>unlock credits</p></article>
          <article><span className="stat-icon"><Icon name="chat" /></span><small>Open opportunities</small><strong>{available.length}</strong><p>private briefs available</p></article>
          <article><span className="stat-icon"><Icon name="calendar" /></span><small>Selected sessions</small><strong>{sessions.length}</strong><p>{sessions[0]?.scheduled_for || 'No matches yet'}</p></article>
        </div>
        <div className="content-section"><div className="content-head"><div><p className="kicker">Opportunity room</p><h2>New conversations</h2></div><span className="soft-label">{introduced.length} introductions sent</span></div>{requests.length ? opportunityList : <EmptyState icon="spark" title="The room is quiet" text="New private requests will appear here as clients publish them." />}</div>
        {unlocking && <IntroductionModal request={unlocking} message={message} setMessage={setMessage} close={() => setUnlocking(null)} submit={() => unlock(unlocking)} />}
        {notice && <Toast text={notice} close={() => setNotice('')} />}
      </>
    ),
    requests: <div className="page-section"><div className="page-title"><div><p className="kicker">Opportunity room</p><h1>Listen where you<br /><em>can add value.</em></h1></div><span className="credit-chip"><Icon name="spark" /> {user.balance} credits</span></div>{requests.length ? opportunityList : <EmptyState icon="spark" title="No open requests yet" text="This space will update when a client asks for a conversation." />}{unlocking && <IntroductionModal request={unlocking} message={message} setMessage={setMessage} close={() => setUnlocking(null)} submit={() => unlock(unlocking)} />}{notice && <Toast text={notice} close={() => setNotice('')} />}</div>,
    sessions: <SessionsPage sessions={sessions} user={user} onMessagesRead={onMessagesRead} />,
    credits: <CreditsPage user={user} refreshUser={refreshUser} />,
  };
  return pages[active];
}

function formatMoney(pence) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
}

function CreditsPage({ user, refreshUser }) {
  const [packages, setPackages] = useState([]);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [busyPackage, setBusyPackage] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadBilling = useCallback(async () => {
    const [packageData, healthData] = await Promise.all([api('/api/packages'), api('/api/health')]);
    setPackages(packageData.packages[user.role] || []);
    setPaymentsEnabled(Boolean(healthData.paymentsEnabled));
  }, [user.role]);

  useEffect(() => {
    loadBilling().catch(requestError => setError(requestError.message));
    const params = new URLSearchParams(window.location.search);
    const checkoutState = params.get('checkout');
    const sessionId = params.get('session_id');
    if (checkoutState === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      if (sessionId) {
        api(`/api/checkout-sessions/${sessionId}/confirm`)
          .then(data => {
            setNotice(data.paid ? 'Payment confirmed. Your credits have been added.' : 'Payment is still being confirmed by Stripe.');
            if (data.user) refreshUser();
          })
          .catch(requestError => setNotice(requestError.message));
      } else {
        setNotice('Payment received. Credits will appear after Stripe confirms the checkout.');
        refreshUser();
      }
    }
    if (checkoutState === 'cancelled') {
      setNotice('Checkout was cancelled. No credits were purchased.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadBilling, refreshUser]);

  async function buyCredits(packageId) {
    setBusyPackage(packageId);
    setError('');
    setNotice('');
    try {
      const data = await api('/api/checkout-sessions', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ packageId }),
      });
      window.location.assign(data.url);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyPackage('');
    }
  }

  async function startGuideOnboarding() {
    setError('');
    setNotice('');
    try {
      const data = await api('/api/connect/onboarding', { method: 'POST' });
      window.location.assign(data.url);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="page-section">
      <div className="page-title">
        <div><p className="kicker">Credits & billing</p><h1>Keep your room<br /><em>ready.</em></h1></div>
        <span className="credit-chip"><Icon name="spark" /> {user.balance} credits</span>
      </div>
      <div className="billing-banner">
        <div>
          <p className="kicker">{paymentsEnabled ? 'Stripe active' : 'Preview mode'}</p>
          <h2>{paymentsEnabled ? 'Secure checkout is ready.' : 'Payments are not configured yet.'}</h2>
          <p>{paymentsEnabled ? 'Credit purchases open in Stripe Checkout. Your balance updates when the webhook confirms payment.' : 'Add Stripe test keys in .env and restart the server to enable real test checkouts.'}</p>
        </div>
        <span><Icon name={paymentsEnabled ? 'check' : 'lock'} /></span>
      </div>
      {error && <p className="form-error">{error}</p>}
      {notice && <Toast text={notice} close={() => setNotice('')} />}
      <div className="package-grid">
        {packages.map(item => (
          <article className="package-card" key={item.id}>
            <div className="package-top">
              <p className="kicker">{user.role === 'client' ? 'Client credits' : 'Guide credits'}</p>
              <strong>{formatMoney(item.pricePence)}</strong>
            </div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="package-credits"><Icon name="spark" /><span>{item.credits}</span><small>credits</small></div>
            <button className="button button-dark wide" disabled={!paymentsEnabled || busyPackage === item.id} onClick={() => buyCredits(item.id)}>
              {busyPackage === item.id ? 'Opening checkout…' : paymentsEnabled ? 'Buy with Stripe' : 'Stripe paused'} <Icon name="arrow" />
            </button>
          </article>
        ))}
      </div>
      {user.role === 'guide' && (
        <div className="connect-card">
          <div>
            <p className="kicker">Guide payouts</p>
            <h3>Prepare your payout profile</h3>
            <p>When paid sessions are activated, guides will need a Stripe-connected profile before receiving payouts.</p>
          </div>
          <button className="button button-ghost" disabled={!paymentsEnabled} onClick={startGuideOnboarding}>{user.stripeAccountId ? 'Continue setup' : 'Start setup'} <Icon name="arrow" /></button>
        </div>
      )}
    </div>
  );
}

function IntroductionModal({ request, message, setMessage, close, submit }) {
  return <div className="modal-backdrop"><div className="modal compact-modal"><div className="form-head"><div><p className="kicker">{request.category}</p><h2>Open this conversation</h2></div><button className="close-button" onClick={close}>×</button></div><div className="private-preview"><Icon name="lock" /><p>The full brief becomes available after your introduction is sent. This uses 5 guide credits.</p></div><label>Why might you be a good listener for this person?<textarea rows="5" minLength="10" maxLength="300" placeholder="A short, human introduction, not a sales pitch." value={message} onChange={event => setMessage(event.target.value)} /><small>{message.length}/300</small></label><div className="form-actions"><button className="button button-ghost" onClick={close}>Not this one</button><button className="button button-dark" disabled={message.trim().length < 10} onClick={submit}>Send introduction <Icon name="arrow" /></button></div></div></div>;
}

function SessionsPage({ sessions, user, onMessagesRead }) {
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <div className="page-section">
      <div className="page-title">
        <div><p className="kicker">Private diary</p><h1>Your upcoming<br /><em>sessions.</em></h1></div>
      </div>
      {sessions.length === 0
        ? <EmptyState icon="calendar" title="Nothing in the diary yet" text={user.role === 'client' ? 'A session appears here after you select a guide.' : 'A session appears here when a client selects your introduction.'} />
        : (
          <div className="session-list">
            {sessions.map(session => (
              <article key={session.id}>
                <div className="date-tile"><Icon name="calendar" /><span>{session.scheduled_for}</span></div>
                <div className="session-copy">
                  <Status value={session.status} />
                  <h3>{session.topic}</h3>
                  <p>{session.category} · {session.duration_minutes} minutes · with {user.role === 'client' ? session.guide_alias : session.client_alias}</p>
                </div>
                <button className="button button-ghost" onClick={() => setSelectedSession(session)}>Session details <Icon name="arrow" /></button>
              </article>
            ))}
          </div>
        )}
      {selectedSession && <SessionDetails session={selectedSession} user={user} close={() => setSelectedSession(null)} onMessagesRead={onMessagesRead} />}
    </div>
  );
}

function SessionDetails({ session, user, close, onMessagesRead }) {
  const otherPerson = user.role === 'client' ? session.guide_alias : session.client_alias;
  const [roomOpen, setRoomOpen] = useState(false);
  return (
    <div className="modal-backdrop">
      <div className={`modal session-modal ${roomOpen ? 'room-active' : ''}`}>
        <div className="session-modal-top">
          <div>
            <p className="kicker">{roomOpen ? 'Private conversation' : 'Private session'}</p>
            <Status value={session.status} />
          </div>
          <button className="close-button" onClick={close} aria-label="Close session details">×</button>
        </div>
        {roomOpen
          ? <ConversationRoom session={session} user={user} otherPerson={otherPerson} back={() => setRoomOpen(false)} onMessagesRead={onMessagesRead} />
          : (
            <>
              <h2>{session.topic}</h2>
              <p className="session-modal-intro">Everything you need for this conversation is kept together here.</p>
              <div className="session-detail-grid">
                <div><span><Icon name="people" /></span><small>{user.role === 'client' ? 'Your guide' : 'Client alias'}</small><strong>{otherPerson}</strong></div>
                <div><span><Icon name="calendar" /></span><small>Preferred time</small><strong>{session.scheduled_for}</strong></div>
                <div><span><Icon name="clock" /></span><small>Suggested duration</small><strong>{session.duration_minutes} minutes</strong></div>
                <div><span><Icon name="chat" /></span><small>Conversation area</small><strong>{session.category}</strong></div>
              </div>
              <div className="session-boundary">
                <Icon name="lock" />
                <p>This is a private, strictly platonic and non-clinical written conversation. Only you and {otherPerson} can read the messages in this room.</p>
              </div>
              <div className="form-actions">
                <button className="button button-ghost" onClick={close}>Close</button>
                <button className="button button-dark" onClick={() => setRoomOpen(true)}>Open private room <Icon name="arrow" /></button>
              </div>
            </>
          )}
      </div>
    </div>
  );
}

function ConversationRoom({ session, user, otherPerson, back, onMessagesRead }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    try {
      const data = await api(`/api/sessions/${session.id}/messages`);
      setMessages(data.messages);
      setError('');
      onMessagesRead?.();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [session.id, onMessagesRead]);

  useEffect(() => {
    loadMessages();
    const timer = window.setInterval(loadMessages, 5000);
    return () => window.clearInterval(timer);
  }, [loadMessages]);

  async function send(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      const data = await api(`/api/sessions/${session.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: draft }),
      });
      setMessages(current => [...current, data.message]);
      setDraft('');
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="conversation-room">
      <div className="conversation-heading">
        <button className="back-button" onClick={back}>‹ Details</button>
        <div><h2>{session.topic}</h2><p>Writing privately with {otherPerson}</p></div>
      </div>
      <div className="message-thread">
        {loading && <p className="room-placeholder">Opening the room…</p>}
        {!loading && messages.length === 0 && (
          <div className="room-empty">
            <span><Icon name="chat" /></span>
            <h3>The room is open</h3>
            <p>Begin gently. A simple hello is enough.</p>
          </div>
        )}
        {messages.map(message => {
          const own = message.sender_id === user.id;
          return (
            <div className={`message-row ${own ? 'own-message' : ''}`} key={message.id}>
              {!own && <div className="message-avatar">{message.sender_alias.slice(0, 2).toUpperCase()}</div>}
              <div className="message-content">
                <div className="message-meta"><strong>{own ? 'You' : message.sender_alias}</strong><span>{message.created_at.slice(11, 16)}</span></div>
                <p>{message.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="form-error">{error}</p>}
      <form className="message-composer" onSubmit={send}>
        <textarea rows="2" maxLength="2000" placeholder={`Write privately to ${otherPerson}…`} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }} />
        <button className="button button-dark" disabled={sending || !draft.trim()}>{sending ? 'Sending…' : 'Send'} <Icon name="arrow" /></button>
      </form>
      <p className="room-note"><Icon name="lock" /> Private room, visible only to the matched client and guide.</p>
    </div>
  );
}

function EmptyState({ icon, title, text, action, actionLabel }) {
  return <div className="empty-state"><span><Icon name={icon} /></span><h3>{title}</h3><p>{text}</p>{action && <button className="button button-dark" onClick={action}>{actionLabel} <Icon name="arrow" /></button>}</div>;
}

function Toast({ text, close }) {
  return <div className="toast" role="status"><Icon name="check" /><span>{text}</span><button onClick={close}>×</button></div>;
}

function NotificationPanel({ data, close, viewSessions }) {
  return (
    <div className="notification-backdrop" onClick={close}>
      <aside className="notification-panel" onClick={event => event.stopPropagation()}>
        <div className="notification-head">
          <div><p className="kicker">Private updates</p><h2>Notifications</h2></div>
          <button className="close-button" onClick={close}>×</button>
        </div>
        {data.notifications.length === 0
          ? <div className="notification-empty"><span><Icon name="bell" /></span><h3>All quiet for now</h3><p>New private messages will appear here.</p></div>
          : (
            <div className="notification-list">
              {data.notifications.map(item => (
                <button key={item.session_id} onClick={viewSessions}>
                  <span className="notification-avatar">{item.sender_alias.slice(0, 2).toUpperCase()}</span>
                  <span className="notification-copy"><strong>{item.sender_alias}</strong><small>{item.topic}</small><p>{item.latest_message}</p></span>
                  <b>{item.unread_count}</b>
                </button>
              ))}
            </div>
          )}
        <p className="notification-note"><Icon name="lock" /> Message previews are visible only inside your account.</p>
      </aside>
    </div>
  );
}

function Dashboard({ user, setUser, logout }) {
  const [active, setActive] = useState('home');
  const [notifications, setNotifications] = useState({ unreadCount: 0, notifications: [] });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const refreshUser = useCallback(async () => {
    const data = await api('/api/me');
    setUser(data.user);
  }, [setUser]);
  const refreshNotifications = useCallback(async () => {
    try {
      setNotifications(await api('/api/notifications'));
    } catch {
      // The next authenticated request will handle an expired session.
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
    const timer = window.setInterval(refreshNotifications, 5000);
    return () => window.clearInterval(timer);
  }, [refreshNotifications]);

  function viewSessions() {
    setNotificationsOpen(false);
    setActive('sessions');
  }

  return (
    <main className="dashboard">
      <Sidebar user={user} active={active} setActive={setActive} logout={logout} unreadCount={notifications.unreadCount} openNotifications={() => setNotificationsOpen(true)} />
      <section className="dashboard-main">
        <header className="mobile-dashboard-nav">
          <a className="brand" href="#">Clarity<span>Room</span></a>
          <div>
            <button className="mobile-bell" onClick={() => setNotificationsOpen(true)}><Icon name="bell" />{notifications.unreadCount > 0 && <b>{notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}</b>}</button>
            <button onClick={logout}><Icon name="logout" /></button>
          </div>
        </header>
        {user.role === 'client'
          ? <ClientDashboard user={user} refreshUser={refreshUser} active={active} onMessagesRead={refreshNotifications} />
          : <GuideDashboard user={user} refreshUser={refreshUser} active={active} onMessagesRead={refreshNotifications} />}
      </section>
      {notificationsOpen && <NotificationPanel data={notifications} close={() => setNotificationsOpen(false)} viewSessions={viewSessions} />}
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(authStore.get()));

  useEffect(() => {
    if (!authStore.get()) return;
    api('/api/me').then(data => setUser(data.user)).catch(() => authStore.clear()).finally(() => setLoading(false));
  }, []);

  function logout() {
    authStore.clear();
    setUser(null);
  }

  if (loading) return <div className="loading-screen"><span className="brand">Clarity<span>Room</span></span><i /></div>;
  return user ? <Dashboard user={user} setUser={setUser} logout={logout} /> : <Landing onAuthenticated={setUser} />;
}
