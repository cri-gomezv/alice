import React from 'react';

const steps = [
  {
    number: '01',
    title: 'El ejecutivo conversa con Alejandra',
    description: 'Alejandra actúa como un cliente hipotecario real. La conversación es libre, natural y desafiante, igual que en una visita comercial.',
    color: 'bg-indigo-600',
  },
  {
    number: '02',
    title: 'Alejandra analiza la interacción en tiempo real',
    description: 'Procesa cada argumento, detección de oportunidades perdidas y evalúa el cumplimiento de las políticas del banco mientras ocurre la conversación.',
    color: 'bg-purple-600',
  },
  {
    number: '03',
    title: 'Evalúa según políticas comerciales',
    description: 'Aplica las reglas de tu institución: tasas, plazos, perfil de riesgo del cliente, criterios de calificación y estándares de atención.',
    color: 'bg-indigo-500',
  },
  {
    number: '04',
    title: 'Entrega score + feedback + mejoras',
    description: 'El ejecutivo recibe un puntaje detallado por dimensión: apertura, manejo de objeciones, cierre, cumplimiento. Con recomendaciones concretas.',
    color: 'bg-emerald-600',
  },
  {
    number: '05',
    title: 'El ejecutivo repite y mejora',
    description: 'Cada sesión es una oportunidad de práctica sin consecuencias reales. La repetición guiada genera hábitos comerciales sólidos y medibles.',
    color: 'bg-amber-500',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Cómo funciona</span>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            De la práctica a los resultados en minutos
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-600">
            Un ciclo continuo de simulación, evaluación y mejora que convierte a cada ejecutivo
            en un experto en la venta de créditos hipotecarios.
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative">
          {/* Timeline line */}
          <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-indigo-100 hidden sm:block"></div>

          <div className="space-y-10">
            {steps.map((step, i) => (
              <div key={step.number} className="flex gap-6 items-start relative">
                {/* Circle */}
                <div className={`flex-shrink-0 w-18 h-18 rounded-full ${step.color} text-white font-extrabold text-lg flex items-center justify-center shadow-lg z-10 w-16 h-16`}>
                  {step.number}
                </div>
                {/* Content */}
                <div className="bg-white rounded-2xl shadow-md p-6 flex-1 border border-gray-100 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
