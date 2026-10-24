import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { portfolio as fallbackPortfolio } from './data/portfolio';
import { loadPortfolio } from './data/loadPortfolio';
import AdminDashboard from './AdminDashboard';

const navigation = [
  ['Home', 'home'],
  ['About', 'about'],
  ['Skills', 'skills'],
  ['Education', 'education'],
  ['Work', 'work'],
  ['Experience', 'experience'],
  ['Contact', 'contact'],
];

function SectionHeading({ index, eyebrow, title, description }) {
  return (
    <div className="sectionhead">
      <div>
        <div className="kicker">{index} / {eyebrow}</div>
        <h2>{title}<span style={{ color: 'var(--blue)' }}>.</span></h2>
        {description && <p className="sub">{description}</p>}
      </div>
    </div>
  );
}

function Tags({ items }) {
  return <div className="tags">{items.map(item => <span key={item} className="tag">{item}</span>)}</div>;
}

function ProjectArt({ appearance }) {
  const type = { attendance: 'v1', commerce: 'v2', ide: 'v3' }[appearance] || 'v1';
  return (
    <div className={`visual ${type}`} aria-hidden="true">
      <div className="miniui">
        <div className="minihead"><i /><i /><i /></div>
        <div className="minibody">
          <div className="miniside"><i /><i /><i /></div>
          <div className="minicontent"><i /><i /><i /></div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [portfolio, setPortfolio] = useState(fallbackPortfolio);
  const pendingNavigation = useRef(null);
  const pendingNavigationTimer = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    loadPortfolio()
      .then(content => { if (!cancelled) setPortfolio(content); })
      .catch(error => console.warn('Could not load portfolio content from Supabase; using local content.', error));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      const anchor = window.innerHeight * 0.35;
      if (pendingNavigation.current) {
        const target = document.getElementById(pendingNavigation.current);
        if (target) {
          const rect = target.getBoundingClientRect();
          if (rect.top <= anchor && rect.bottom > anchor) {
            pendingNavigation.current = null;
            window.clearTimeout(pendingNavigationTimer.current);
          } else {
            window.clearTimeout(pendingNavigationTimer.current);
            pendingNavigationTimer.current = window.setTimeout(() => {
              pendingNavigation.current = null;
              updateActiveSection();
            }, 180);
            return;
          }
        } else {
          pendingNavigation.current = null;
        }
      }
      const atPageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (atPageBottom) {
        setActive(navigation[navigation.length - 1][1]);
        return;
      }
      const sections = navigation
        .map(([, id]) => document.getElementById(id))
        .filter(Boolean)
        .map(section => ({ id: section.id, rect: section.getBoundingClientRect() }));
      const current = sections.find(({ rect }) => rect.top <= anchor && rect.bottom > anchor);
      if (current) {
        setActive(current.id);
        return;
      }
      const nearest = sections.reduce((best, section) =>
        Math.abs(section.rect.top - anchor) < Math.abs(best.rect.top - anchor) ? section : best
      );
      if (nearest) setActive(nearest.id);
    };
    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    window.addEventListener('hashchange', updateActiveSection);
    return () => {
      window.clearTimeout(pendingNavigationTimer.current);
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
      window.removeEventListener('hashchange', updateActiveSection);
    };
  }, []);

  useEffect(() => {
    function onEscape(event) { if (event.key === 'Escape') setMenuOpen(false); }
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  const education = portfolio.education;
  const experiences = portfolio.experiences;
  const emailConfigured = portfolio.email && portfolio.email !== 'hello@example.com';

  if (window.location.pathname.replace(/\/$/, '') === '/admin') {
    return <AdminDashboard />;
  }

  return (
    <>
      <div className="topnote">NAT SOKPHARY <b>PORTFOLIO / MODERN BLUE</b></div>
      <nav className="nav" aria-label="Main navigation">
        <div className="wrap nav-inner">
          <a className="brand" href="#home" aria-label="Portfolio home">{portfolio.name}<span>.</span></a>
          <div className={`links${menuOpen ? ' open' : ''}`} id="navLinks">
            {navigation.map(([label, id]) => (
              <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}
                 aria-current={active === id ? 'page' : undefined}
                 onClick={() => {
                   pendingNavigation.current = id;
                   setActive(id);
                   setMenuOpen(false);
                 }}>
                {label}
              </a>
            ))}
          </div>
          <div className="navbtn">
            <button type="button" className="iconbtn" onClick={() => setTheme(v => v === 'dark' ? 'light' : 'dark')}
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Moon size={17} strokeWidth={1.8} /> : <Sun size={17} strokeWidth={1.8} />}
            </button>
            <a className="smallbtn" href="#contact">Let's talk ↗</a>
            <button type="button" className="iconbtn menuBtn" onClick={() => setMenuOpen(v => !v)}
                    aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
                    aria-controls="navLinks" aria-expanded={menuOpen}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section id="home" className="wrap hero">
          <div>
            <div className="eyebrow"><i className="dot" /> {portfolio.availability.toUpperCase()}</div>
            <h1>Building secure <span>backend systems.</span></h1>
            <p className="lead">Hi, I'm <strong>{portfolio.name}</strong> — {portfolio.intro}</p>
            <div className="actions">
              <a className="primary" href="#work">Explore my work ↗</a>
              <a className="secondary" href="#about">More about me →</a>
            </div>
            <div className="heroMeta"><span>✦ <strong>Backend-first</strong> approach</span><span>✦ <strong>API & Database</strong> design</span><span>✦ <strong>Cloud-ready</strong> workflow</span></div>
          </div>
          <div className="studio">
            <img className="hero-portrait" src={portfolio.profileImage || '/profile.png'} alt={`Portrait of ${portfolio.name}`} />
          </div>
        </section>

        <section className="section shade" id="about">
          <div className="wrap twocol">
            <div>
              <div className="kicker">01 / Get to know me</div>
              <h2>A little about me<span style={{ color: 'var(--blue)' }}>.</span></h2>
              <p className="sub">{portfolio.about}</p>
              <div className="actions"><a className="secondary" href="#experience">Explore my experience →</a></div>
            </div>
            <div className="about-cards">
              {[
                ['◈', 'CURRENT FOCUS', 'Backend Engineering', 'REST APIs, JWT authentication, and clean architecture.'],
                ['⌘', 'WHAT I ENJOY', 'Teaching at ETEC', 'Programming Instructor since July 2025.'],
                ['↗', 'NEXT CHAPTER', 'Graduating in 2027', 'Computer Science — Year 4 at RUPP.'],
              ].map(([icon, label, title, description]) => (
                <div className="info-card" key={title}><span className="info-icon">{icon}</span><div><span className="mini-label">{label}</span><h3>{title}</h3><p>{description}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="skills">
          <div className="wrap twocol">
            <div>
              <div className="kicker">02 / My toolkit</div>
              <h2>Tools for thoughtful engineering<span style={{ color: 'var(--blue)' }}>.</span></h2>
              <p className="sub">Technologies, tools, and services listed on my CV.</p>
              <p className="aboutnote">My focus is designing systems that are <strong>secure, practical, understandable, and easy to extend.</strong></p>
            </div>
            <div className="skillsets">
              {portfolio.stack.map(group => (
                <div className="skillbox" key={group.category}>
                  <h3>{group.category}</h3>
                  <div className="pills">{group.items.map(item => <span className="pill" key={item}>{item}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section shade" id="education">
          <div className="wrap">
            <SectionHeading index="03" eyebrow="Academic background" title="Education" description="Learning the fundamentals and applying them to real-world projects." />
            <div className="education-card">
              <div className="edu-symbol" aria-hidden="true">🎓</div>
              <div className="edu-main">
                <span className="mini-label">{education.label}</span>
                <h3>{education.degree}</h3>
                <p className="edu-school">{education.school}</p>
                <p className="sub">{education.description}</p>
                <Tags items={education.areas} />
              </div>
              <span className="edu-badge">{education.status}</span>
            </div>
          </div>
        </section>

        <section className="section" id="work">
          <div className="wrap">
            <SectionHeading index="04" eyebrow="Selected work" title="Featured projects" description="Two projects featured in my CV — E-Commerce System and SMS." />
            <div className="projectgrid">
              {portfolio.projects.map(project => (
                <article className="project" key={project.id}>
                  <ProjectArt appearance={project.appearance} />
                  <div className="projectbody">
                    <div className="projTitle">{project.title}</div>
                    <p>{project.description}</p>
                    <Tags items={project.technologies} />
                    {(project.demo || project.github) && <div className="project-actions">
                      {project.demo && <a href={project.demo} target="_blank" rel="noreferrer">Live demo ↗</a>}
                      {project.github && <a href={project.github} target="_blank" rel="noreferrer">Source code ↗</a>}
                    </div>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section shade" id="experience">
          <div className="wrap">
            <SectionHeading index="05" eyebrow="My journey" title="Experience" description="Professional experience described in my CV." />
            <div className="experience-grid">
              {experiences.map(item => (
                <article className="experience-card" key={item.title}>
                  <span className="mini-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <div className="exp-org">{item.organization} <span className="exp-date">· {item.period}</span></div>
                  <p>{item.description}</p>
                  <Tags items={item.tags} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="wrap">
            <div className="contact">
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: '#dce9ff' }}>LET'S BUILD SOMETHING</div>
                <h2>Have an idea in mind?</h2>
                <p>You can contact me about backend development, APIs, or full-stack opportunities. Based in Toul Kouk, Phnom Penh.</p>
                <div className="contact-direct"><a href={`mailto:${portfolio.email}`}>{portfolio.email}</a><a href={`tel:${portfolio.phone.replace(/[^+\d]/g, '')}`}>{portfolio.phone}</a></div>
                <div className="contact-social">
                  {portfolio.github && <a href={portfolio.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
                  {portfolio.telegram && <a href={portfolio.telegram} target="_blank" rel="noreferrer">Telegram ↗</a>}
                  {portfolio.facebook && <a href={portfolio.facebook} target="_blank" rel="noreferrer">Facebook ↗</a>}
                  {portfolio.linkedin && <a href={portfolio.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
                </div>
              </div>
              {emailConfigured ?
                <a href={`mailto:${portfolio.email}?subject=Portfolio%20Inquiry`}>Get in touch ↗</a> :
                <span className="contact-placeholder">Add your email in src/data/portfolio.js to enable contact</span>}
            </div>
          </div>
        </section>
      </main>
      <footer><div className="wrap foot"><span><strong>{portfolio.initials}.</strong> © 2026 Nat Sokphary</span><span>Built with purpose · Designed for developers</span></div></footer>
    </>
  );
}

export default App;
