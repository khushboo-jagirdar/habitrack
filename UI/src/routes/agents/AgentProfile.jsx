import { Link, useParams } from "react-router-dom";
import { agents } from "../../lib/agentsData";
import "./agentProfile.scss";

function AgentProfile() {
  const { id } = useParams();
  const agent = agents.find((item) => String(item.id) === String(id));

  if (!agent) {
    return (
      <div className="agentProfilePage">
        <div className="profileCard">
          <h2>Agent not found</h2>
          <p>We couldn't find that agent profile.</p>
          <Link to="/agents" className="backLink">Back to Agents</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="agentProfilePage">
      <div className="profileCard">
        <div className="header">
          <img src={agent.image} alt={agent.name} />
          <div className="headerInfo">
            <h1>{agent.name}</h1>
            <p>{agent.role}</p>
            <span className="rating">⭐ {agent.rating}</span>
          </div>
        </div>

        <div className="details">
          <div className="detailItem">
            <span className="label">Experience</span>
            <span className="value">{agent.experience}</span>
          </div>
          <div className="detailItem">
            <span className="label">Deals Closed</span>
            <span className="value">{agent.deals}+</span>
          </div>
        </div>

        <div className="specialties">
          {agent.specialties.map((spec) => (
            <span key={spec} className="tag">{spec}</span>
          ))}
        </div>

        <div className="actions">
          <a
            className="btnPrimary"
            href={`mailto:${agent.email}?subject=${encodeURIComponent("HabiTrack Agent Inquiry")}`}
          >
            Contact Agent
          </a>
          <a className="btnSecondary" href={`tel:${agent.phone}`}>
            Call Agent
          </a>
        </div>

        <div className="footerLinks">
          <Link to="/agents" className="backLink">Back to Agents</Link>
        </div>
      </div>
    </div>
  );
}

export default AgentProfile;

