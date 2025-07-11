import React from 'react';
import { QrCode, Calendar, CreditCard, BarChart3, Shield, Smartphone, ArrowRight } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR Code Access',
      description: 'Seamless entry with personalized QR codes. No more cards or keys - just scan and go.',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: Calendar,
      title: 'Smart Booking',
      description: 'Book your favorite services with intelligent scheduling and real-time availability.',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: CreditCard,
      title: 'Payment Tracking',
      description: 'Monitor your payments, packages, and remaining sessions all in one place.',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Track your fitness journey with detailed analytics and progress reports.',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and privacy measures.',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Optimized for mobile devices with a responsive design that works everywhere.',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-500">
              Modern Fitness
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to manage your fitness journey, from QR code access to detailed analytics.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 hover:border-orange-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-full h-full text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-orange-500 font-medium">
            <span>And many more features to discover</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;