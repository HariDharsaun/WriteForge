import React from 'react';
import { Link } from 'react-router-dom';
import { FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            Write<span>Forge</span>
          </div>
          <p className="footer-description">
            Craft compelling content with AI-powered assistance. Elevate your writing with intelligent suggestions and seamless content generation.
          </p>
          <div className="footer-social">
            <a href="https://github.com/HariDharsaun" target="_blank" rel="noopener noreferrer" className="social-link">
              <FiGithub size={18} />
            </a>
            <a href="https://www.linkedin.com/in/haridharsaun18" target="_blank" rel="noopener noreferrer" className="social-link">
              <FiLinkedin size={18} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Product</h3>
          <div className="footer-links">
            <Link to="/features" className="footer-link">Features</Link>
            <Link to="/pricing" className="footer-link">Pricing</Link>
            <Link to="/generate" className="footer-link">Generate</Link>
            <Link to="/templates" className="footer-link">Templates</Link>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Company</h3>
          <div className="footer-links">
            <Link to="/about" className="footer-link">About</Link>
            <Link to="/blog" className="footer-link">Blog</Link>
            <Link to="/careers" className="footer-link">Careers</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Resources</h3>
          <div className="footer-links">
            <Link to="/help" className="footer-link">Help Center</Link>
            <Link to="/api" className="footer-link">API Docs</Link>
            <Link to="/guides" className="footer-link">Guides</Link>
            <Link to="/community" className="footer-link">Community</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          © {new Date().getFullYear()} WriteFoge. All rights reserved.
        </div>
        <div className="footer-legal">
          <Link to="/privacy" className="legal-link">Privacy Policy</Link>
          <Link to="/terms" className="legal-link">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;