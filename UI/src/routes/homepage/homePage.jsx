import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";

// Scroll-reveal hook
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("revealed"); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const features = [
  { icon: "✅", title: "Verified Listings",      desc: "Every property is manually reviewed and certified before going live on our platform.", to: "/list" },
  { icon: "🔒", title: "Secure Transactions",    desc: "Aadhaar-verified identity with end-to-end encrypted payments for every deal.", to: "/contact" },
  { icon: "🗺️", title: "Interactive Maps",       desc: "Explore neighbourhoods with live OpenStreetMap integration and location insights.", to: "/list" },
  { icon: "🤝", title: "Expert Agents",           desc: "Get matched with certified real estate professionals who know your local market.", to: "/agents" },
  { icon: "⚡", title: "Fast & Easy Process",    desc: "Our streamlined platform takes you from search to signed deal in days, not months.", to: "/list" },
  { icon: "🪪", title: "Aadhaar Authentication", desc: "Every buyer and seller is identity-verified, making every transaction trustworthy.", to: "/signup" },
];

const steps = [
  { n: "01", title: "Create Your Account", desc: "Sign up in minutes and verify your identity securely with Aadhaar." },
  { n: "02", title: "Search & Explore",    desc: "Filter by location, budget, and type. Explore on our interactive map." },
  { n: "03", title: "Connect & Visit",     desc: "Chat directly with owners or agents and schedule property visits." },
  { n: "04", title: "Close the Deal",      desc: "Complete your transaction securely through our verified platform." },
];

const testimonials = [
  { name: "Priya Sharma", role: "Home Buyer, Mumbai",       text: "Found my dream apartment in just 2 weeks. The Aadhaar verification gave me complete confidence in the process.", avatar: "PS" },
  { name: "Rahul Mehta",  role: "Property Owner, Delhi",    text: "Listed my property and got genuine buyers within days. The platform is incredibly professional and easy to use.", avatar: "RM" },
  { name: "Anita Patel",  role: "Real Estate Agent, Pune",  text: "HabiTrack has transformed how I connect with clients. The verified listings save everyone so much time.", avatar: "AP" },
];

export default function HomePage() {
  const featuresRef   = useReveal();
  const howRef        = useReveal();
  const testiRef      = useReveal();
  const ctaRef        = useReveal();

  return (
    <div className="hp">

      {/* -- HERO ----------------------------------------------------------- */}
      <section className="hp-hero">
        <div className="hp-hero__left hp-anim-left">
          <div className="hp-eyebrow">
            <span className="hp-dot" />
            India's Most Trusted Property Platform
          </div>
          <h1 className="hp-h1">
            Find Your Perfect<br />
            <span className="hp-accent">Dream Home</span><br />
            <span className="hp-h1-sub">Across India</span>
          </h1>
          <p className="hp-sub">
            Discover Aadhaar-verified properties across India. Buy, rent or invest
            with confidence — backed by expert agents and secure transactions.
          </p>
          <div className="hp-search">
            <SearchBar />
          </div>
        </div>

        <div className="hp-hero__right hp-anim-right">
          <div className="hp-hero__imgbox">
            <img src="/bg.png" alt="Modern property" />
          </div>
        </div>
      </section>

      {/* -- FEATURES ------------------------------------------------------- */}
      <section className="hp-features reveal-section" ref={featuresRef}>
        <div className="hp-section-label reveal-item" style={{ "--delay": "0s" }}>Why Choose HabiTrack</div>
        <h2 className="hp-section-title reveal-item" style={{ "--delay": "0.1s" }}>Everything You Need,<br />All in One Place</h2>
        <p className="hp-section-sub reveal-item" style={{ "--delay": "0.2s" }}>A complete real estate ecosystem built for modern India</p>

        <div className="hp-feat-grid">
          {features.map((f, i) => (
            <Link className="hp-feat-card reveal-item" to={f.to} key={f.title} style={{ "--delay": `${0.1 + i * 0.08}s` }}>
              <div className="hp-feat-num">0{i + 1}</div>
              <div className="hp-feat-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="hp-feat-link">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* -- HOW IT WORKS --------------------------------------------------- */}
      <section className="hp-how reveal-section" ref={howRef}>
        <div className="hp-section-label hp-section-label--light reveal-item" style={{ "--delay": "0s" }}>Simple Process</div>
        <h2 className="hp-section-title hp-section-title--light reveal-item" style={{ "--delay": "0.1s" }}>Get Started in 4 Steps</h2>
        <p className="hp-section-sub hp-section-sub--light reveal-item" style={{ "--delay": "0.2s" }}>From signup to your new home — faster than you think</p>

        <div className="hp-steps">
          {steps.map((s, i) => (
            <div className="hp-step reveal-item" key={s.n} style={{ "--delay": `${0.15 + i * 0.12}s` }}>
              <div className="hp-step__circle"><span>{s.n}</span></div>
              {i < steps.length - 1 && <div className="hp-step__connector" />}
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -- TESTIMONIALS --------------------------------------------------- */}
      <section className="hp-testimonials reveal-section" ref={testiRef}>
        <div className="hp-section-label reveal-item" style={{ "--delay": "0s" }}>What People Say</div>
        <h2 className="hp-section-title reveal-item" style={{ "--delay": "0.1s" }}>Early User Stories</h2>
        <p className="hp-section-sub reveal-item" style={{ "--delay": "0.2s" }}>Feedback from our first users who helped shape HabiTrack</p>

        <div className="hp-testi-grid">
          {testimonials.map((t, i) => (
            <div className="hp-testi-card reveal-item" key={t.name} style={{ "--delay": `${0.1 + i * 0.12}s` }}>
              <div className="hp-testi-stars">⭐⭐⭐⭐⭐</div>
              <p className="hp-testi-text">"{t.text}"</p>
              <div className="hp-testi-author">
                <div className="hp-testi-avatar">{t.avatar}</div>
                <div>
                  <div className="hp-testi-name">{t.name}</div>
                  <div className="hp-testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -- CTA ------------------------------------------------------------ */}
      <section className="hp-cta reveal-section" ref={ctaRef}>
        <div className="hp-cta__inner reveal-item" style={{ "--delay": "0s" }}>
          <div className="hp-cta__badge">🏠 Start Your Journey Today</div>
          <h2>Ready to Find Your<br />Dream Home?</h2>
          <p>Browse verified listings, connect with expert agents, and close deals securely.</p>
          <div className="hp-cta__btns">
            <Link to="/list"   className="hp-cta__btn hp-cta__btn--primary">Browse Properties →</Link>
            <Link to="/signup" className="hp-cta__btn hp-cta__btn--outline">Create Free Account</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

