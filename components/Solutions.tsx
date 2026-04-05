import React from 'react';
import { SOLUTIONS } from '../constants';
import type { Solution } from '../types';

const SolutionCard: React.FC<{ solution: Solution }> = ({ solution }) => {
  const Icon = solution.icon;
  return (
    <div className="flex items-start space-x-4 p-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-600 text-white">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{solution.title}</h3>
        <p className="mt-1 text-base text-gray-600">{solution.description}</p>
      </div>
    </div>
  );
};

const Solutions: React.FC = () => {
  return (
    <section className="py-20 bg-white" id="solutions">
      <div className="container mx-auto px-6">
        <div className="lg:text-center mb-16">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Soluciones Completas</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Descubra la mejor plataforma del mundo, creada con soluciones que se adaptan a su crecimiento
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
            Desde la gestión hasta la creación de contenido, tenemos todo lo que necesita para triunfar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
          {SOLUTIONS.map((solution, index) => (
            <SolutionCard key={index} solution={solution} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
