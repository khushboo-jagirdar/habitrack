import "./about.scss";

function About() {
  const teamMembers = [
    {
      name: "Rahul Agrawal",
      role: "CEO & Founder",
      image: "/Rahul_Photo.png"
    },
    {
      name: "Vishnu Kumar",
      role: "Head of Technology",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Khushboo",
      role: "Chief Marketing Officer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Himanshu Samadhiya",
      role: "Head of Operations",
      image: "/Himanshu_Photo.jpeg"
    }
  ];

  const milestones = [
    { year: "2025", title: "Founded", description: "HabiTrack was born with a vision to make property search transparent and trustworthy." },
    { year: "2025", title: "First 10 Users", description: "Welcomed our first 10 users and received invaluable early feedback to shape the platform." },
    { year: "2025", title: "Core Features Live", description: "Launched Aadhaar verification, interactive maps, and secure in-app messaging." },
    { year: "2025", title: "Growing", description: "Continuously improving the platform based on real user needs and feedback." }
  ];

  return (
    <div className="aboutPage">
      {/* Hero Section */}
      <section className="hero">
        <div className="heroBackground">
          <div className="gradientOrb orb1"></div>
          <div className="gradientOrb orb2"></div>
          <div className="gridPattern"></div>
        </div>
        <div className="heroContent">
          <span className="badge">About HabiTrack</span>
          <h1>Transforming How People <span className="highlight">Find Homes</span></h1>
          <p>We're on a mission to make property discovery effortless, transparent, and enjoyable for everyone. Founded in 2025, we're building the platform we always wished existed.</p>

        </div>
      </section>

      {/* Story Section */}
      <section className="storySection">
        <div className="container">
          <div className="storyGrid">
            <div className="storyImage">
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop" alt="Modern home" />
              <div className="floatingCard">
                <span className="cardIcon">🏠</span>
                <div className="cardText">
                  <strong>Built in 2025</strong>
                  <span>Made for India</span>
                </div>
              </div>
            </div>
            <div className="storyContent">
              <span className="sectionTag">Our Story</span>
              <h2>Built by Home Seekers, for Home Seekers</h2>
              <p>HabiTrack was founded when our team experienced firsthand the frustration of searching for a home. Outdated listings, unresponsive agents, and confusing processes inspired us to create something better.</p>
              <p>Today, we combine cutting-edge technology with human expertise to deliver a seamless property experience. Our platform connects buyers, renters, and agents in a transparent ecosystem built on trust.</p>
              <div className="storyFeatures">
                <div className="feature">
                  <span className="featureIcon">✓</span>
                  <span>Verified property listings</span>
                </div>
                <div className="feature">
                  <span className="featureIcon">✓</span>
                  <span>AI-powered recommendations</span>
                </div>
                <div className="feature">
                  <span className="featureIcon">✓</span>
                  <span>Secure direct messaging</span>
                </div>
                <div className="feature">
                  <span className="featureIcon">✓</span>
                  <span>Virtual property tours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="valuesSection">
        <div className="container">
          <div className="sectionHeader">
            <span className="sectionTag">Our Values</span>
            <h2>What Drives Us Every Day</h2>
            <p>These core principles guide everything we do at HabiTrack</p>
          </div>
          <div className="valuesGrid">
            <div className="valueCard">
              <div className="valueIcon">🎯</div>
              <h3>Transparency</h3>
              <p>No hidden fees, no fake listings. We believe in complete honesty with our users.</p>
            </div>
            <div className="valueCard">
              <div className="valueIcon">💡</div>
              <h3>Innovation</h3>
              <p>We constantly push boundaries to bring you the latest in property technology.</p>
            </div>
            <div className="valueCard">
              <div className="valueIcon">🤝</div>
              <h3>Trust</h3>
              <p>Every listing is verified, every agent is vetted. Your peace of mind matters.</p>
            </div>
            <div className="valueCard">
              <div className="valueIcon">❤️</div>
              <h3>Customer First</h3>
              <p>Your dream home is our priority. We're here 24/7 to help you succeed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timelineSection">
        <div className="container">
          <div className="sectionHeader">
            <span className="sectionTag">Our Journey</span>
            <h2>Milestones We're Proud Of</h2>
          </div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div className="timelineItem" key={index}>
                <div className="timelineYear">{milestone.year}</div>
                <div className="timelineContent">
                  <h4>{milestone.title}</h4>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="teamSection">
        <div className="container">
          <div className="sectionHeader">
            <span className="sectionTag">Our Team</span>
            <h2>Meet the People Behind HabiTrack</h2>
            <p>Passionate professionals dedicated to helping you find home</p>
          </div>
          <div className="teamGrid">
            {teamMembers.map((member, index) => (
              <div className="teamCard" key={index}>
                <div className="teamImage">
                  <img src={member.image} alt={member.name} />
                </div>
                <h4>{member.name}</h4>
                <p>{member.role}</p>
                <div className="socialLinks">
                  <a href="#" className="socialLink">in</a>
                  <a href="#" className="socialLink">𝕏</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ctaSection">
        <div className="ctaBackground">
          <div className="ctaOrb"></div>
        </div>
        <div className="ctaContent">
          <h2>Ready to Find Your Dream Home?</h2>
          <p>Join our growing community of home seekers who found their perfect property with HabiTrack</p>
          <div className="ctaButtons">
            <a href="/list" className="ctaBtn primary">
              Browse Properties
              <span>→</span>
            </a>
            <a href="/contact" className="ctaBtn secondary">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;

