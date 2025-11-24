import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Github, Twitter, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-dark border-top border-secondary py-4 mt-auto">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-3">
            <Link to="/" className="d-flex align-items-center text-decoration-none mb-3">
              <Code2 className="text-primary me-2" size={24} />
              <span className="text-primary fw-semibold">CodeTest</span>
            </Link>
            <p className="text-muted small mb-0">
              Making code testing easier and more accessible.
            </p>
          </div>
          
          <div className="col-6 col-lg-2">
            <h6 className="fw-semibold mb-3">Product</h6>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link to="#" className="nav-link text-muted px-0">Features</Link>
              </li>
              <li className="nav-item">
                <Link to="#" className="nav-link text-muted px-0">Pricing</Link>
              </li>
              <li className="nav-item">
                <Link to="#" className="nav-link text-muted px-0">Documentation</Link>
              </li>
              <li className="nav-item">
                <Link to="#" className="nav-link text-muted px-0">API</Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="fw-semibold mb-3">Company</h6>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link to="/about" className="nav-link text-muted px-0">About</Link>
              </li>
              <li className="nav-item">
                <Link to="#" className="nav-link text-muted px-0">Blog</Link>
              </li>
              <li className="nav-item">
                <Link to="#" className="nav-link text-muted px-0">Careers</Link>
              </li>
              <li className="nav-item">
                <Link to="#" className="nav-link text-muted px-0">Press</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-5">
            <h6 className="fw-semibold mb-3">Stay up to date</h6>
            <p className="text-muted small mb-3">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <div className="input-group mb-3">
              <input 
                type="email" 
                className="form-control bg-dark border-secondary text-light" 
                placeholder="Enter your email"
              />
              <motion.button 
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="text-muted small mb-3 mb-md-0">
            © 2024 CodeTest. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <motion.a 
              href="#" 
              className="text-muted"
              whileHover={{ scale: 1.1, color: '#F5A524' }}
            >
              <Github size={20} />
            </motion.a>
            <motion.a 
              href="#" 
              className="text-muted"
              whileHover={{ scale: 1.1, color: '#F5A524' }}
            >
              <Twitter size={20} />
            </motion.a>
            <motion.a 
              href="#" 
              className="text-muted"
              whileHover={{ scale: 1.1, color: '#F5A524' }}
            >
              <Linkedin size={20} />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}