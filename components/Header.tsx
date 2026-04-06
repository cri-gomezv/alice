import React, { useState } from 'react';
import { BriefcaseIcon } from './IconComponents';
import type { Page } from '../App';

interface HeaderProps {
  user: string | null;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Qué es Alejandra', href: 'features' },
    { name: 'Cómo funciona', href: 'how-it-works' },
    { name: 'Resultados', href: 'results' },
    { name: 'Implementación', href: 'services' },
    { name: 'FAQ', href: 'faq' },
  ];

  const handleNavClick = (href: string) => {
    onNavigate('home');
    setTimeout(() => {
      const element = document.getElementById(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
            <span className="ml-3 text-2xl font-bold text-gray-800">Alejandra</span>
            <span className="ml-2 hidden lg:inline text-xs text-indigo-500 font-medium border border-indigo-200 rounded-full px-2 py-0.5">IA Comercial</span>
          </div>
          <div className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={`#${link.href}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="font-medium text-gray-700">Hola, {user}</span>
                <button onClick={onLogout} className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium text-sm">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onNavigate('login')} className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium text-sm">
                  Iniciar sesión
                </button>
                <a
                  href="#cta"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('cta');
                  }}
                  className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  Solicitar demo
                </a>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={`#${link.href}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    handleNavClick(link.href);
                  }}
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium py-2 text-center"
                >
                  {link.name}
                </a>
              ))}
              {user ? (
                <>
                  <span className="font-medium text-gray-700 text-center py-2">Hola, {user}</span>
                  <button onClick={() => { setIsMenuOpen(false); onLogout(); }} className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium py-2 text-center">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setIsMenuOpen(false); onNavigate('login'); }}
                    className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium py-2 text-center"
                  >
                    Iniciar sesión
                  </button>
                  <a
                    href="#cta"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      handleNavClick('cta');
                    }}
                    className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 text-center"
                  >
                    Solicitar demo
                  </a>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;