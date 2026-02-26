import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '@/i18n';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, CheckCircle, Star, Package, Headphones } from 'lucide-react';

export default function CustomerRegister() {
  const [, navigate] = useLocation();
  const { signUp, user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError(t.auth.enterName);
      return false;
    }
    if (!formData.email.trim()) {
      setError(t.auth.enterEmail);
      return false;
    }
    if (formData.password.length < 6) {
      setError(t.auth.passwordTooShort);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.passwordsNoMatch);
      return false;
    }
    if (!acceptTerms) {
      setError(t.auth.mustAcceptTerms);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error, needsConfirmation } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
          phone: formData.phone,
        }
      );

      if (error) {
        if (error.message.includes('already registered')) {
          setError(t.auth.emailAlreadyRegistered);
        } else {
          setError(error.message);
        }
      } else if (needsConfirmation) {
        setSuccess(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(t.auth.registrationError);
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">{t.auth.registrationSuccess}</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              {t.auth.confirmEmailSent.replace('{email}', formData.email)}
            </p>
            <div className="space-y-3">
              <Link href="/auth/login" className="block w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">
                {t.auth.goToLogin}
              </Link>
              <Link href="/" className="block w-full py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                {t.auth.continueShoppingBtn}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 bg-slate-950 flex-col relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil" className="h-10 rounded-lg" />
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                Vytvorte si<br />
                <span className="text-blue-400">bezplatný účet</span>
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Registrácia trvá len pár sekúnd a odomkne vám exkluzívne výhody.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Vernostný program</p>
                  <p className="text-slate-400 text-xs mt-0.5">Zbierajte body pri každom nákupe</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Sledovanie objednávok</p>
                  <p className="text-slate-400 text-xs mt-0.5">Prehľad všetkých vašich nákupov</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Prioritná podpora</p>
                  <p className="text-slate-400 text-xs mt-0.5">Rýchlejšie vybavenie požiadaviek</p>
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
            {t.auth.haveAccount}{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              {t.auth.loginHere}
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-4 lg:px-16">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-6 text-center">
              <Link href="/">
                <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil" className="h-10 rounded-lg mx-auto mb-4" />
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{t.auth.createAccount}</h1>
              <p className="text-slate-500 text-sm">{t.auth.registerAndShop}</p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-red-500 font-bold text-xs">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.auth.fullName} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm text-slate-900 placeholder-slate-400 outline-none"
                    placeholder="Jan Novak"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.auth.email} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm text-slate-900 placeholder-slate-400 outline-none"
                    placeholder="vas@email.sk"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.checkout.phoneOptional}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm text-slate-900 placeholder-slate-400 outline-none"
                    placeholder="+421 900 000 000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t.auth.password} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm text-slate-900 placeholder-slate-400 outline-none"
                      placeholder="••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t.auth.confirmPassword} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm text-slate-900 placeholder-slate-400 outline-none"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 border-slate-300 rounded accent-blue-600"
                />
                <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                  {t.auth.agreeToTerms}{' '}
                  <Link href="/obchodne-podmienky" className="text-blue-600 hover:underline">
                    {t.auth.termsAndConditions}
                  </Link>{' '}
                  {t.auth.and}{' '}
                  <Link href="/ochrana-osobnych-udajov" className="text-blue-600 hover:underline">
                    {t.auth.privacyPolicy}
                  </Link>
                </label>
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
                    {t.auth.registering}
                  </span>
                ) : (
                  t.auth.registerButton
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
