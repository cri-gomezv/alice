import React from 'react';

const Cta: React.FC = () => {
  return (
    <section className="bg-gray-50" id="cta">
      <div className="container mx-auto px-6 py-20">
        <div className="relative bg-indigo-700 rounded-3xl shadow-2xl p-10 md:p-16 text-center text-white overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400 rounded-full opacity-30 blur-3xl"></div>

          <div className="relative z-10">
            <span className="inline-block bg-white/10 border border-white/20 text-indigo-100 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              Disponible para bancos y financieras
            </span>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5">
              Empiece a aumentar sus ventas<br className="hidden md:block" />
              <span className="text-yellow-300"> hipotecarias hoy</span>
            </h2>

            <p className="mt-2 max-w-2xl mx-auto text-lg text-indigo-200 leading-relaxed mb-10">
              Entrene a su equipo con simulaciones reales, evaluación automática y feedback
              inmediato. Sin meses de implementación. Sin excusas.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#"
                className="inline-block bg-yellow-400 text-gray-900 font-bold py-4 px-12 rounded-xl text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Solicitar demo personalizada →
              </a>
              <a
                href="#how-it-works"
                className="inline-block bg-white/10 border-2 border-white/30 text-white font-semibold py-4 px-10 rounded-xl text-lg hover:bg-white/20 transition-all duration-300"
              >
                Ver cómo funciona
              </a>
            </div>

            <p className="mt-8 text-indigo-300 text-sm">
              Sin compromisos. Configuración personalizada con las políticas de tu banco.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;
