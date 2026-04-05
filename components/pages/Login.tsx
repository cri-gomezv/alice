import React, { useState } from 'react';
import { BriefcaseIcon } from '../IconComponents';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
  onNavigateHome: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'student' && password === '123') {
      setError('');
      onLoginSuccess(username);
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center cursor-pointer" onClick={onNavigateHome}>
                <BriefcaseIcon className="h-10 w-auto text-indigo-600" />
                <span className="ml-3 text-3xl font-bold text-gray-800">TalentFlow</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Inicia sesión en tu cuenta
            </h2>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Usuario
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="student"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="123"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm text-center font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Iniciar sesión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974&auto=format&fit=crop"
          alt="Learning environment"
        />
         <div className="absolute inset-0 bg-indigo-800 mix-blend-multiply"></div>
         <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
            <h1 className="text-4xl font-bold tracking-tight">Transforme su potencial.</h1>
            <p className="mt-4 text-lg text-indigo-200 max-w-md">Una plataforma de aprendizaje impulsada por IA diseñada para su éxito.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;