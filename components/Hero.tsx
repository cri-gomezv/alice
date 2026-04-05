import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-indigo-700 text-white" id="home">
       <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-purple-800 opacity-90"></div>
       <div 
        className="absolute inset-0 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')", opacity: 0.1 }}
      ></div>
      <div className="container mx-auto px-6 py-24 md:py-32 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
          LA MEJOR PLATAFORMA DE APRENDIZAJE CON IA DEL MUNDO
        </h1>
        <p className="text-lg md:text-xl text-indigo-200 max-w-3xl mx-auto mb-8">
          Descubra el poder ilimitado del aprendizaje inteligente. De la inteligencia a los resultados, TalentFlow le permite crear contenido, automatizar el trabajo y medir el impacto real desde una sola plataforma.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="#cta"
            className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-indigo-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Pruebe el LMS
          </a>
          <a
            href="#features"
            className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105"
          >
            Saber más
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
