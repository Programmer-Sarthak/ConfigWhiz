import React from 'react';
import { Search, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const testHistory = [
  {
    id: 'TEST-001',
    date: '2024-03-15',
    type: 'Unit Testing',
    status: 'Passed',
    score: 98
  },
  {
    id: 'TEST-002',
    date: '2024-03-14',
    type: 'Integration',
    status: 'Failed',
    score: 65
  },
  {
    id: 'TEST-003',
    date: '2024-03-13',
    type: 'Performance',
    status: 'Passed',
    score: 92
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  }
};

export default function History() {
  return (
    <motion.div 
      className="container py-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <motion.h1 
          className="h3 mb-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Test History
        </motion.h1>
        <div className="position-relative">
          <input
            type="text"
            placeholder="Search by Test ID..."
            className="form-control bg-dark text-light border-secondary ps-5"
            style={{ width: '250px' }}
          />
          <Search className="position-absolute top-50 translate-middle-y ms-2" size={18} />
        </div>
      </div>

      <div className="card bg-dark border-secondary">
        {testHistory.map((test, index) => (
          <motion.div 
            key={test.id}
            variants={itemVariants}
            className={`card-body ${
              index !== testHistory.length - 1 ? 'border-bottom border-secondary' : ''
            }`}
          >
            <div className="row align-items-center">
              <div className="col-md-4 d-flex align-items-center gap-3">
                {test.status === 'Passed' ? (
                  <CheckCircle2 className="text-success" size={24} />
                ) : (
                  <XCircle className="text-danger" size={24} />
                )}
                <div>
                  <h5 className="mb-1">{test.id}</h5>
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <Calendar size={14} />
                    {test.date}
                  </div>
                </div>
              </div>
              
              <div className="col-md-8">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex gap-4">
                    <div>
                      <span className="text-muted">Type:</span>
                      <span className="ms-2">{test.type}</span>
                    </div>
                    <div>
                      <span className="text-muted">Score:</span>
                      <span className={`ms-2 ${
                        test.score >= 80 ? 'text-success' : 'text-danger'
                      }`}>
                        {test.score}%
                      </span>
                    </div>
                  </div>
                  <motion.button 
                    className="btn btn-outline-light btn-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}