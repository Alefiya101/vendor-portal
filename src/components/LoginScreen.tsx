import React, { useState, useEffect } from 'react';
import { Smartphone, ArrowRight, Store, Package, Users, Shield, CheckCircle2, Building2, Sparkles, User } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

interface LoginScreenProps {
  onLogin: (role: string) => void;
  initialRole?: string;
  portalTitle?: string;
  allowedRoles?: string[]; // If provided, only show these roles
}

export function LoginScreen({ onLogin, initialRole, portalTitle, allowedRoles }: LoginScreenProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'role' | 'onboarding'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole || '');
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    city: '',
    gst: ''
  });

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setStep('otp');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      if (initialRole) {
        setStep('onboarding');
      } else {
        setStep('role');
      }
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setStep('onboarding');
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  const getPortalName = () => {
    if (portalTitle) return portalTitle;
    switch(initialRole) {
      case 'admin': return 'Admin Console';
      case 'vendor': return 'Vendor Central';
      case 'buyer': return 'Shop Owner Portal';
      case 'designer': return 'Manufacturing Hub';
      case 'stitching-master': return 'Manufacturing Hub';
      case 'vendor-agent': return 'Agent Portal';
      case 'buyer-agent': return 'Agent Portal';
      default: return 'B2B Portal';
    }
  };

  const isRoleAllowed = (role: string) => {
    if (!allowedRoles) return true;
    return allowedRoles.includes(role);
  };

  const features = [
    {
      icon: Package,
      title: 'Bulk Pricing & MOQ',
      description: 'Minimum order quantities from 10 pieces with wholesale pricing'
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'All products verified by Tashivar quality assurance team'
    },
    {
      icon: CheckCircle2,
      title: 'Pan-India Delivery',
      description: 'Fast shipping to 500+ cities with real-time tracking'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="space-y-8 lg:pr-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Tashivar</h1>
                  <p className="text-indigo-600 font-semibold">{getPortalName()}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
                  India's Premier B2B Ethnic Fashion Marketplace
                </h2>
                <p className="text-xl text-slate-600">
                  Connect with verified vendors, browse 10,000+ SKUs, and scale your ethnic wear business
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{feature.title}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">500+</div>
                <div className="text-sm text-slate-600 font-medium mt-1">Active Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">10K+</div>
                <div className="text-sm text-slate-600 font-medium mt-1">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">2000+</div>
                <div className="text-sm text-slate-600 font-medium mt-1">Shop Owners</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div>
            <Card className="p-8 lg:p-10 border-0 shadow-xl">
              {/* Phone Step */}
              {step === 'phone' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome to {getPortalName()}</h3>
                    <p className="text-slate-600">Enter your phone number to get started</p>
                  </div>

                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number</label>
                      <div className="flex gap-3">
                        <div className="w-20 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-semibold text-slate-900">
                          +91
                        </div>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10-digit number"
                          maxLength={10}
                          className="flex-1"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={phone.length !== 10}
                      className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Send OTP
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>

                  <p className="text-xs text-center text-slate-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              )}

              {/* OTP Step */}
              {step === 'otp' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Verify OTP</h3>
                    <p className="text-slate-600">
                      We've sent a 6-digit code to<br />
                      <span className="font-semibold text-slate-900">+91 {phone}</span>
                    </p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Enter OTP</label>
                      <Input
                        type="tel"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={otp.length !== 6}
                      className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Verify & Continue
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>

                  <div className="text-center space-y-2">
                    <button className="text-sm text-indigo-600 font-semibold hover:text-indigo-700">
                      Resend OTP
                    </button>
                    <p className="text-xs text-slate-500">00:45 remaining</p>
                  </div>

                  <button 
                    onClick={() => setStep('phone')}
                    className="text-sm text-slate-600 hover:text-slate-900 w-full text-center"
                  >
                    ← Change Phone Number
                  </button>
                </div>
              )}

              {/* Role Selection (Only shown if no initialRole) */}
              {step === 'role' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Select Your Role</h3>
                    <p className="text-slate-600">Choose how you'll be using Tashivar</p>
                  </div>

                  <div className="space-y-3">
                    {isRoleAllowed('buyer') && (
                      <button
                        onClick={() => handleRoleSelect('buyer')}
                        className="w-full p-5 border-2 border-slate-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 group-hover:bg-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                            <Store className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900 mb-1">Shop Owner / Buyer</h4>
                            <p className="text-sm text-slate-600">Browse and purchase ethnic wear products in bulk</p>
                          </div>
                        </div>
                      </button>
                    )}

                    {isRoleAllowed('vendor') && (
                      <button
                        onClick={() => handleRoleSelect('vendor')}
                        className="w-full p-5 border-2 border-slate-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-emerald-100 group-hover:bg-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                            <Package className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900 mb-1">Vendor / Designer</h4>
                            <p className="text-sm text-slate-600">List and sell your ethnic wear products to retailers</p>
                          </div>
                        </div>
                      </button>
                    )}

                    {isRoleAllowed('designer') && (
                      <button
                        onClick={() => handleRoleSelect('designer')}
                        className="w-full p-5 border-2 border-slate-200 rounded-2xl hover:border-pink-600 hover:bg-pink-50 transition-all group text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-pink-100 group-hover:bg-pink-600 rounded-xl flex items-center justify-center transition-colors">
                            <Sparkles className="w-6 h-6 text-pink-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900 mb-1">Designer</h4>
                            <p className="text-sm text-slate-600">Handle design and embroidery work for orders</p>
                          </div>
                        </div>
                      </button>
                    )}

                    {isRoleAllowed('stitching-master') && (
                      <button
                        onClick={() => handleRoleSelect('stitching-master')}
                        className="w-full p-5 border-2 border-slate-200 rounded-2xl hover:border-purple-600 hover:bg-purple-50 transition-all group text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-600 rounded-xl flex items-center justify-center transition-colors">
                            <Building2 className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900 mb-1">Stitching Master</h4>
                            <p className="text-sm text-slate-600">Manage stitching and finishing work for products</p>
                          </div>
                        </div>
                      </button>
                    )}

                    {isRoleAllowed('vendor-agent') && (
                      <button
                        onClick={() => handleRoleSelect('vendor-agent')}
                        className="w-full p-5 border-2 border-slate-200 rounded-2xl hover:border-teal-600 hover:bg-teal-50 transition-all group text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-teal-100 group-hover:bg-teal-600 rounded-xl flex items-center justify-center transition-colors">
                            <User className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900 mb-1">Vendor Onboarding Agent</h4>
                            <p className="text-sm text-slate-600">Earn commission on all orders from vendors you onboard</p>
                          </div>
                        </div>
                      </button>
                    )}

                    {isRoleAllowed('buyer-agent') && (
                      <button
                        onClick={() => handleRoleSelect('buyer-agent')}
                        className="w-full p-5 border-2 border-slate-200 rounded-2xl hover:border-cyan-600 hover:bg-cyan-50 transition-all group text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-cyan-100 group-hover:bg-cyan-600 rounded-xl flex items-center justify-center transition-colors">
                            <User className="w-6 h-6 text-cyan-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900 mb-1">Buyer Onboarding Agent</h4>
                            <p className="text-sm text-slate-600">Earn commission on all orders from buyers you onboard</p>
                          </div>
                        </div>
                      </button>
                    )}

                    {isRoleAllowed('admin') && (
                      <button
                        onClick={() => handleRoleSelect('admin')}
                        className="w-full p-5 border-2 border-slate-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-amber-100 group-hover:bg-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                            <Shield className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900 mb-1">Tashivar Admin</h4>
                            <p className="text-sm text-slate-600">Manage platform, vendors, and shop owners</p>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Onboarding */}
              {step === 'onboarding' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Profile</h3>
                    <p className="text-slate-600">Tell us a bit about yourself to get started</p>
                  </div>

                  <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        {selectedRole === 'buyer' ? 'Shop Name *' : selectedRole === 'vendor' ? 'Business Name *' : 'Organization *'}
                      </label>
                      <Input
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        placeholder={selectedRole === 'buyer' ? 'e.g., Kumar Fashion Hub' : 'Enter business name'}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">City *</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="e.g., Mumbai"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">GST Number</label>
                        <Input
                          value={formData.gst}
                          onChange={(e) => setFormData({...formData, gst: e.target.value})}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-6"
                    >
                      Complete Setup
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>

                  {!initialRole && (
                    <button 
                      onClick={() => setStep('role')}
                      className="text-sm text-slate-600 hover:text-slate-900 w-full text-center"
                    >
                      ← Change Role
                    </button>
                  )}
                </div>
              )}
            </Card>

            <p className="text-center text-sm text-slate-500 mt-6">
              Need help? <a href="#" className="text-indigo-600 font-semibold hover:text-indigo-700">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}