'use client';

import { Heart, Target, Users, Award, Zap, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'AI-Powered',
      description: 'Advanced artificial intelligence to assist with medical research and analysis',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security measures',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Global Access',
      description: 'Access medical resources and research from anywhere in the world',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community Driven',
      description: 'We have a large community of healthcare professionals worldwide',
    },
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Compassion',
      description: 'We care deeply about improving healthcare outcomes for everyone',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Excellence',
      description: 'We strive for the highest standards in everything we do',
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Innovation',
      description: 'We continuously push boundaries to advance medical science',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-emerald-500/20 rounded-xl">
              <Heart className="h-12 w-12 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            About <span className="text-emerald-400">MEDA</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Medical Enlightened Digital Assistant - Empowering healthcare professionals with intelligent tools and resources
          </p>
        </div>


        <div className="mb-16">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              MEDA is dedicated to revolutionizing medical research and healthcare delivery through cutting-edge technology. 
              We provide healthcare professionals with intelligent tools, comprehensive resources, and a collaborative platform 
              to advance medical science and improve patient outcomes.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Our platform combines artificial intelligence, extensive medical databases, and a global community of experts 
              to create an unparalleled resource for medical professionals worldwide.
            </p>
          </div>
        </div>


        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="text-emerald-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>


        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 text-center"
              >
                <div className="text-emerald-400 mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>



        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Our Team</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
            <p className="text-gray-300 text-lg text-center leading-relaxed">
              MEDA is built by software engineers, and data scientists
              who share a common passion for advancing healthcare through technology. Our team with experience in technology to create innovative solutions that make a real difference.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Explore MEDA</h2>
            <p className="text-gray-400 mb-6">
              Chat with our ai assistant to get started and also read the latest news across the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
              >
                Explore Dashboard
              </Link>
              <Link
                href="/latest-news"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Read Latest News
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

