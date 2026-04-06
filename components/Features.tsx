import React from 'react';

const features = [
  {
    emoji: '🗣️',
    title: 'Simula conversaciones reales',
    description: 'Alejandra actúa como un cliente hipotecario real: hace preguntas, plantea dudas y reacciona de forma natural a cada respuesta del ejecutivo.',
  },
  {
    emoji: '🔍',
    title: 'Detecta errores comerciales en tiempo real',
    description: 'Identifica oportunidades perdidas, argumentos débiles y fallas de cumplimiento en el momento exacto en que ocurren.',
  },
  {
    emoji: '📊',
    title: 'Evalúa según las reglas del banco',
    description: 'Cada interacción se mide con los criterios de tu institución: políticas comerciales, regulaciones y estándares de calidad de atención.',
  },
  {
    emoji: '🏆',
    title: 'Entrega puntajes y recomendaciones',
    description: 'Al final de cada simulación, el ejecutivo recibe un score detallado con acciones concretas para mejorar en la próxima sesión.',
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Qué es Alejandra</span>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Una mentora IA que entrena, evalúa<br className="hidden md:block" /> y mejora a tus ejecutivos de crédito
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            Alejandra no es un LMS. Es un sistema de entrenamiento activo que convierte cada sesión
            en una oportunidad real de mejora comercial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 text-center"
            >
              <div className="text-5xl mb-5">{f.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
