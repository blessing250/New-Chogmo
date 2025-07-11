import React from 'react';
import { ArrowRight, CheckCircle, Smartphone, QrCode } from 'lucide-react';

interface CTAProps {
  onGetStarted: () => void;
}

const CTA: React.FC<CTAProps> = ({ onGetStarted }) => {
  const benefits = [
    'Instant QR code access',
    'Smart booking system',
    'Payment tracking',
    'Progress analytics',
    '24/7 mobile access',
    'Premium support'
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-12 border border-gray-800 hover:border-orange-500/30 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-500">
                  Your Fitness?
                </span>
              </h2>
              
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Join thousands of members who have revolutionized their fitness journey with our 
                QR-powered management system. Start your transformation today.
              </p>

              {/* Benefits List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={onGetStarted}
                  className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 flex items-center justify-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                <button className="bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                  Schedule Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>

            {/* Visual Elements */}
            <div className="relative">
              <div className="relative">
                {/* Phone Mockup */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl transform rotate-6 hover:rotate-3 transition-transform duration-500">
                  <div className="bg-black rounded-2xl p-6 h-96 flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-white font-semibold mb-2">QR Access</h3>
                      <p className="text-gray-400 text-sm">Scan & Go</p>
                    </div>
                    <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-20 h-20 bg-black rounded grid grid-cols-3 gap-1 p-2">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-black'} rounded-sm`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;