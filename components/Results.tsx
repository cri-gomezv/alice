import React from 'react';

const kpis = [
  {
    icon: '⏱️',
    metric: '-60%',
    label: 'Tiempo de capacitación',
    description: 'Los ejecutivos alcanzan nivel operativo mucho más rápido que con métodos tradicionales.',
    color: 'border-indigo-400',
  },
  {
    icon: '📈',
    metric: '+35%',
    label: 'Tasa de conversión',
    description: 'Más conversaciones terminan en cierre gracias a la práctica intensiva con perfiles reales.',
    color: 'border-emerald-400',
  },
  {
    icon: '⭐',
    metric: '+40%',
    label: 'Calidad de atención',
    description: 'Los clientes perciben ejecutivos más seguros, mejor informados y más empáticos.',
    color: 'border-amber-400',
  },
  {
    icon: '✅',
    metric: '-80%',
    label: 'Errores de cumplimiento',
    description: 'La evaluación automática según políticas del banco reduce errores normativos de forma drástica.',
    color: 'border-purple-400',
  },
];

const Results: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="results">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Resultados</span>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Impacto directo en ventas y desempeño
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-600">
            Métricas reales que muestran el impacto de Alejandra en equipos comerciales de banca hipotecaria.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {kpis.map((k) => (
            <div
              key={k.label}
              className={`bg-gray-50 rounded-2xl p-8 border-t-4 ${k.color} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="text-4xl mb-3">{k.icon}</div>
              <div className="text-5xl font-extrabold text-gray-900 mb-2">{k.metric}</div>
              <div className="text-lg font-bold text-gray-800 mb-3">{k.label}</div>
              <p className="text-gray-600 text-sm leading-relaxed">{k.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          * Métricas estimadas basadas en programas de entrenamiento comercial similares en el sector bancario.
        </p>
      </div>
    </section>
  );
};

export default Results;
