import React from 'react';

const Testimonial: React.FC = () => {
  return (
    <section className="bg-indigo-800 text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <svg className="h-12 w-12 text-indigo-400 mx-auto mb-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M9.33 2C5.02 2 2 5.02 2 9.33c0 4.31 3.02 7.33 7.33 7.33 1.28 0 2.47-.32 3.54-1.01-.2 1.83-1.09 4.37-3.23 6.51C7.5 24.3 4.96 25.19 3.13 25.39c1.07 1.07 2.26 1.76 3.27 2.77C17.34 29.33 28 17.67 28 9.33 28 5.02 24.98 2 20.67 2c-4.31 0-7.33 3.02-7.33 7.33 0 1.28.32 2.47 1.01 3.54-1.83.2-4.37 1.09-6.51 3.23" />
          </svg>

          <p className="text-2xl md:text-3xl font-medium leading-relaxed italic text-white">
            "Con Alejandra logramos que nuestros ejecutivos practiquen conversaciones de crédito hipotecario
            con clientes simulados todos los días. En ocho semanas, la tasa de cierre del equipo
            mejoró notablemente y los errores de cumplimiento prácticamente desaparecieron."
          </p>

          <div className="mt-10 flex items-center justify-center gap-5">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold shadow-lg">
              MR
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold">María Rodríguez</p>
              <p className="text-indigo-300 text-sm">Gerente de Capacitación Comercial · Banco Regional</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
