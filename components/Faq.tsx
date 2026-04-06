import React, { useState } from 'react';

const faqs = [
  {
    question: '¿Cómo evalúa Alejandra a los ejecutivos?',
    answer: 'Alejandra analiza cada conversación en tiempo real usando criterios predefinidos por tu banco: identificación del perfil del cliente, presentación del producto, manejo de objeciones, propuesta de valor, cumplimiento normativo y calidad del cierre. Al final entrega un score por dimensión con feedback específico.',
  },
  {
    question: '¿Se adapta a las políticas de mi banco?',
    answer: 'Sí. Durante la implementación cargamos las políticas comerciales, tasas de referencia, productos hipotecarios y criterios de calificación de tu institución. Alejandra evalúa cada simulación usando exactamente esas reglas, no criterios genéricos.',
  },
  {
    question: '¿Puede simular distintos tipos de clientes?',
    answer: 'Sí. Alejandra puede actuar como cliente indeciso, cliente informado que compara con la competencia, cliente desconfiado con malas experiencias previas, cliente urgente y otros perfiles definidos según los casos más frecuentes de tu equipo comercial.',
  },
  {
    question: '¿Qué métricas entrega el sistema?',
    answer: 'Score por sesión, evolución del desempeño en el tiempo, comparativa entre ejecutivos del equipo, áreas más débiles por persona, tasa de cumplimiento normativo y recomendaciones de entrenamiento priorizado. Todo accesible desde el panel de seguimiento.',
  },
  {
    question: '¿Cuánto tiempo toma implementar Alejandra?',
    answer: 'El proceso completo toma entre 1 y 2 semanas. La primera semana configuramos el sistema con las políticas del banco. La segunda semana hacemos el onboarding del equipo. A partir de la tercera semana, los ejecutivos ya entrenan de forma autónoma con Alejandra.',
  },
  {
    question: '¿Se necesita conexión a internet?',
    answer: 'Para la conversación con el avatar de Alejandra y la evaluación con IA sí se requiere conexión. Sin embargo, la voz neuronal local (Piper TTS) puede funcionar offline una vez que el modelo esté descargado, lo que permite practicar la dicción y el ritmo sin depender de la red.',
  },
];

const FaqItem: React.FC<{ item: typeof faqs[0] }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left gap-4"
      >
        <h3 className="text-lg font-semibold text-gray-800">{item.question}</h3>
        <span className={`flex-shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
};

const Faq: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="faq">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">FAQ</span>
          <h2 className="mt-3 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Preguntas de negocio
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-600">
            Todo lo que necesitas saber para tomar la decisión de implementar Alejandra en tu equipo.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <FaqItem key={index} item={faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
