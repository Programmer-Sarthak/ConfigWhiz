import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Hero() {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const codeText = `function testCode() {
  // Your code here
  const result = analyze();
  return optimizeResult();
}`;

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < codeText.length) {
        setTypedText(codeText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  const cursorVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0, 1, 0],
      transition: {
        repeat: Infinity,
        duration: 1.2
      }
    }
  };

  return (
    <div className="hero-section container">
      <div className="row align-items-center">
        <motion.div 
          className="col-lg-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="display-4 fw-bold mb-4">
            Bring intelligence to your code testing
          </h1>
          <p className="lead mb-4">
            Work fast and flexible by testing effectively.
          </p>
          <motion.button 
            className="btn btn-primary btn-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
          >
            Sign up now
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="col-lg-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="code-editor"
            whileHover={{ 
              boxShadow: "0 15px 30px rgba(245, 165, 36, 0.3)", 
              borderColor: "rgba(245, 165, 36, 0.5)" 
            }}
          >
            <div className="window-controls">
              <div className="control red"></div>
              <div className="control yellow"></div>
              <div className="control green"></div>
            </div>
            <div className="code-content position-relative">
              <pre className="m-0">
                <code>
                  {typedText}
                  <motion.span 
                    className="cursor"
                    variants={cursorVariants}
                    initial="initial"
                    animate="animate"
                  >|</motion.span>
                </code>
              </pre>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}