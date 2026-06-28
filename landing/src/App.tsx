import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://onevillage.onrender.com/api';

// Contact for prospective local admins — change to your real channels.
const ADMIN_EMAIL = 'partner@onevillage.app';
const ADMIN_WHATSAPP = '919496085317';

interface Latest {
  version: string;
  androidUrl: string;
  iosUrl: string;
}

/* ---------------- inline icons ---------------- */
type IconProps = { className?: string };
const I = {
  store: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 9l1.5-5h15L21 9M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9zM4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
    </svg>
  ),
  wrench: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8 6.2 21l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.3 2.3-2.7-.7-.7-2.7 2.3-2.3z" />
    </svg>
  ),
  car: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v3h2m14-5a2 2 0 0 1 2 2v3h-2M7 16h10M7.5 13.5h.01M16.5 13.5h.01" />
    </svg>
  ),
  bus: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="4" width="16" height="13" rx="2" /><path d="M4 11h16M8 17v2M16 17v2M8 7h8" /><circle cx="8" cy="14" r="1" /><circle cx="16" cy="14" r="1" />
    </svg>
  ),
  siren: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 18v-5a5 5 0 0 1 10 0v5M5 18h14v2H5zM12 3v2M5 8L4 7M19 8l1-1" />
    </svg>
  ),
  megaphone: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l9 4V6l-9 4H4a1 1 0 0 0-1 1zM18 9a3 3 0 0 1 0 6" />
    </svg>
  ),
  pin: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  heart: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  ),
  ticket: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 1 0-4z" />
      <path d="M14 6v12" strokeDasharray="1.5 2.5" />
    </svg>
  ),
  live: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="2.5" /><path d="M7 7a7 7 0 0 0 0 10M17 7a7 7 0 0 1 0 10M4 4a11 11 0 0 0 0 16M20 4a11 11 0 0 1 0 16" />
    </svg>
  ),
  bag: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  drop: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
    </svg>
  ),
  briefcase: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
    </svg>
  ),
  android: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M6 9v8a1 1 0 0 0 1 1h1v3a1 1 0 0 0 2 0v-3h4v3a1 1 0 0 0 2 0v-3h1a1 1 0 0 0 1-1V9H6zM4 9a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1zm16 0a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1zM15.5 3l1.2-1.8a.4.4 0 1 0-.66-.44L14.7 2.6A6.9 6.9 0 0 0 12 2c-.96 0-1.87.2-2.7.6L8.0.76a.4.4 0 1 0-.66.44L8.5 3A5.4 5.4 0 0 0 6 7.5h12A5.4 5.4 0 0 0 15.5 3z" />
    </svg>
  ),
};

/** OneVillage emblem — circle with a tree, sun and houses (matches the logo). */
function Emblem({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#5DA130" strokeWidth="5" />
      <circle cx="62" cy="44" r="13" fill="#F6C026" />
      <ellipse cx="34" cy="42" rx="9" ry="12" fill="#7DB63E" />
      <rect x="33" y="40" width="2" height="22" fill="#2E5E1E" />
      <path d="M44 62l8-9 7 6 6-7 7 7v8H44z" fill="#2E5E1E" />
      <rect x="46" y="56" width="10" height="10" fill="#fff" stroke="#2E5E1E" strokeWidth="1.2" />
      <path d="M22 70c10-7 46-7 56 0-10 8-46 8-56 0z" fill="#3E7D27" />
    </svg>
  );
}

const FEATURES = [
  { icon: I.store, title: 'Local Businesses', text: 'Shops, supermarkets, bakeries and more near you — with photos, hours and one-tap call or WhatsApp order.' },
  { icon: I.wrench, title: 'Service Providers', text: 'Electricians, plumbers, carpenters and trusted local experts, rated and verified.' },
  { icon: I.car, title: 'Taxis & Autos', text: 'Reach drivers in your town instantly — call or WhatsApp with vehicle details.' },
  { icon: I.bus, title: 'Live Bus Times', text: 'Per-village timetables that auto-scroll to the next departure so you never miss a bus.' },
  { icon: I.siren, title: 'Emergency Contacts', text: 'Police, hospital, ambulance, fire and blood bank — saved and one tap away.' },
  { icon: I.megaphone, title: 'Announcements', text: 'Power cuts, health camps and local notices, straight from your village admin.' },
  { icon: I.pin, title: 'Maps & Directions', text: 'See every place on the map and navigate there in a tap.' },
  { icon: I.heart, title: 'Village-first', text: 'Everything is scoped to the village you choose — truly hyperlocal.' },
];

