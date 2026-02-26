import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '@/i18n';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Smartphone, Shield, Zap } from 'lucide-react';

export default function CustomerLogin() {
  const [, navigate] = useLocation();
  const { signIn, user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.id) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError(t.auth.invalidCredentials);
        } else if (error.message.includes('Email not confirmed')) {
          setError(t.auth.emailNotConfirmed);
        } else {
          setError(error.message);
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(t.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 flex-col relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil" className="h-10 rounded-lg" />
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Váš obchod<br />
                <span className="text-blue-400">s elektronikou</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Prihlásením získate prístup k histórii objednávok, vernostným bodom a personalizovaným ponukám.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Tisíce produktov</p>
                  <p className="text-slate-400 text-xs mt-0.5">Smartfóny, tablety, príslušenstvo a viac</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Bezpečné platby</p>
                  <p className="text-slate-400 text-xs mt-0.5">SSL šifrovanie a overené platobné metódy</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Rýchle doručenie</p>
                  <p className="text-slate-400 text-xs mt-0.5">Odosielame v deň objednávky</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="flex items-center justify-between p-6 lg:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            {t.auth.backToShop}
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {t.auth.noAccount}{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              {t.auth.register}
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-16">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-8 text-center">
              <Link href="/">
                <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil" className="h-10 rounded-lg mx-auto mb-4" />
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{t.auth.welcomeBack}</h1>
              <p className="text-slate-500 text-sm">{t.auth.loginToAccount}</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-red-500 font-bold text-xs">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm text-slate-900 placeholder-slate-400 outline-none"
                    placeholder="vas@email.sk"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm text-slate-900 placeholder-slate-400 outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 border-2 border-slate-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all"></div>
                  </div>
                  <span className="text-sm text-slate-600">{t.auth.rememberMe}</span>
                </label>
                <Link href="/reset-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  {t.auth.forgotPassword}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm shadow-blue-600/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t.auth.loggingIn}
                  </span>
                ) : (
                  t.auth.login
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Doprava zadarmo</p>
                  <p className="text-xs text-slate-400 mt-0.5">od 49 €</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Vrátenie</p>
                  <p className="text-xs text-slate-400 mt-0.5">do 14 dní</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Podpora</p>
                  <p className="text-xs text-slate-400 mt-0.5">7 dní v týždni</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
