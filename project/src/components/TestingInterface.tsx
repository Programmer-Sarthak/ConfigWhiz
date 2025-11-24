import React, { useState } from 'react';
import { Upload, Timer, Activity, Download, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestingInterface() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleTestSelection = (testType: string) => {
    setSelectedTest(testType);
    setShowResults(true);
  };

  return (
    <div className="container py-5">
      <motion.h2 
        className="text-center h2 mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Try Our Testing Interface
      </motion.h2>

      <div className="row g-4">
        <motion.div 
          className="col-lg-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card bg-dark border-secondary h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Code Editor</h3>
              <motion.button 
                className="btn btn-outline-light d-flex align-items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload size={16} />
                Upload File
              </motion.button>
            </div>
            <div className="card-body p-3 code-editor-container">
              <pre className="code-content m-0 p-3">
                <code>{`// Write or paste your code here
function example() {
  const data = process();
  return analyzeData();
}`}</code>
              </pre>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="col-lg-4"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="d-flex flex-column gap-4 h-100">
            <div className="card bg-dark border-secondary">
              <div className="card-header">
                <h3 className="card-title mb-0">Test Type</h3>
              </div>
              <div className="card-body">
                {[
                  { type: 'Unit Testing', icon: <Timer size={18} /> },
                  { type: 'Integration', icon: <Activity size={18} /> },
                  { type: 'Performance', icon: <AlertCircle size={18} /> }
                ].map((test) => (
                  <motion.button
                    key={test.type}
                    onClick={() => handleTestSelection(test.type)}
                    className={`btn w-100 mb-3 d-flex align-items-center gap-2 ${
                      selectedTest === test.type ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {test.icon}
                    {test.type}
                  </motion.button>
                ))}
              </div>
            </div>

            {showResults && (
              <motion.div
                className="card bg-dark border-secondary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">Results</h3>
                  <span className="text-muted small">Last run: 2 mins ago</span>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 text-success mb-3">
                    <div className="rounded-circle bg-success" style={{ width: 8, height: 8 }}></div>
                    All tests passed
                  </div>
                  <div className="d-flex align-items-center gap-2 text-warning mb-4">
                    <Activity size={16} />
                    Performance score: 95/100
                  </div>
                  <motion.button
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download size={16} />
                    Download Report
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}