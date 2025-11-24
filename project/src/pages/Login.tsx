import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Github } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
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
                <h2 className="h3 mb-3">Welcome back</h2>
                <p className="text-muted">Sign in to your account to continue</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="remember"
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-primary text-decoration-none">
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-primary w-100 mb-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign in
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
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary text-decoration-none">
                    Sign up
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