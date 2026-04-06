import React from 'react';
import { CheckCircleIcon } from './IconComponents';

const implementation = [
  {
    category: 'Configuración del sistema',
    icon: '⚙️',
    items: [
      { title: 'Integración con reglas de venta del banco', description: 'Cargamos los criterios comerciales, políticas de tasas y estándares de cumplimiento de tu institución.' },
      { title: 'Configuración de productos hipotecarios', description: 'Definimos los productos, rangos de montos, plazos y perfiles de cliente según tu catálogo actual.' },
    ],
  },
  {
    category: 'Puesta en marcha del equipo',
    icon: '🚀',
    items: [
      { title: 'Entrenamiento inicial del equipo', description: 'Sesión de onboarding para que los ejecutivos usen Alejandra desde el primer día sin fricción.' },
      { title: 'Panel de seguimiento de desempeño', description: 'Dashboard en tiempo real con scores individuales, tendencias del equipo y áreas críticas de mejora.' },
    ],
  },
];

const Services: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50" id="services">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Implementación</span>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Implementación rápida en tu equipo comercial
          </h2>
          <p className="mt-5 max-w-3xl mx-auto text-xl text-gray-600">
            En menos de dos semanas, tu equipo estará practicando con Alejandra usando los productos,
            políticas y perfiles de clientes reales de tu banco.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {implementation.map((block) => (
            <div key={block.category} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{block.icon}</span>
                <h3 className="text-2xl font-bold text-indigo-700">{block.category}</h3>
              </div>
              <div className="space-y-6">
                {block.items.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{item.title}</h4>
                      <p className="mt-1 text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline rápido */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-center text-xl font-bold text-gray-800 mb-8">Cronograma típico de implementación</h3>
          <div className="flex flex-col sm:flex-row justify-between gap-4 text-center">
            {[
              { week: 'Semana 1', action: 'Configuración y carga de políticas' },
              { week: 'Semana 2', action: 'Onboarding del equipo comercial' },
              { week: 'Semana 3', action: 'Prime sesiones con Alejandra' },
              { week: 'Semana 4+', action: 'Seguimiento y optimización' },
            ].map((t, i) => (
              <div key={t.week} className="flex-1">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-2">
                  {i + 1}
                </div>
                <div className="text-xs font-bold text-indigo-600 uppercase mb-1">{t.week}</div>
                <div className="text-sm text-gray-700">{t.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
