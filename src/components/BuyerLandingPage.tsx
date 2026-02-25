import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, Package, Shield, Zap, CheckCircle, Star, ArrowRight, Sparkles, Lock, Clock, Users, ChevronRight, Play } from 'lucide-react';

export function BuyerLandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Package,
      title: 'Premium Ethnic Collection',
      description: 'Access thousands of premium kurtas, sherwanis, and indo-western wear directly from verified vendors',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Wholesale Pricing',
      description: 'Get exclusive B2B pricing with volume discounts and flexible MOQ starting from 10 pieces',
      color: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600'
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'All products verified by Tashivar with quality checks and easy returns',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      icon: Zap,
      title: 'Quick Dispatch',
      description: '24-48 hour dispatch with real-time tracking via Shiprocket and local delivery',
      color: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const stats = [
    { value: '5000+', label: 'Premium Products' },
    { value: '28+', label: 'Verified Vendors' },
    { value: '150+', label: 'Happy Retailers' },
    { value: '98%', label: 'On-Time Delivery' }
  ];

  const benefits = [
    'Direct vendor pricing without middlemen',
    'Exclusive Tashivar branded products',
    'Flexible payment terms',
    'Dedicated account manager',
    'Real-time inventory updates',
    'Easy reordering system'
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      shop: 'Kumar Fashion Hub, Mumbai',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      rating: 5,
      text: 'Tashivar has transformed my business! The quality is consistently excellent and the pricing is unbeatable.'
    },
    {
      name: 'Neha Singh',
      shop: 'Style Bazaar, Delhi',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      rating: 5,
      text: 'Fast delivery, amazing collection, and the support team is always there when I need them. Highly recommended!'
    },
    {
      name: 'Amit Patel',
      shop: 'Fashion Forward, Bangalore',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      rating: 5,
      text: 'The wholesale prices help me compete better. My customers love the quality of Tashivar products.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-70"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Tashivar</span>
                  <span className="block text-xs text-gray-600">B2B Portal</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900">For Vendors</button>
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900">Contact</button>
                <button 
                  onClick={onGetStarted}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/30"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" strokeWidth={2} />
                <span className="text-sm font-medium text-indigo-700">India's #1 Ethnic Fashion B2B Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Elevate Your
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Retail Business
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Access premium ethnic menswear at wholesale prices. Direct from verified vendors. 
                Guaranteed quality. Lightning-fast delivery.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={onGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 shadow-2xl shadow-indigo-500/40 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Ordering Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </button>
                <button className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-semibold hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 text-indigo-600" strokeWidth={2} />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-6">
                {benefits.slice(0, 3).map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400"
                    alt="Premium Kurta"
                    className="w-full h-64 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400"
                    alt="Sherwani"
                    className="w-full h-48 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img
                    src="https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=400"
                    alt="Indo Western"
                    className="w-full h-48 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1609873814058-a8928924184a?w=400"
                    alt="Collection"
                    className="w-full h-64 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-16 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Tashivar?</h2>
            <p className="text-xl text-gray-600">Everything you need to grow your retail business</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredFeature(idx)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="relative group"
                >
                  <div className={`p-6 bg-white border-2 border-gray-200 rounded-2xl transition-all ${
                    hoveredFeature === idx ? 'border-indigo-600 shadow-2xl -translate-y-2' : 'hover:border-gray-300'
                  }`}>
                    <div className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 transition-transform ${
                      hoveredFeature === idx ? 'scale-110' : ''
                    }`}>
                      <Icon className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                  {hoveredFeature === idx && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-20 -z-10`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Everything Your Business Needs
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join hundreds of successful retailers who trust Tashivar for their inventory needs
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                    </div>
                    <span className="text-gray-900 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                alt="Retail Store"
                className="relative w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Retailers Across India</h2>
            <p className="text-xl text-gray-600">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" strokeWidth={2} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.shop}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of retailers who are growing with Tashivar. Start ordering today!
          </p>
          <button 
            onClick={onGetStarted}
            className="group px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            Get Started Now
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="font-bold text-white">Tashivar</span>
              </div>
              <p className="text-sm">India's premier B2B ethnic fashion marketplace</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">For Buyers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Browse Products</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">For Vendors</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Become a Vendor</a></li>
                <li><a href="#" className="hover:text-white">Vendor Dashboard</a></li>
                <li><a href="#" className="hover:text-white">Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Tashivar B2B Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </div>
  );
}