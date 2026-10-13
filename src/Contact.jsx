
import { useState } from "react";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-container">

          <span className="contact-label">CONTACT KHADAMATX</span>

          <h1>
            Let’s Start a
            <span> Conversation.</span>
          </h1>

          <p>
            Have a question, need help, or want to work with us?
            Send us a message and our team will get back to you.
          </p>

        </div>
      </section>


      {/* Contact Main */}
      <section className="contact-section">
        <div className="contact-container contact-grid">

          {/* Contact Information */}
          <div className="contact-info">

            <span className="section-label">GET IN TOUCH</span>

            <h2>
              We’re Here to
              <span> Help You.</span>
            </h2>

            <p>
              Whether you are looking for a service or want to offer your
              skills, feel free to contact KhadamatX.
            </p>


            <div className="contact-info-list">

              <div className="contact-info-item">
                <div className="contact-icon">📧</div>

                <div>
                  <h3>Email</h3>
                  <p>support@khadamatx.com</p>
                </div>
              </div>


              <div className="contact-info-item">
                <div className="contact-icon">📱</div>

                <div>
                  <h3>Phone</h3>
                  <p>+93 747739284</p>
                </div>
              </div>


              <div className="contact-info-item">
                <div className="contact-icon">📍</div>

                <div>
                  <h3>Location</h3>
                  <p>Afghanistan</p>
                </div>
              </div>

            </div>


            {/* Social */}
            <div className="contact-social">

              <h3>Follow KhadamatX</h3>

              <div className="social-links">
                <a href="#" aria-label="Facebook">f</a>
                <a href="#" aria-label="Instagram">ig</a>
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="Telegram">tg</a>
              </div>

            </div>

          </div>


          {/* Contact Form */}
          <div className="contact-form-box">

            <div className="form-header">
              <span className="section-label">SEND MESSAGE</span>

              <h2>Tell Us What You Need</h2>

              <p>
                Fill out the form below and we’ll get back to you.
              </p>
            </div>


            {submitted && (
              <div className="success-message">
                ✓ Your message has been sent successfully!
              </div>
            )}


            <form onSubmit={handleSubmit}>

              <div className="form-row">

                <div className="form-group">
                  <label>Your Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>


                <div className="form-group">
                  <label>Email Address</label>

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>


              <div className="form-group">
                <label>Subject</label>

                <input
                  type="text"
                  name="subject"
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label>Message</label>

                <textarea
                  name="message"
                  rows="6"
                  placeholder="Write your message..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>


              <button type="submit" className="contact-submit">
                Send Message
                <span>→</span>
              </button>

            </form>

          </div>

        </div>
      </section>


      {/* FAQ */}
      <section className="contact-faq">
        <div className="contact-container">

          <div className="section-title">
            <span className="section-label">FAQ</span>

            <h2>Frequently Asked Questions</h2>
          </div>


          <div className="faq-grid">

            <div className="faq-card">
              <h3>How can I find a service?</h3>

              <p>
                Go to the Services page, browse available services,
                choose a provider, and place your order.
              </p>
            </div>


            <div className="faq-card">
              <h3>Can I offer my own service?</h3>

              <p>
                Yes. Register as a provider and use the Offer Your Service
                section to publish your skills.
              </p>
            </div>


            <div className="faq-card">
              <h3>How can I contact a provider?</h3>

              <p>
                Open the service details page and use the available
                provider contact options.
              </p>
            </div>


            <div className="faq-card">
              <h3>Can I track my orders?</h3>

              <p>
                Yes. Customers can use their Dashboard or My Orders page
                to view their order status.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* Bottom CTA */}
      <section className="contact-cta">
        <div className="contact-container">

          <h2>
            Have a Project in Mind?
            <span> Let’s Talk.</span>
          </h2>

          <p>
            We’re ready to hear from you and help you find the right solution.
          </p>

        </div>
      </section>

    </div>
  );
}

export default Contact;
