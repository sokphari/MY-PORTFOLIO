import { useEffect, useState } from 'react';
import {
  ArrowUpRight, BriefcaseBusiness, ContactRound, GraduationCap, LayoutDashboard, Moon, Sun,
  LogOut, Plus, Save, UserRound, Wrench, FolderKanban, Trash2,
} from 'lucide-react';
import { portfolio as fallbackPortfolio } from './data/portfolio';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import './admin.css';

const adminUserId = import.meta.env.VITE_SUPABASE_ADMIN_USER_ID?.trim();
const modules = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', Icon: UserRound },
  { id: 'contact', label: 'Contact & links', Icon: ContactRound },
  { id: 'skills', label: 'Skills', Icon: Wrench },
  { id: 'projects', label: 'Projects', Icon: FolderKanban },
  { id: 'education', label: 'Education', Icon: GraduationCap },
  { id: 'experience', label: 'Experience', Icon: BriefcaseBusiness },
];

const splitItems = value => value.split(',').map(item => item.trim()).filter(Boolean);
const clone = value => JSON.parse(JSON.stringify(value));

function Field({ label, value, onChange, multiline = false, type = 'text', hint }) {
  return (
    <label className={`admin-field${multiline ? ' is-wide' : ''}`}>
      <span>{label}</span>
      {multiline ? (
        <textarea rows={4} value={value ?? ''} onChange={event => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value ?? ''} onChange={event => onChange(event.target.value)} />
      )}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function AdminDashboard() {
  const [theme, setTheme] = useState('light');
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [draft, setDraft] = useState(() => clone(fallbackPortfolio));
  const [savedDraft, setSavedDraft] = useState(null);
  const [activeModule, setActiveModule] = useState('overview');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setErrorMessage(error.message);
      setSession(data?.session ?? null);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setErrorMessage('');
      setMessage('');
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = Boolean(session?.user?.id && adminUserId && session.user.id === adminUserId);
  const isDirty = Boolean(savedDraft && JSON.stringify(draft) !== JSON.stringify(savedDraft));

  useEffect(() => {
    if (!isAdmin || !supabase) return undefined;
    let active = true;
    setBusy(true);
    supabase.from('portfolio_content').select('content').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setErrorMessage(error.message);
        else if (data?.content) {
          const loaded = { ...fallbackPortfolio, ...data.content };
          setDraft(clone(loaded));
          setSavedDraft(clone(loaded));
        } else setErrorMessage('Portfolio row not found. Run the migration and seed SQL first.');
        setBusy(false);
      });
    return () => { active = false; };
  }, [isAdmin]);

  function updateField(key, value) {
    setDraft(previous => ({ ...previous, [key]: value }));
    setMessage('');
  }

  function updateNestedField(parent, key, value) {
    setDraft(previous => ({ ...previous, [parent]: { ...previous[parent], [key]: value } }));
    setMessage('');
  }

  function updateArrayItem(listKey, index, key, value) {
    setDraft(previous => ({
      ...previous,
      [listKey]: previous[listKey].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }));
    setMessage('');
  }

  function addArrayItem(listKey, item) {
    setDraft(previous => ({ ...previous, [listKey]: [...(previous[listKey] || []), item] }));
    setMessage('');
  }

  function removeArrayItem(listKey, index) {
    setDraft(previous => ({ ...previous, [listKey]: previous[listKey].filter((_, itemIndex) => itemIndex !== index) }));
    setMessage('');
  }

  async function signIn(event) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErrorMessage(error.message);
    else setPassword('');
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) setErrorMessage(error.message);
  }

  async function saveChanges() {
    if (!supabase || !isAdmin) return;
    setBusy(true);
    setErrorMessage('');
    setMessage('');
    const { data, error } = await supabase.from('portfolio_content')
      .update({ content: draft, updated_at: new Date().toISOString() })
      .eq('id', 1).select('id').maybeSingle();
    setBusy(false);
    if (error) setErrorMessage(error.message);
    else if (!data) setErrorMessage('Nothing was saved. Confirm the admin UUID in .env.local and the database policy match.');
    else {
      setSavedDraft(clone(draft));
      setMessage('Changes saved successfully.');
    }
  }

  function renderModule() {
    if (activeModule === 'overview') {
      const quickLinks = ['profile', 'projects', 'skills'];
      return (
        <>
          <div className="admin-welcome">
            <div><span className="admin-eyebrow">YOUR PORTFOLIO</span><h2>Good to see you, {draft.name || 'there'}.</h2>
              <p>Manage the content visitors see on your portfolio.</p></div>
            <span className="admin-status"><i /> Portfolio connected</span>
          </div>
          <div className="admin-stat-grid">
            <article className="admin-stat"><span>Projects</span><strong>{draft.projects?.length || 0}</strong><small>Portfolio showcases</small></article>
            <article className="admin-stat"><span>Skill groups</span><strong>{draft.stack?.length || 0}</strong><small>Areas of expertise</small></article>
            <article className="admin-stat"><span>Experience</span><strong>{draft.experiences?.length || 0}</strong><small>Career entries</small></article>
          </div>
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h3>Quick updates</h3><p>Jump into a module to update your content.</p></div></div>
            <div className="admin-quick-grid">
              {quickLinks.map(id => {
                const item = modules.find(module => module.id === id);
                return <button className="admin-quick-card" key={id} onClick={() => setActiveModule(id)}>
                  <item.Icon size={20} /><span>{item.label}</span><ArrowUpRight size={17} />
                </button>;
              })}
            </div>
          </section>
          <section className="admin-panel admin-preview-panel">
            <div><span className="admin-eyebrow">PUBLIC PROFILE</span><h3>{draft.name}</h3><p>{draft.title} · {draft.location}</p></div>
            <a href="/" target="_blank" rel="noreferrer">Preview site <ArrowUpRight size={16} /></a>
          </section>
        </>
      );
    }

    if (activeModule === 'profile') return (
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h3>Profile details</h3><p>These details appear across your homepage and about section.</p></div></div>
        <div className="admin-form-grid">
          <Field label="Full name" value={draft.name} onChange={value => updateField('name', value)} />
          <Field label="Initials" value={draft.initials} onChange={value => updateField('initials', value)} />
          <Field label="Professional title" value={draft.title} onChange={value => updateField('title', value)} />
          <Field label="Role description" value={draft.role} onChange={value => updateField('role', value)} />
          <Field label="Availability" value={draft.availability} onChange={value => updateField('availability', value)} />
          <Field label="Location" value={draft.location} onChange={value => updateField('location', value)} />
          <Field label="University" value={draft.university} onChange={value => updateField('university', value)} />
          <Field label="Portrait image path or URL" value={draft.profileImage || '/profile.png'} onChange={value => updateField('profileImage', value)} />
          <Field label="Introduction" value={draft.intro} multiline onChange={value => updateField('intro', value)} />
          <Field label="About me" value={draft.about} multiline onChange={value => updateField('about', value)} />
        </div>
      </section>
    );

    if (activeModule === 'contact') return (
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h3>Contact & social links</h3><p>Choose the contact information and profiles shown to visitors.</p></div></div>
        <div className="admin-form-grid">
          <Field label="Email address" type="email" value={draft.email} onChange={value => updateField('email', value)} />
          <Field label="Phone number" value={draft.phone} onChange={value => updateField('phone', value)} />
          <Field label="GitHub URL" value={draft.github} onChange={value => updateField('github', value)} />
          <Field label="Telegram URL" value={draft.telegram} onChange={value => updateField('telegram', value)} />
          <Field label="Facebook URL" value={draft.facebook} onChange={value => updateField('facebook', value)} />
          <Field label="LinkedIn URL" value={draft.linkedin} onChange={value => updateField('linkedin', value)} />
          <Field label="CV URL" value={draft.cvUrl} onChange={value => updateField('cvUrl', value)} hint="Use a public link or a file path in the site’s public folder." />
        </div>
      </section>
    );

    if (activeModule === 'skills') return (
      <div className="admin-module-stack">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><h3>Skills & tools</h3><p>Edit each group and separate skills with commas.</p></div>
            <button className="admin-outline-button" onClick={() => addArrayItem('stack', { category: 'New skill group', items: [] })}><Plus size={17} /> Add group</button></div>
          <div className="admin-repeat-list">
            {(draft.stack || []).map((group, index) => <article className="admin-repeat-card" key={`skill-${index}`}>
              <div className="admin-repeat-heading"><strong>Group {index + 1}</strong><button className="admin-icon-action danger" aria-label="Remove skill group" onClick={() => removeArrayItem('stack', index)}><Trash2 size={17} /></button></div>
              <div className="admin-form-grid">
                <Field label="Group name" value={group.category} onChange={value => updateArrayItem('stack', index, 'category', value)} />
                <Field label="Skills (comma separated)" value={(group.items || []).join(', ')} onChange={value => updateArrayItem('stack', index, 'items', splitItems(value))} />
              </div>
            </article>)}
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><h3>Languages</h3><p>Language proficiency shown on your portfolio.</p></div></div>
          <Field label="Languages (comma separated)" value={(draft.languages || []).join(', ')} onChange={value => updateField('languages', splitItems(value))} />
        </section>
      </div>
    );

    if (activeModule === 'projects') return (
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h3>Projects</h3><p>Showcase your work, technologies, and repository or demo links.</p></div>
          <button className="admin-outline-button" onClick={() => addArrayItem('projects', { id: `project-${Date.now()}`, title: 'New project', category: 'Backend', label: 'PROJECT', description: '', technologies: [], demo: '', github: '', appearance: 'commerce' })}><Plus size={17} /> Add project</button></div>
        <div className="admin-repeat-list">
          {(draft.projects || []).map((project, index) => <article className="admin-repeat-card" key={project.id || index}>
            <div className="admin-repeat-heading"><strong>{project.title || `Project ${index + 1}`}</strong><button className="admin-icon-action danger" aria-label="Remove project" onClick={() => removeArrayItem('projects', index)}><Trash2 size={17} /></button></div>
            <div className="admin-form-grid">
              <Field label="Project title" value={project.title} onChange={value => updateArrayItem('projects', index, 'title', value)} />
              <Field label="Category" value={project.category} onChange={value => updateArrayItem('projects', index, 'category', value)} />
              <Field label="Project ID" value={project.id} onChange={value => updateArrayItem('projects', index, 'id', value)} />
              <Field label="Card style" value={project.appearance} onChange={value => updateArrayItem('projects', index, 'appearance', value)} hint="Use commerce, attendance, or ide." />
              <Field label="Description" value={project.description} multiline onChange={value => updateArrayItem('projects', index, 'description', value)} />
              <Field label="Technologies (comma separated)" value={(project.technologies || []).join(', ')} onChange={value => updateArrayItem('projects', index, 'technologies', splitItems(value))} />
              <Field label="Live demo URL" value={project.demo} onChange={value => updateArrayItem('projects', index, 'demo', value)} />
              <Field label="Source code URL" value={project.github} onChange={value => updateArrayItem('projects', index, 'github', value)} />
              <Field label="Project label" value={project.label} onChange={value => updateArrayItem('projects', index, 'label', value)} />
            </div>
          </article>)}
        </div>
      </section>
    );

    if (activeModule === 'education') return (
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h3>Education</h3><p>Update your degree, institution, and academic status.</p></div></div>
        <div className="admin-form-grid">
          <Field label="Degree" value={draft.education?.degree} onChange={value => updateNestedField('education', 'degree', value)} />
          <Field label="School" value={draft.education?.school} onChange={value => updateNestedField('education', 'school', value)} />
          <Field label="Status" value={draft.education?.status} onChange={value => updateNestedField('education', 'status', value)} />
          <Field label="Heading label" value={draft.education?.label} onChange={value => updateNestedField('education', 'label', value)} />
          <Field label="Description" value={draft.education?.description} multiline onChange={value => updateNestedField('education', 'description', value)} />
          <Field label="Areas of study (comma separated)" value={(draft.education?.areas || []).join(', ')} onChange={value => updateNestedField('education', 'areas', splitItems(value))} />
        </div>
      </section>
    );

    if (activeModule === 'experience') return (
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h3>Experience</h3><p>Add and edit your professional history.</p></div>
          <button className="admin-outline-button" onClick={() => addArrayItem('experiences', { label: 'PROFESSIONAL EXPERIENCE', title: 'New role', organization: '', period: '', description: '', tags: [] })}><Plus size={17} /> Add experience</button></div>
        <div className="admin-repeat-list">
          {(draft.experiences || []).map((item, index) => <article className="admin-repeat-card" key={`${item.title}-${index}`}>
            <div className="admin-repeat-heading"><strong>{item.title || `Experience ${index + 1}`}</strong><button className="admin-icon-action danger" aria-label="Remove experience" onClick={() => removeArrayItem('experiences', index)}><Trash2 size={17} /></button></div>
            <div className="admin-form-grid">
              <Field label="Role title" value={item.title} onChange={value => updateArrayItem('experiences', index, 'title', value)} />
              <Field label="Organization" value={item.organization} onChange={value => updateArrayItem('experiences', index, 'organization', value)} />
              <Field label="Period" value={item.period} onChange={value => updateArrayItem('experiences', index, 'period', value)} />
              <Field label="Card label" value={item.label} onChange={value => updateArrayItem('experiences', index, 'label', value)} />
              <Field label="Description" value={item.description} multiline onChange={value => updateArrayItem('experiences', index, 'description', value)} />
              <Field label="Skills (comma separated)" value={(item.tags || []).join(', ')} onChange={value => updateArrayItem('experiences', index, 'tags', splitItems(value))} />
            </div>
          </article>)}
        </div>
      </section>
    );
    return null;
  }

  if (!isSupabaseConfigured) return (
    <main className="admin-gate"><section className="admin-login-card"><h1>Connect Supabase</h1><p>Add the project URL and publishable key to <code>.env.local</code>, then restart the dev server.</p></section></main>
  );
  if (!authReady) return <main className="admin-gate"><section className="admin-login-card"><p>Checking your session…</p></section></main>;
  if (!session) return (
    <main className="admin-gate"><section className="admin-login-card">
      <a className="admin-login-brand" href="/">Nat Sokphary <span>PORTFOLIO ADMIN</span></a>
      <p className="admin-eyebrow">SIGN IN</p><h1>Welcome back</h1><p>Sign in to manage your portfolio content.</p>
      <form className="admin-login-form" onSubmit={signIn}>
        <Field label="Email address" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
    </section></main>
  );
  if (!isAdmin) return (
    <main className="admin-gate"><section className="admin-login-card"><p className="admin-eyebrow">ACCESS RESTRICTED</p><h1>Admin access isn’t configured</h1>
      <p>This account does not match the configured admin user ID. Set <code>VITE_SUPABASE_ADMIN_USER_ID</code> in `.env.local`.</p>
      <button className="admin-secondary-button" onClick={signOut} disabled={busy}><LogOut size={17} /> Sign out</button>
    </section></main>
  );

  const selectedModule = modules.find(module => module.id === activeModule) || modules[0];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/">NS<span>.</span><small>PORTFOLIO</small></a>
        <div className="admin-sidebar-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Dashboard modules">
          {modules.map(({ id, label, Icon }) => <button key={id} className={activeModule === id ? 'is-active' : ''}
            onClick={() => { setActiveModule(id); setMessage(''); setErrorMessage(''); }}>
            <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
          </button>)}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="admin-user-avatar">{(session.user.email || 'A').slice(0, 1).toUpperCase()}</span>
          <span className="admin-user-email">{session.user.email}</span>
          <button className="admin-signout-icon" aria-label="Sign out" title="Sign out" onClick={signOut} disabled={busy}><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">Dashboard <span>/</span> {selectedModule.label}</div>
          <div className="admin-top-actions">
            <span className="admin-save-feedback" role="status">{message || (isDirty ? 'Unsaved changes' : 'All changes saved')}</span>
            <button className="admin-theme-toggle" type="button" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a className="admin-preview-button" href="/" target="_blank" rel="noreferrer">Preview site <ArrowUpRight size={16} /></a>
            <button className="admin-primary-button admin-save-button" onClick={saveChanges} disabled={busy || !isDirty}><Save size={17} />{busy ? 'Saving…' : 'Save changes'}</button>
          </div>
        </header>
        <div className="admin-content">
          <div className="admin-page-title"><div><span className="admin-eyebrow">PORTFOLIO MANAGER</span><h1>{activeModule === 'overview' ? 'Dashboard overview' : selectedModule.label}</h1></div></div>
          {errorMessage && <div className="admin-alert" role="alert">{errorMessage}</div>}
          {renderModule()}
          <footer className="admin-footer">Changes are saved to your Supabase portfolio record.</footer>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
