import React from 'react';
import { TESTIMONIAL } from '../constants';

const Testimonial: React.FC = () => {
  return (
    <section className="bg-indigo-800 text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <svg className="h-12 w-12 text-indigo-400 mx-auto mb-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M9.33 2C5.02 2 2 5.02 2 9.33c0 4.31 3.02 7.33 7.33 7.33 1.28 0 2.47-.32 3.54-1.01-.2 1.83-1.09 4.37-3.23 6.51-2.14 2.14-4.68 3.03-6.51 3.23.69 1.07 1.76 2.26 2.77 3.27C17.34 29.33 28 17.67 28 9.33 28 5.02 24.98 2 20.67 2c-4.31 0-7.33 3.02-7.33 7.33 0 1.28.32 2.47 1.01 3.54-1.83.2-4.37 1.09-6.51 3.23C5.69 18.24 4.8 20.78 4.57 22.61c-1.07-.69-2.26-1.76-3.27-2.77C.67 18.34 2 7.67 2 9.33 2 5.02 5.02 2 9.33 2z" />
          </svg>
          <p className="text-2xl md:text-3xl font-medium leading-relaxed italic">
            "{TESTIMONIAL.quote}"
          </p>
          <div className="mt-8">
            <img className="h-20 w-20 rounded-full mx-auto" src={TESTIMONIAL.image} alt={TESTIMONIAL.author} />
            <div className="mt-4">
              <p className="text-xl font-semibold">{TESTIMONIAL.author}</p>
              <p className="text-indigo-200">{TESTIMONIAL.title}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
