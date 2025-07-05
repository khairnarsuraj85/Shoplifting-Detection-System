import React from 'react';
import './about.css';

const team = [
  {
    name: 'Pankaj Katre',
    role: 'System Architect',
  },
  {
    name: 'Suraj Khairnar',
    role: 'AI & ML Specialist',
  },
  {
    name: 'Anuj Gadekar',
    role: 'Backend Developer',
  },
  {
    name: 'Vaibhav Kolhe',
    role: 'Frontend Developer',
  },
];

function About() {
  return (
    <section className="about">
      <div className="about-intro">
        <h2 className="about-title">About Us</h2>
        <p className="about-description">
          Welcome to the <strong>Shoplifting Detection System</strong> — a cutting-edge solution designed to enhance retail security through real-time monitoring and intelligent alerts. 
          Leveraging the power of AI, our system ensures safer shopping environments and minimizes loss for businesses.
        </p>
      </div>

      <div className="team-section">
        <h3 className="team-title">Meet the Team</h3>
        <div className="team-grid">
          {team.map((member, index) => (
            <div className="team-member" key={index}>
              <div className="team-header">
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
              </div>
              <div className="team-body">
                <p>Passionate about building secure and smart retail solutions.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
