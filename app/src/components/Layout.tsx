import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Tv, 
  BarChart3, 
  Bell, 
  User, 
  Menu, 
  X,
  Sun,
  Moon,
  Bot
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/news', icon: Tv, label: 'News' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/ai-chat', icon: Bot, label: 'AI Chat' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 4 + 4}s`,
            }}
          />
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-20 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto glass-card border-r border-border/50 px-4 py-6">
          <Link to="/" className="flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.5 }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                location.pathname === '/' 
                  ? 'bg-primary text-primary-foreground neon-glow' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Home className="w-6 h-6" />
            </motion.div>
          </Link>
          
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-4 items-center">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link to={item.path}>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          relative p-3 rounded-xl transition-all duration-300
                          ${isActive 
                            ? 'bg-primary text-primary-foreground neon-glow' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-primary rounded-xl -z-10"
                            transition={{ type: "spring", duration: 0.5 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            
            <div className="flex flex-col gap-4 items-center pt-4 border-t border-border/50">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
              
              <Link to={isAuthenticated ? '/profile' : '/login'}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <User className="w-5 h-5" />
                </motion.div>
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">SkyBreath</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          className="overflow-hidden"
        >
          <nav className="px-4 py-2 border-t border-border/50">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">{isAuthenticated ? 'Profile' : 'Login'}</span>
            </Link>
          </nav>
        </motion.div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 px-2 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`
                    flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
                    ${isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'neon-text' : ''}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:pl-20 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen bg-background relative z-10">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-4 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
