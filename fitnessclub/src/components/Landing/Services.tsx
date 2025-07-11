import React from 'react';
import { Dumbbell, Waves, Sparkles, Clock, Users, Star } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: Dumbbell,
      title: 'Premium Gym',
      description: 'State-of-the-art equipment and personalized training programs',
      features: ['24/7 Access', 'Personal Training', 'Group Classes', 'Nutrition Guidance'],
      packages: [
        { name: 'Daily Pass', price: 15, sessions: 1 },
        { name: 'Weekly Pass', price: 80, sessions: 7 },
        { name: 'Monthly Pass', price: 250, sessions: 30 }
      ],
      color: 'from-orange-500 to-orange-600',
      image: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      icon: Waves,
      title: 'Luxury Sauna',
      description: 'Relax and rejuvenate in our premium sauna facilities',
      features: ['Finnish Sauna', 'Steam Room', 'Aromatherapy', 'Relaxation Area'],
      packages: [
        { name: '5 Sessions', price: 120, sessions: 5 },
        { name: '10 Sessions', price: 200, sessions: 10 },
        { name: 'Monthly Unlimited', price: 350, sessions: 'Unlimited' }
      ],
      color: 'from-orange-500 to-orange-600',
      image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      icon: Sparkles,
      title: 'Therapeutic Massage',
      description: 'Professional massage therapy for recovery and wellness',
      features: ['Deep Tissue', 'Sports Massage', 'Relaxation', 'Hot Stone'],
      packages: [
        { name: 'Single Session', price: 80, sessions: 1 },
        { name: '5 Session Bundle', price: 350, sessions: 5 },
        { name: '10 Session Bundle', price: 650, sessions: 10 }
      ],
      color: 'from-orange-500 to-orange-600',
      image: 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Premium
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-500">
              Services
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose from our range of premium services designed to elevate your fitness and wellness experience.
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-16">
          {services.map((service, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
            >
              {/* Image */}
              <div className="flex-1 relative group">
                <div className="relative overflow-hidden rounded-3xl">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Icon */}
                  <div className={`absolute top-6 left-6 w-16 h-16 rounded-2xl bg-gradient-to-r ${service.color} p-4 backdrop-blur-sm`}>
                    <service.icon className="w-full h-full text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-8">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {service.title}
                  </h3>
                  <p className="text-xl text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color}`} />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Packages */}
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-white">Available Packages</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {service.packages.map((pkg, pkgIndex) => (
                      <div
                        key={pkgIndex}
                        className="bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-gray-800 hover:border-orange-500/50 transition-all duration-300 group"
                      >
                        <div className="text-center">
                          <h5 className="font-semibold text-white mb-2">{pkg.name}</h5>
                          <div className="text-2xl font-bold text-orange-500 mb-1">${pkg.price}</div>
                          <div className="text-sm text-gray-400">{pkg.sessions} sessions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button className={`bg-gradient-to-r ${service.color} text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105`}>
                  Book {service.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;