const STEPS = [
  { n: '1', title: 'Choose your village', text: 'Pick your district, area and village once — the app remembers it.' },
  { n: '2', title: 'Browse what’s around', text: 'Shops, services, taxis, buses, emergencies and notices, all local.' },
  { n: '3', title: 'Connect instantly', text: 'Call, WhatsApp or get directions in a single tap.' },
];

const UPCOMING = [
  { icon: I.ticket, title: 'Token Booking', text: 'Book your slot at barber shops, clinics and other local services — skip the queue and get notified when it’s your turn.' },
  { icon: I.live, title: 'Live Village Events', text: 'Watch local festivals, functions and community events streamed live, right from your village.' },
  { icon: I.bag, title: 'Buy & Sell', text: 'A local marketplace to buy and sell used goods — furniture, bikes, electronics and more — within your village.' },
  { icon: I.drop, title: 'Blood Donor Network', text: 'Find and request blood donors nearby by group. Urgent requests reach matching donors in your area instantly.' },
  { icon: I.briefcase, title: 'Local Jobs', text: 'Post and discover local work and hiring — daily-wage jobs, shop staff, tuition, drivers and more.' },
];

/* ---------------- animated phone screens ---------------- */
const M_CATS: [string, string][] = [
  ['#16A34A', 'Shops'], ['#3B82F6', 'Services'], ['#EF4444', 'Emergency'], ['#8B5CF6', 'Notices'],
  ['#F59E0B', 'Taxi'], ['#0891B2', 'Bus'], ['#EC4899', 'Health'], ['#0EA5E9', 'Schools'],
];

function ScreenHome() {
  return (
    <>
      <div className="m-hero">
        <div className="m-row"><span>📍 Omassery ▾</span><span>🔔</span></div>
        <div className="m-welcome">Welcome to<br /><b>Omassery</b></div>
      </div>
      <div className="m-ad">AD · Local offers this week</div>
      <div className="m-search">🔎 Search shops, services…</div>
      <div className="m-grid">
        {M_CATS.map(([c, t]) => (
          <div className="m-cat" key={t}><span className="m-dot" style={{ background: c }} /><i>{t}</i></div>
        ))}
      </div>
    </>
  );
}
function ScreenBiz() {
  const rows: [string, string][] = [['Salkara Supermarket', 'Supermarket'], ['Fresh Bake', 'Bakery'], ['City Medicals', 'Pharmacy'], ['Bilal Hardware', 'Hardware']];
  return (
    <div className="m-list">
      <div className="m-title">Businesses</div>
      {rows.map(([n, c]) => (
        <div className="m-item" key={n}>
          <span className="m-thumb" />
          <div className="m-meta"><b>{n}</b><i>{c}</i></div>
          <span className="m-call">📞</span>
        </div>
      ))}
    </div>
  );
}
function ScreenBus() {
  return (
    <div className="m-list">
      <div className="m-title">Bus Times</div>
      <div className="m-next">
        <span className="m-tag">NEXT BUS</span>
        <div className="m-bigtime">6:15 <small>AM</small></div>
        <i>KSRTC Fast · departs in 8 min</i>
      </div>
      {[['6:35', 'City Bus'], ['7:00', 'A1 Travels'], ['7:30', 'City Bus']].map(([t, o]) => (
        <div className="m-item" key={t}><b className="m-time">{t}</b><div className="m-meta"><b>{o}</b></div></div>
      ))}
    </div>
  );
}
function ScreenProfile() {
  return (
    <div className="m-list">
      <div className="m-title">Profile</div>
      <div className="m-prof"><span className="m-av">N</span><div className="m-meta"><b>Resident</b><i>Omassery · Koduvally</i></div></div>
      {['Change location', 'Language · English', 'Help & support', 'About OneVillage'].map((r) => (
        <div className="m-item row" key={r}><div className="m-meta"><b className="reg">{r}</b></div><span className="m-chev">›</span></div>
      ))}
    </div>
  );
}

