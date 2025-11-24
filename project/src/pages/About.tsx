import React, { useState } from 'react';
import { Users, Target, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Lead Developer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Sarah has over 10 years of experience in software development with expertise in testing frameworks and automation.'
  },
  {
    name: 'Michael Chen',
    role: 'AI Specialist',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Michael specializes in machine learning algorithms that power our advanced code analysis features.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Emily creates intuitive user experiences that make complex testing processes simple and accessible.'
  },
  {
    name: 'David Kim',
    role: 'Backend Engineer',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'David builds robust backend systems that ensure our testing platform is fast, reliable, and scalable.'
  }
];

const values = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'User-Focused',
    description: 'We put developers first in everything we build'
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: 'Precision',
    description: 'Delivering accurate and reliable testing solutions'
  },
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: 'Innovation',
    description: 'Constantly evolving our technology'
  }
];

export default function About() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextSlide = () => {
    setActiveIndex((current) => 
      current === teamMembers.length - 1 ? 0 : current + 1
    );
  };
  
  const prevSlide = () => {
    setActiveIndex((current) => 
      current === 0 ? teamMembers.length - 1 : current - 1
    );
  };

  return (
    <div className="container py-5">
      <motion.section 
        className="mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold mb-4">About CodeTest</h1>
            <p className="lead mb-4">
              We're on a mission to make code testing more accessible and efficient for developers worldwide.
            </p>
            <p className="mb-4">
              Our platform combines cutting-edge technology with intuitive design to deliver a superior testing experience.
              We believe that better testing leads to better code, and better code changes the world.
            </p>
          </div>
          <div className="col-lg-6">
            <motion.img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop"
              alt="Team collaboration"
              className="img-fluid rounded shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="display-6 fw-bold text-center mb-5">Our Values</h2>
        <div className="row g-4">
          {values.map((value, index) => (
            <motion.div 
              key={index} 
              className="col-md-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            >
              <motion.div 
                className="value-card h-100"
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                  borderColor: "rgba(245, 165, 36, 0.5)"
                }}
              >
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-circle bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    {value.icon}
                  </div>
                  <h3 className="h4 mb-0">{value.title}</h3>
                </div>
                <p className="text-muted mb-0">{value.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        className="mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="display-6 fw-bold text-center mb-5">Meet Our Team</h2>
        
        <div className="team-carousel position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="position-relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="card bg-dark border-secondary"
                  >
                    <div className="row g-0">
                      <div className="col-md-4">
                        <img 
                          src={teamMembers[activeIndex].image} 
                          alt={teamMembers[activeIndex].name}
                          className="img-fluid rounded-start h-100 object-fit-cover"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="col-md-8">
                        <div className="card-body p-4">
                          <h3 className="card-title h4 mb-1">{teamMembers[activeIndex].name}</h3>
                          <p className="card-subtitle text-primary mb-3">{teamMembers[activeIndex].role}</p>
                          <p className="card-text">{teamMembers[activeIndex].bio}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                <div className="carousel-controls d-flex justify-content-between position-absolute top-50 start-0 end-0 translate-middle-y px-3">
                  <motion.button 
                    className="btn btn-primary rounded-circle"
                    onClick={prevSlide}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
                  <motion.button 
                    className="btn btn-primary rounded-circle"
                    onClick={nextSlide}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </div>
              
              <div className="carousel-indicators d-flex justify-content-center gap-2 mt-4">
                {teamMembers.map((_, index) => (
                  <button 
                    key={index}
                    className={`carousel-indicator ${index === activeIndex ? 'active' : ''}`}
                    onClick={() => setActiveIndex(index)}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}