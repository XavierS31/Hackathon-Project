import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDownIcon, 
  UserPlusIcon, 
  ShoppingBagIcon, 
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PlayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Particle component for background
const Particle = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-2 h-2 bg-knight-gold rounded-full opacity-60"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -100, 0],
      x: [0, Math.random() * 100 - 50, 0]
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
);

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, delay }: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="group relative p-8 rounded-2xl bg-gradient-to-br from-knight-dark to-knight-gray border border-gray-800 hover:border-knight-gold/50 transition-all duration-300 card-hover"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-knight-gold/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="w-16 h-16 bg-gradient-to-br from-knight-gold to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-black" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// Stats component
const StatCard = ({ number, label, delay }: { number: string; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.6 }}
    className="text-center"
  >
    <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{number}</div>
    <div className="text-gray-300 font-medium">{label}</div>
  </motion.div>
);

// Main App component
const App: React.FC = () => {

  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Social Feed",
      description: "Connect with fellow Knights, share updates, and stay in the loop with campus life."
    },
    {
      icon: ShoppingBagIcon,
      title: "Marketplace",
      description: "Buy and sell items safely within the verified UCF community network."
    },
    {
      icon: UserPlusIcon,
      title: "Networking",
      description: "Build professional connections and find study groups, roommates, and friends."
    },
    {
      icon: ShieldCheckIcon,
      title: "Verified Community",
      description: "Only UCF students and alumni can join, ensuring a safe and trusted environment."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-knight-dark to-knight-gray" />
        {[...Array(20)].map((_, i) => (
          <Particle key={i} delay={i * 0.3} />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 w-full z-50 glass border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-knight-gold to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">⚔️</span>
              </div>
              <span className="text-2xl font-bold gradient-text">KnightHaven</span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              <motion.a
                href="auth.html"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Get Started
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-knight-gold to-yellow-600 rounded-full flex items-center justify-center shadow-2xl"
            >
              <span className="text-6xl">⚔️</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Welcome to{' '}
              <span className="gradient-text">KnightHaven</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              The ultimate social platform for UCF Knights. Connect, buy, sell, and discover 
              within your university community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.a
              href="auth.html"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(251, 191, 36, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="group btn-primary text-lg px-8 py-4 rounded-2xl flex items-center space-x-3"
            >
              <UserPlusIcon className="w-6 h-6" />
              <span>Join KnightHaven</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group glass text-white px-8 py-4 rounded-2xl text-lg font-semibold flex items-center space-x-3 hover:bg-white hover:text-black transition-all duration-300"
            >
              <PlayIcon className="w-6 h-6" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <StatCard number="10K+" label="Active Knights" delay={0.9} />
            <StatCard number="5K+" label="Items Sold" delay={1.0} />
            <StatCard number="99%" label="UCF Verified" delay={1.1} />
            <StatCard number="24/7" label="Community" delay={1.2} />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDownIcon className="w-8 h-8 text-knight-gold" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Everything You Need in{' '}
              <span className="gradient-text">One Platform</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built by Knights, for Knights. Experience the future of campus social networking.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-knight-gold/10 to-yellow-600/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Ready to Join the{' '}
              <span className="gradient-text">KnightHaven</span> Community?
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Start connecting with fellow Knights today and be part of something bigger.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.a
                href="auth.html"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group btn-primary text-xl px-12 py-6 rounded-2xl flex items-center space-x-3"
              >
                <SparklesIcon className="w-6 h-6" />
                <span>Start Your Journey</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-knight-gold to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">⚔️</span>
              </div>
              <span className="text-2xl font-bold gradient-text">KnightHaven</span>
            </div>
            
            <div className="flex space-x-8 text-gray-300">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 KnightHaven. Built with ❤️ for UCF Knights.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;