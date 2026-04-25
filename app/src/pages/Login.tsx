import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Wind } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect when authentication is successful
  useEffect(() => {
    if (shouldRedirect && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, shouldRedirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Login attempt:', { isLogin, email, hasPassword: !!password });

    try {
      let success: boolean;
      
      if (isLogin) {
        // For login, use email as username
        try {
          console.log('Calling login with:', email);
          success = await login(email, password);
          console.log('Login response:', success);
          
          if (!success) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Login failed";
          console.error('Login error caught:', error, errorMsg);
          toast({
            title: "Login Failed",
            description: errorMsg || "Invalid email or password",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      } else {
        // For registration, pass all required fields
        try {
          console.log('Calling register with:', { email, name });
          success = await register({
            username: email.split('@')[0], // Use part of email as username
            email: email,
            password: password,
            password2: password,
            first_name: name.split(' ')[0] || '',
            last_name: name.split(' ')[1] || '',
            location: 'Chennai',
          });
          console.log('Register response:', success);
          
          if (!success) {
            toast({
              title: "Registration Failed",
              description: "Failed to create account",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Registration failed";
          console.error('Register error caught:', error, errorMsg);
          toast({
            title: "Registration Failed",
            description: errorMsg || "Failed to create account",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      if (success) {
        toast({
          title: isLogin ? "Welcome back!" : "Account created!",
          description: "Redirecting to dashboard...",
        });
        // Set flag to trigger redirect when auth state updates
        setShouldRedirect(true);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: errorMsg || "An unexpected error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    toast({
      title: "Coming Soon",
      description: "Google OAuth login will be available soon",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 10 + 4}px`,
              height: `${Math.random() * 10 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 4 + 4}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center neon-glow"
            >
              <Wind className="w-7 h-7 text-primary-foreground" />
            </motion.div>
          </Link>
          <h1 className="font-display text-3xl font-bold mt-4 gradient-text">
            SkyBreath
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'Welcome back! login in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                  Processing...
                </span>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-secondary hover:bg-secondary/80 border border-border rounded-xl font-medium transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </motion.button>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-primary hover:text-accent font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
