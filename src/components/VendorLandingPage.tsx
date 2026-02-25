import React, { useState } from 'react';
import { Store, TrendingUp, DollarSign, Users, Zap, CheckCircle, Star, ArrowRight, Sparkles, Shield, Package, ChevronRight, Play, BarChart3, Globe, Rocket, ShoppingBag } from 'lucide-react';

export function VendorLandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Users,
      title: 'Access 150+ Retailers',
      description: 'Connect with verified shop owners across India looking for quality ethnic menswear',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: DollarSign,
      title: 'Guaranteed Payments',
      description: 'Set your prices, earn commission on every sale with transparent payment tracking',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      icon: BarChart3,
      title: 'Business Analytics',
      description: 'Track your sales, revenue, and inventory with real-time dashboard insights',
      color: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600'
    },
    {
      icon: Zap,
      title: 'Quick Onboarding',
      description: 'Start selling in 24 hours with our streamlined product approval process',
      color: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const stats = [
    { value: '₹45L+', label: 'Revenue Generated' },
    { value: '28', label: 'Active Vendors' },
    { value: '5000+', label: 'Products Listed' },
    { value: '95%', label: 'Order Success Rate' }
  ];

  const benefits = [
    'No listing or subscription fees',
    'Your products branded as "By Tashivar"',
    'Flexible commission structure',
    'Dedicated vendor support',
    'Bulk order management',
    'Real-time inventory sync'
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Sign Up & Verify',
      description: 'Create your vendor account and complete verification in minutes',
      icon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      step: '2',
      title: 'Add Products',
      description: 'Upload your catalog with pricing, images, and specifications',
      icon: Package,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      step: '3',
      title: 'Get Orders',
      description: 'Receive orders from retailers, confirm and fulfill them',
      icon: ShoppingBag,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      step: '4',
      title: 'Earn & Grow',
      description: 'Track earnings, get paid on time, and scale your business',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  const testimonials = [
    {
      name: 'Amit Sharma',
      business: 'Fashion Creations, Mumbai',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      rating: 5,
      text: "Tashivar helped us scale from 10 to 50+ regular clients. The platform is easy to use and payments are always on time."
    },
    {
      name: 'Priya Patel',
      business: 'Silk Paradise, Surat',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      rating: 5,
      text: "Best B2B platform for ethnic wear! Professional support team and the analytics dashboard helps me make better decisions."
    },
    {
      name: 'Vikram Singh',
      business: 'Royal Designs, Jaipur',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      rating: 5,
      text: "Within 3 months, my revenue doubled. The Tashivar branding adds credibility and helps sell faster."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 opacity-70"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Tashivar</span>
                  <span className="block text-xs text-gray-600">Vendor Portal</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900">For Buyers</button>
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900">Contact</button>
                <button 
                  onClick={onGetStarted}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30"
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full mb-6">
                <Rocket className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                <span className="text-sm font-medium text-emerald-700">Grow Your Business 3X Faster</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Sell to Retailers
                <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Across India
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join India's fastest-growing B2B ethnic fashion marketplace. Connect with verified retailers, 
                manage orders effortlessly, and grow your revenue.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={onGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-2xl shadow-emerald-500/40 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Become a Vendor
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </button>
                <button className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-semibold hover:border-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                  See How It Works
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                  <span className="text-sm text-gray-600">Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                  <span className="text-sm text-gray-600">24hr onboarding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                  <span className="text-sm text-gray-600">Instant payouts</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Your Vendor Dashboard</h3>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Live Preview</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹12.4L</p>
                      <p className="text-xs text-emerald-600 mt-1">↑ 23.5%</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Active Orders</p>
                      <p className="text-2xl font-bold text-gray-900">47</p>
                      <p className="text-xs text-blue-600 mt-1">+12 new</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">New Order #2025-089</p>
                        <p className="text-xs text-gray-600">Kumar Fashion Hub • 50 pieces</p>
                      </div>
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium">
                        Accept
                      </button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Payment Received</p>
                        <p className="text-xs text-gray-600">₹64,950 • Order #2025-087</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Start selling in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative">
                  <div className="text-center">
                    <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-8 h-8 ${item.color}`} strokeWidth={2} />
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-emerald-600">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                  {idx < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-transparent -z-10"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Vendors Love Tashivar</h2>
            <p className="text-xl text-gray-600">Everything you need to succeed</p>
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
                    hoveredFeature === idx ? 'border-emerald-600 shadow-2xl -translate-y-2' : 'hover:border-gray-300'
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

      {/* Benefits Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
                alt="Business Growth"
                className="relative w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for Your Success
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We provide everything you need to scale your ethnic fashion business
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-gray-900 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Hear from our thriving vendor community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-6 bg-white border border-emerald-200 rounded-2xl hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-emerald-400 text-emerald-400" strokeWidth={2} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Your Growth Journey Today
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join 28+ successful vendors who are scaling their business with Tashivar
          </p>
          <button 
            onClick={onGetStarted}
            className="group px-10 py-5 bg-white text-emerald-600 rounded-xl font-bold text-lg hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            Become a Vendor Now
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
          </button>
          <p className="text-sm text-emerald-100 mt-4">Free to join • No hidden fees • Start selling in 24 hours</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="font-bold text-white">Tashivar</span>
              </div>
              <p className="text-sm">Empowering ethnic fashion vendors across India</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">For Vendors</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Dashboard</a></li>
                <li><a href="#" className="hover:text-white">Add Products</a></li>
                <li><a href="#" className="hover:text-white">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">For Buyers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Browse Catalog</a></li>
                <li><a href="#" className="hover:text-white">Become a Buyer</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
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