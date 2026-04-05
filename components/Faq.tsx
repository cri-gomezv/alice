import React, { useState } from 'react';
import { FAQS } from '../constants';
import type { FaqItem as FaqItemType } from '../types';

const FaqItem: React.FC<{ item: FaqItemType }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-800">{item.question}</h3>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}
      >
        <p className="text-gray-600 leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  );
};

const Faq: React.FC = () => {
  return (
    <section className="py-20 bg-white" id="faq">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            ¿Aún tiene preguntas? Aquí tiene algunas de las más comunes.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          {FAQS.map((faq, index) => (
            <FaqItem key={index} item={faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
