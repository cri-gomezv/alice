import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-indigo-700 text-white overflow-hidden" id="home">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-indigo-700 to-purple-800"></div>
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-400 rounded-full opacity-20 blur-3xl"></div>

      <div className="container mx-auto px-6 py-24 md:py-36 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <span className="inline-block bg-white/10 border border-white/20 text-indigo-100 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            IA Comercial · Crédito Hipotecario
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Entrena a tu fuerza comercial para{' '}
            <span className="text-yellow-300">vender más créditos hipotecarios</span>{' '}
            con IA
          </h1>

          <p className="text-lg md:text-xl text-indigo-200 max-w-3xl mx-auto mb-10 leading-relaxed">
            Alejandra es una mentora conversacional que simula clientes reales, evalúa a tus ejecutivos
            y los lleva a cerrar más negocios, más rápido.
          </p>

          {/* Impact bullets */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 text-sm font-medium">
            {[
              '✓ Simulación real de clientes hipotecarios',
              '✓ Evaluación automática según políticas del banco',
              '✓ Feedback inmediato y scoring por desempeño',
            ].map((item) => (
              <span key={item} className="bg-white/10 border border-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#cta"
              className="bg-yellow-400 text-gray-900 font-bold py-4 px-10 rounded-xl text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Solicitar demo personalizada
            </a>
            <a
              href="#how-it-works"
              className="bg-white/10 border-2 border-white/30 text-white font-bold py-4 px-10 rounded-xl text-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              Ver simulación real →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
