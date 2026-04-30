import { Link } from "react-router-dom";
import { agents } from "../../lib/agentsData";
import "./agents.scss";

function Agents() {
  return (
    <div className="agentsPage">
      {/* Hero Section */}
      <section className="hero">
        <div className="heroBackground">
          <div className="gradientCircle circle1"></div>
          <div className="gradientCircle circle2"></div>
        </div>
        <div className="heroContent">
          <span className="badge">Our Team</span>
          <h1>Meet Our Expert <span className="highlight">Agents</span></h1>
          <p>Our dedicated team of real estate professionals is committed to helping you find your perfect property. With years of experience and local expertise, we're here to guide you every step of the way.</p>
          <div className="statsRow">
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="agentsSection">
        <div className="agentsContainer">
          <div className="sectionHeader">
            <h2>Featured Agents</h2>
            <p>Work with the best in the industry</p>
          </div>
          <div className="agentGrid">
            {agents.map((agent) => (
              <div className="agentCard" key={agent.id}>
                <div className="cardTop">
                  <div className="imageWrapper">
                    <img src={agent.image} alt={agent.name} />
                    <div className="ratingBadge">
                      <span>⭐</span> {agent.rating}
                    </div>
                  </div>
                </div>
                <div className="cardContent">
                  <h3>{agent.name}</h3>
                  <p className="role">{agent.role}</p>
                  <div className="stats">
                    <div className="stat">
                      <span className="value">{agent.experience}</span>
                      <span className="label">Experience</span>
                    </div>
                    <div className="stat">
                      <span className="value">{agent.deals}+</span>
                      <span className="label">Deals Closed</span>
                    </div>
                  </div>
                  <div className="specialties">
                    {agent.specialties.map((spec, idx) => (
                      <span key={idx} className="tag">{spec}</span>
                    ))}
                  </div>
                  <div className="contactInfo">
                    <a href={`tel:${agent.phone}`} className="contactItem">
                      <span className="icon">📞</span>
                      {agent.phone}
                    </a>
                    <a href={`mailto:${agent.email}`} className="contactItem">
                      <span className="icon">✉️</span>
                      {agent.email}
                    </a>
                  </div>
                  <div className="actions">
                    <a
                      className="btnPrimary"
                      href={`mailto:${agent.email}?subject=${encodeURIComponent("HabiTrack Agent Inquiry")}`}
                    >
                      Contact Agent
                    </a>
                    <Link className="btnSecondary" to={`/agents/${agent.id}`}>
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ctaSection">
        <div className="ctaContent">
          <h2>Become a HabiTrack Agent</h2>
          <p>Join our team of successful real estate professionals and take your career to the next level.</p>
          <a href="/contact" className="ctaButton">
            Apply Now
            <span className="arrow">→</span>
          </a>
        </div>
      </section>
    </div>
  );
}

export default Agents;

