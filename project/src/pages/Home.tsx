import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import Features from '../components/Features';
import TestingInterface from '../components/TestingInterface';
import CallToAction from '../components/CallToAction';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function Home() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="landing-page"
    >
      <motion.section 
        variants={sectionVariants} 
        className="py-5"
      >
        <Hero />
      </motion.section>

      <motion.section 
        variants={sectionVariants} 
        className="py-5 bg-dark"
      >
        <Features />
      </motion.section>

      <motion.section 
        variants={sectionVariants} 
        className="py-5"
      >
        <TestingInterface />
      </motion.section>

      <motion.section 
        variants={sectionVariants} 
        className="py-5 bg-dark"
      >
        <CallToAction />
      </motion.section>
    </motion.div>
  );
}