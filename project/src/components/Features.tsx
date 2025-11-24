import { Code2, Timer, TestTube2 } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Code2 size={32} />,
    title: 'Smart Code Analysis',
    description: 'Advanced algorithms to detect potential issues and optimize performance'
  },
  {
    icon: <Timer size={32} />,
    title: 'Real-time Testing',
    description: 'Instant feedback and results as you write your code'
  },
  {
    icon: <TestTube2 size={32} />,
    title: 'Multiple Testing Types',
    description: 'Support for unit, integration, and end-to-end testing'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function Features() {
  return (
    <div className="py-5">
      <div className="container">
        <motion.h2 
          className="text-center h2 mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Advanced Testing Features
        </motion.h2>
        
        <motion.div 
          className="row g-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="col-md-4"
              variants={itemVariants}
            >
              <div className="feature-card h-100">
                <div className="icon mb-3 text-primary">
                  {feature.icon}
                </div>
                <h3 className="h4">{feature.title}</h3>
                <p className="mb-0">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}