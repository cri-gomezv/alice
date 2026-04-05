import React from 'react';
import { SERVICES } from '../constants';
import { CheckCircleIcon } from './IconComponents';

const Services: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50" id="services">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Servicios que le preparan para el éxito
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600">
            Somos más que una plataforma: somos su socio para el aprendizaje. Le ayudamos en cada etapa de su viaje, desde la configuración hasta la estrategia y la expansión.
          </p>
        </div>

        <div className="space-y-12">
          {SERVICES.map((serviceCategory) => (
            <div key={serviceCategory.category} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-3xl font-bold text-indigo-700 mb-6">{serviceCategory.category}</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {serviceCategory.items.map((item) => (
                  <div key={item.title} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">{item.title}</h4>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
