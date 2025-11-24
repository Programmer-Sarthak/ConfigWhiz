import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';

export default function CallToAction() {
  const navigate = useNavigate();
  
  return (
    <div className="container py-5">
      <div className="cta-container text-center py-5 px-4 rounded">
        <motion.h2 
          className="display-5 fw-bold text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ready to improve your code?
        </motion.h2>
        
        <motion.p 
          className="lead text-light-emphasis mb-5 mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ maxWidth: '700px' }}
        >
          Join thousands of developers who are already using CodeTest to write better code.
        </motion.p>
        
        <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
          <motion.button
            className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
          >
            Get Started Free
            <ArrowRight size={18} />
          </motion.button>
          
          <motion.button
            className="btn btn-outline-light btn-lg d-flex align-items-center justify-content-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText size={18} />
            View Documentation
          </motion.button>
        </div>
      </div>
    </div>
  );
}