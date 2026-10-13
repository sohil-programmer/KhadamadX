
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <div className="about-hero-content">
            <span className="about-badge">ABOUT KHADAMATX</span>

            <h1>
              Connecting <span>People</span>
              <br />
              With The Right Services
            </h1>

            <p>
              KhadamatX is a modern service marketplace where people can
              easily find the services they need and skilled professionals
              can offer their services and start earning online.
            </p>

            <div className="about-buttons">
              <Link to="/services" className="about-btn primary">
                Explore Services
              </Link>

              <Link to="/offer-service" className="about-btn secondary">
                Offer Your Service
              </Link>
            </div>
          </div>

          <div className="about-hero-card">
            <div className="hero-icon">✦</div>

            <h3>One Platform</h3>

            <p>
              Find services, connect with providers, place orders,
              and grow your online opportunities.
            </p>

            <div className="hero-mini-stats">
              <div>
                <strong>100+</strong>
                <span>Services</span>
              </div>

              <div>
                <strong>50+</strong>
                <span>Providers</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Who We Are */}
      <section className="about-section">
        <div className="about-container about-grid">

          <div className="about-image-box">
            <div className="image-decoration"></div>

            <div className="about-logo-box">
              <span>K</span>
              <h3>KhadamatX</h3>
              <p>Your Need, Our Service.</p>
            </div>
          </div>

          <div className="about-text">
            <span className="section-label">WHO WE ARE</span>

            <h2>
              A Simple Way To
              <span> Get Things Done</span>
            </h2>

            <p>
              KhadamatX is designed to make finding and offering services
              easier. Whether you need a developer, designer, marketer,
              video editor, computer technician, or another professional,
              KhadamatX helps you discover the right service in one place.
            </p>

            <p>
              Service providers can also showcase their skills, receive
              orders, build their reputation, and create opportunities
              to earn online.
            </p>

            <div className="about-check-list">
              <div>✓ Easy service discovery</div>
              <div>✓ Professional service providers</div>
              <div>✓ Simple ordering process</div>
              <div>✓ Opportunity to earn online</div>
            </div>
          </div>

        </div>
      </section>


      {/* Mission & Vision */}
      <section className="mission-section">
        <div className="about-container">

          <div className="section-heading">
            <span className="section-label">OUR PURPOSE</span>

            <h2>
              Built With A
              <span> Bigger Vision</span>
            </h2>

            <p>
              We want to make digital services more accessible and create
              better opportunities for both customers and skilled people.
            </p>
          </div>


          <div className="mission-grid">

            <div className="mission-card">
              <div className="mission-icon">🎯</div>

              <h3>Our Mission</h3>

              <p>
                To connect customers with reliable service providers
                through a simple, modern, and user-friendly platform.
              </p>
            </div>


            <div className="mission-card">
              <div className="mission-icon">🚀</div>

              <h3>Our Vision</h3>

              <p>
                To become a trusted digital marketplace where people can
                find services, share their skills, and build online income.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="why-section">
        <div className="about-container">

          <div className="section-heading">
            <span className="section-label">WHY KHADAMATX</span>

            <h2>
              Why People Choose
              <span> KhadamatX</span>
            </h2>
          </div>


          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-icon">🔎</div>
              <h3>Find Services Easily</h3>
              <p>
                Search and discover useful services without wasting time.
              </p>
            </div>


            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Simple</h3>
              <p>
                A clean interface makes finding and ordering services easy.
              </p>
            </div>


            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Grow Your Business</h3>
              <p>
                Providers can showcase their skills and reach new customers.
              </p>
            </div>


            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Online Opportunities</h3>
              <p>
                Turn your skills into opportunities and start earning online.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="how-section">
        <div className="about-container">

          <div className="section-heading">
            <span className="section-label">HOW IT WORKS</span>

            <h2>
              Simple From
              <span> Start To Finish</span>
            </h2>
          </div>


          <div className="steps-grid">

            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon">🔍</div>
              <h3>Find</h3>
              <p>
                Browse the services you need.
              </p>
            </div>


            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon">👤</div>
              <h3>Choose</h3>
              <p>
                Select the right service provider.
              </p>
            </div>


            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon">📦</div>
              <h3>Order</h3>
              <p>
                Place your order and provide the details.
              </p>
            </div>


            <div className="step-card">
              <span className="step-number">04</span>
              <div className="step-icon">⭐</div>
              <h3>Complete</h3>
              <p>
                Receive your service and share your experience.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="about-cta">
        <div className="about-container">

          <div className="cta-content">
            <span className="about-badge">START TODAY</span>

            <h2>
              Your Need,
              <span> Our Service.</span>
            </h2>

            <p>
              Find the service you need or share your skills with the world.
            </p>

            <div className="about-buttons">

              <Link to="/services" className="about-btn primary">
                Find a Service
              </Link>

              <Link to="/offer-service" className="about-btn secondary">
                Offer Your Service
              </Link>

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

export default About;