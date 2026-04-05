import React from 'react';
import { FEATURES } from '../constants';
import type { Feature } from '../types';

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => {
  const Icon = feature.icon;
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-6">
        <Icon className="h-8 w-8 text-indigo-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Una plataforma inteligente y adaptativa
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Trabajamos más para que su equipo pueda ofrecer un aprendizaje que realmente dé sus frutos.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
