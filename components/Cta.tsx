import React from 'react';

const Cta: React.FC = () => {
  return (
    <section className="bg-gray-50" id="cta">
      <div className="container mx-auto px-6 py-20">
        <div className="bg-indigo-700 rounded-2xl shadow-2xl p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-700 to-purple-800 opacity-80"></div>
            <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Empiece a mejorar su aprendizaje hoy mismo
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-indigo-200">
                    TalentFlow es interesante para los alumnos, intuitivo para los administradores y transformador para las organizaciones. Pruebe el LMS número 1 hoy mismo.
                </p>
                <div className="mt-8">
                    <a
                        href="#"
                        className="inline-block bg-white text-indigo-600 font-bold py-3 px-10 rounded-lg text-lg hover:bg-indigo-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Solicitar una demo
                    </a>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;
