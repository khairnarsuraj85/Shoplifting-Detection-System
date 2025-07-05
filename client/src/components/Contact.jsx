import React from 'react';
import './contact.css';

function Contact() {
  return (
    <section className="contact">
      <h2 className="contact-title">Contact Us</h2>
      <p className="contact-description">
        We'd love to hear from you! Whether you have questions, feedback, or collaboration ideas, feel free to reach out.
      </p>

      <div className="contact-container">
        {/* Contact Info Card */}
        <div className="contact-info">
          <div className="info-banner">Team Members</div>
          <ul>
            <li><strong>Pankaj Katre</strong><br />📧 pankaj@example.com | 📞 +91-9876543210</li>
            <li><strong>Vaibhav Kolhe</strong><br />📧 vaibhav@example.com | 📞 +91-8765432109</li>
            <li><strong>Anuj Gadekar</strong><br />📧 anuj@example.com | 📞 +91-7654321098</li>
            <li><strong>Suraj Khairnar</strong><br />📧 suraj@example.com | 📞 +91-6543210987</li>
          </ul>
        </div>

        {/* Contact Form */}
        <form className="contact-form">
          <div className="form-group">
            <label>Name:</label>
            <input type="text" placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" placeholder="Your email" />
          </div>
          <div className="form-group">
            <label>Message:</label>
            <textarea placeholder="Your message"></textarea>
          </div>
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