const SCREENS = [ScreenHome, ScreenBiz, ScreenBus, ScreenProfile];
const TAB_EMOJI = ['🏠', '🏪', '🚌', '👤'];

function PhoneMock() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % SCREENS.length), 2600);
    return () => clearInterval(id);
  }, []);
  const Screen = SCREENS[active];
  return (
    <div className="phone">
      {/* //<div className="phone-notch" /> */}
      <div className="phone-screen">
        <div className="m-view" key={active}>
          <Screen />
        </div>
        <div className="m-tabs">
          {TAB_EMOJI.map((e, i) => (
            <span key={e} className={i === active ? 'on' : ''}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [latest, setLatest] = useState<Latest | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/app-update/latest`)
      .then((r) => r.json())
      .then((j) => {
        if (j?.success) setLatest(j.data as Latest);
      })
      .catch(() => undefined);
  }, []);

  const apk = latest?.androidUrl?.trim();
  const version = latest?.version?.trim();

  const DownloadButton = ({ large }: { large?: boolean }) =>
    apk ? (
      <a className={`btn primary ${large ? 'lg' : ''}`} href={apk} target="_blank" rel="noreferrer">
        <I.android className="ico" />
        <span>Download for Android{version ? <em>v{version}</em> : null}</span>
      </a>
    ) : (
      <span className={`btn primary disabled ${large ? 'lg' : ''}`}>
        <I.android className="ico" />
        <span>Coming soon</span>
      </span>
    );

  return (
    <div className="page">
      {/* NAV */}
      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <Emblem size={34} />
            <span>One<b>Village</b></span>
          </a>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#soon">What’s next</a>
            <a href="#admins">For villages</a>
            <a href="#advertise">Advertise</a>
            <a href="#download">Download</a>
          </nav>
          <a
            className="btn primary nav-dl"
            href={apk || '#download'}
            {...(apk ? { target: '_blank', rel: 'noreferrer' } : {})}>
            <I.android className="ico" />
            <span className="t-full">Download for Android</span>
            <span className="t-short">Download</span>
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="container hero-grid">
          <div className="hero-copy reveal">
            <span className="pill">📍 Hyperlocal · Kerala</span>
            <h1>Your village,<br /><span className="grad">in your pocket.</span></h1>
            <p className="lead">
              OneVillage brings every local shop, service, taxi, bus time, emergency contact and
              announcement of your town into one clean, fast app.
            </p>
            <div className="cta-row">
              <DownloadButton large />
              <a className="btn ghost lg" href="#features">Explore features</a>
            </div>
            <div className="trust">
              <span>✓ Free to use</span>
              <span>✓ No clutter</span>
              <span>✓ Built for your village</span>
            </div>
          </div>

          <div className="hero-phone reveal delay">
            <PhoneMock />
            <div className="blob blob-a" />
            <div className="blob blob-b" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <h2>Everything local, in one place</h2>
            <p>No endless feeds — just what matters in your town.</p>
          </div>
          <div className="features">
            {FEATURES.map((f) => (
              <div className="feature" key={f.title}>
                <div className="feature-ico"><f.icon /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section alt" id="how">
        <div className="container">
          <div className="section-head">
            <h2>Up and running in seconds</h2>
            <p>Three taps to your whole village.</p>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="section" id="soon">
        <div className="container">
          <div className="section-head">
            <span className="pill">🚀 On the roadmap</span>
            <h2 style={{ marginTop: 14 }}>Coming soon to OneVillage</h2>
            <p>We’re just getting started — here’s what’s next for your village.</p>
          </div>
          <div className="soon-grid">
            {UPCOMING.map((f) => (
              <div className="soon-card" key={f.title}>
                <span className="soon-badge">Soon</span>
                <div className="soon-ico"><f.icon /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL ADMIN CTA */}
      <section className="admin-cta" id="admins">
        <div className="container admin-grid">
          <div className="admin-copy">
            <span className="pill light">For village leaders</span>
            <h2>Transform your village, digital.</h2>
            <p>
              Become the OneVillage admin for your town and put every local shop, service, taxi,
              bus time, emergency contact and notice in your residents’ pockets — all managed by you.
            </p>
            <ul className="admin-points">
              <li>Add &amp; manage local businesses and services</li>
              <li>Publish announcements &amp; emergency contacts</li>
              <li>Post village ads and bus timings</li>
              <li>Full control over your village’s content</li>
            </ul>
            <div className="cta-row">
              <a className="btn light lg" href={`mailto:${ADMIN_EMAIL}?subject=Become a OneVillage admin`}>
                Become an admin
              </a>
              <a
                className="btn ghost-light lg"
                href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('I want to bring my village onto OneVillage')}`}
                target="_blank"
                rel="noreferrer">
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* faux admin console card */}
          <div className="admin-art">
            <div className="ac-card">
              <div className="ac-head"><b>Omassery</b><span className="ac-badge">Admin</span></div>
              <div className="ac-stats">
                <div><b>12</b><i>Businesses</i></div>
                <div><b>8</b><i>Services</i></div>
                <div><b>3</b><i>Notices</i></div>
              </div>
              <div className="ac-row"><span className="ac-ico" style={{ background: '#16A34A' }} /> Add business</div>
              <div className="ac-row"><span className="ac-ico" style={{ background: '#8B5CF6' }} /> Post announcement</div>
              <div className="ac-row"><span className="ac-ico" style={{ background: '#F59E0B' }} /> Place an ad</div>
              <div className="ac-btn">Open admin console</div>
            </div>
          </div>
        </div>
      </section>

      {/* ADVERTISE CTA */}
      <section className="section alt" id="advertise">
        <div className="container adv-grid">
          <div className="adv-art">
            <div className="adv-phonecard">
              <div className="adv-banner">
                <span className="adv-adtag">AD</span>
                <div className="adv-btext">
                  <b>Onam Mega Sale</b>
                  <i>Up to 30% off · Free home delivery</i>
                </div>
                <span className="adv-cta">Learn more</span>
              </div>
              <div className="adv-caption">Your ad on every home screen in your village</div>
            </div>
          </div>
          <div className="adv-copy">
            <span className="pill">Advertise</span>
            <h2>Reach your whole village.</h2>
            <p>
              Promote your shop, offer or event right on the OneVillage home screen — seen by every
              resident who opens the app. Target a single village, a whole area, or an entire district.
            </p>
            <ul className="adv-points">
              <li>Banner ads on the app home screen</li>
              <li>Target by village, area or district</li>
              <li>Add an image, message and a tappable link</li>
              <li>Go live fast after admin approval</li>
            </ul>
            <div className="cta-row">
              <a className="btn primary lg" href={`mailto:${ADMIN_EMAIL}?subject=Place an ad on OneVillage`}>
                Place an ad
              </a>
              <a
                className="btn ghost lg"
                href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('I want to place an ad on OneVillage')}`}
                target="_blank"
                rel="noreferrer">
                Enquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD CTA */}
      <section className="section" id="download">
        <div className="container">
          <div className="download-card">
            <Emblem size={56} />
            <h2>Get OneVillage now</h2>
            <p>
              Download the Android app and pick your village.
              {version ? <> Latest version <b>v{version}</b>.</> : null}
            </p>
            <div className="cta-row center"><DownloadButton large /></div>
            {!apk && <p className="muted small">The download link will appear here once the app is published.</p>}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-inner">
          <a className="brand" href="#top"><Emblem size={28} /><span>One<b>Village</b></span></a>
          <p className="muted small">© {new Date().getFullYear()} OneVillage · Your village, in your pocket.</p>
        </div>
      </footer>
    </div>
  );
}
