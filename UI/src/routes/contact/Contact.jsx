import { useState } from "react";
import { sendContactMessage } from "../../lib/contactApi";
import "./contact.scss";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await sendContactMessage(form);
      setSuccess("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally { setLoading(false); }
  };

  const infoCards = [
    { icon: "✉️", title: "Email Us", text: "support@habitrack.com" },
    { icon: "📞", title: "Call Us", text: "+91 98765 43210" },
    { icon: "📍", title: "Office", text: "Sector 62, Noida, Uttar Pradesh" },
  ];

  return (
    <div className="contactPage">
      <div className="contactContainer">

        {/* Hero */}
        <section className="contactHero">
          <div className="heroText">
            <span className="tag">Get in Touch</span>
            <h1>We're here to help.</h1>
            <p>Reach out with questions, feedback, or partnership requests. Our team responds within 24 hours.</p>
          </div>
          <div className="heroCard">
            <h3>🕐 Support Hours</h3>
            <p>Monday – Friday</p>
            <p>9:00 AM – 6:00 PM IST</p>
          </div>
        </section>

        {/* Info cards */}
        <div className="contactCards">
          {infoCards.map((c) => (
            <div className="card" key={c.title}>
              <div className="icon">{c.icon}</div>
              <div className="cardText">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form + map */}
        <div className="contactGrid">
          <div className="contactInfo">
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", height: 300 }}>
              <iframe
                title="HabiTrack Office"
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.35%2C28.61%2C77.38%2C28.64&layer=mapnik&marker=28.627%2C77.365"
                width="100%" height="100%" style={{ border: 0, display: "block" }}
                loading="lazy"
              />
            </div>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "20px 24px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d1b2a", marginBottom: 12 }}>Follow Us</h3>
              <div style={{ display: "flex", gap: 10 }}>
                {["LinkedIn", "Twitter", "Instagram", "Facebook"].map(s => (
                  <a key={s} href="#" style={{ padding: "6px 14px", background: "#f4f7fb", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#008080", textDecoration: "none", border: "1px solid #e2e8f0" }}>{s}</a>
                ))}
              </div>
            </div>
          </div>

          <form className="contactForm" onSubmit={handleSubmit}>
            <h2>Send a Message</h2>
            {error   && <div className="formError">{error}</div>}
            {success && <div className="formSuccess">✓ {success}</div>}
            <div className="formRow">
              <input name="name"  type="text"  placeholder="Full name"      value={form.name}    onChange={handleChange} required />
              <input name="email" type="email" placeholder="Email address"  value={form.email}   onChange={handleChange} required />
            </div>
            <input   name="subject" type="text" placeholder="Subject"       value={form.subject} onChange={handleChange} required />
            <textarea name="message" rows="5"   placeholder="Your message…" value={form.message} onChange={handleChange} required />
            <button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send Message →"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Contact;

