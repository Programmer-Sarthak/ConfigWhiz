import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Github } from 'lucide-react';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign up logic here
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card bg-dark border-secondary"
          >
            <div className="card-body p-4 p-md-5">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-center mb-4"
              >
                <h2 className="h3 mb-3">Create your account</h2>
                <p className="text-muted">Join thousands of developers using CodeTest</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                  <label className="form-label">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-control bg-dark border-secondary text-light"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control bg-dark border-secondary text-light"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control bg-dark border-secondary text-light"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="terms"
                    required
                  />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary">Privacy Policy</Link>
                  </label>
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-primary w-100 mb-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create account
                </motion.button>

                <div className="position-relative mb-4">
                  <hr className="text-secondary" />
                  <span className="position-absolute top-50 start-50 translate-middle px-3 bg-dark text-muted">
                    Or continue with
                  </span>
                </div>

                <motion.button
                  type="button"
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Github size={20} />
                  Continue with GitHub
                </motion.button>

                <p className="text-center mt-4 mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary text-decoration-none">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}