import React from 'react';

const roles = [
  {
    emoji: '👩‍🏫',
    color: 'bg-indigo-50 border-indigo-200',
    titleColor: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700',
    mode: 'Modo Profesor',
    title: 'Aprende las técnicas que cierran ventas',
    bullets: [
      'Técnicas de venta de créditos hipotecarios',
      'Manejo de objeciones de precio y plazo',
      'Estrategias de cierre efectivo',
      'Normativa y cumplimiento del banco',
    ],
  },
  {
    emoji: '🧑‍💼',
    color: 'bg-amber-50 border-amber-200',
    titleColor: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    mode: 'Modo Cliente',
    title: 'Practica con perfiles de clientes reales',
    bullets: [
      'Cliente indeciso que duda en comprometerse',
      'Cliente informado que compara con la competencia',
      'Cliente desconfiado con malas experiencias previas',
      'Cliente urgente que necesita respuesta rápida',
    ],
  },
  {
    emoji: '🏦',
    color: 'bg-emerald-50 border-emerald-200',
    titleColor: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    mode: 'Modo Evaluador',
    title: 'Recibe evaluación objetiva y accionable',
    bullets: [
      'Análisis de la conversación completa',
      'Aplicación de reglas comerciales del banco',
      'Score numérico por dimensión de desempeño',
      'Recomendaciones específicas para mejorar',
    ],
  },
];

const Solutions: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="solutions">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Tu ventaja competitiva</span>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Entrenamiento basado en roles reales
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-600">
            Alejandra adapta la experiencia según el rol activo. Cada modo entrega un valor distinto
            y complementario al ejecutivo de crédito.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((r) => (
            <div key={r.mode} className={`rounded-2xl border-2 ${r.color} p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
              <div className="text-5xl mb-4">{r.emoji}</div>
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${r.badge}`}>
                {r.mode}
              </span>
              <h3 className={`mt-4 text-2xl font-bold ${r.titleColor}`}>{r.title}</h3>
              <ul className="mt-5 space-y-3">
                {r.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="mt-0.5 text-gray-400">→</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
