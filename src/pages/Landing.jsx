import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shield, Star, Smile, ChevronRight } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: <Smile />, title: 'Reduce Anxiety', desc: 'Transform fear into fun with gamified exposure therapy.' },
  { icon: <Shield />, title: 'Build Confidence', desc: 'Practice routines in a safe, animated environment.' },
  { icon: <Star />, title: 'Earn Rewards', desc: 'Collect badges and customize your Smile Avatar.' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero section-pad">
        <div className="container hero__inner">
          <motion.div 
            className="hero__content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="badge badge-pink hero__badge">
              <span role="img" aria-label="sparkles">✨</span> AI-Powered Dental Adventure
            </div>
            <h1 className="hero__title">
              Turn Dental Fear into <span className="text-teal">Fun</span> & <span className="text-pink">Confidence</span>
            </h1>
            <p className="hero__subtitle">
              Join Dr. Smiles on an interactive journey! Play games, learn about your teeth, and get ready for your next dental visit with a brave smile.
            </p>
            <div className="hero__actions">
              <Link to="/child" className="btn btn-primary btn-lg">
                Start Playing <Play size={20} fill="currentColor" />
              </Link>
              <Link to="/parent" className="btn btn-outline btn-lg">
                For Parents
              </Link>
            </div>
            <div className="hero__stats">
              <div className="stat">
                <strong>15+</strong> <span>Mini Games</span>
              </div>
              <div className="stat">
                <strong>100%</strong> <span>Kid Friendly</span>
              </div>
              <div className="stat">
                <strong>#1</strong> <span>Dentist Recommended</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero__visual"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="hero__blob blob-1 float"></div>
            <div className="hero__blob blob-2 float-slow"></div>
            
            <motion.div 
              className="hero__graphic glass-premium"
              whileHover={{ rotateY: 8, rotateX: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
               <div className="hero__spotlight">
                 <div className="hero__character">🐻</div>
               </div>
               
               <motion.div 
                  className="hero__bubble-premium"
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
               >
                 <span className="typing-text">Hi! I'm Dr. Smiles! ✨</span>
               </motion.div>

               <motion.div className="floating-icon icon-tooth" animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                 <div className="glass-icon">🦷</div>
               </motion.div>
               <motion.div className="floating-icon icon-brush" animate={{ y: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}>
                 <div className="glass-icon">🪥</div>
               </motion.div>
               <motion.div className="floating-icon icon-star" animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }}>
                 ✨
               </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section-pad">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Why Kids Love Happy Dental</h2>
            <p className="section-desc">We use the proven Tell-Show-Do method combined with awesome games.</p>
          </div>
          <div className="features__grid">
            {features.map((f, i) => (
              <motion.div 
                className="feature-card card" 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals CTA Section */}
      <section className="portals section-pad">
        <div className="container">
          <div className="portals__grid">
             <motion.div className="portal-card portal-card--dentist card" whileHover={{ y: -5 }}>
                <h3>🦷 For Dentists</h3>
                <p>Access patient readiness scores, anxiety analytics, and session insights.</p>
                <Link to="/dentist" className="portal-link">Enter Portal <ChevronRight size={16}/></Link>
             </motion.div>
             <motion.div className="portal-card portal-card--games card" whileHover={{ y: -5 }}>
                <h3>🎮 Games Library</h3>
                <p>Explore all 15 mini-games designed to teach, distract, and empower.</p>
                <Link to="/games" className="portal-link">View Games <ChevronRight size={16}/></Link>
             </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
