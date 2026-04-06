import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Solutions from './components/Solutions';
import Services from './components/Services';
import HowItWorks from './components/HowItWorks';
import Results from './components/Results';
import Testimonial from './components/Testimonial';
import Faq from './components/Faq';
import Cta from './components/Cta';
import Footer from './components/Footer';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import TrainingPage from './components/pages/TrainingPage';
import MortgageGuidePage from './components/pages/MortgageGuidePage';

export type Page = 'home' | 'login' | 'dashboard' | 'training' | 'mortgage-guide';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<string | null>(null);

  const handleLoginSuccess = (username: string) => {
    setUser(username);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('home');
  };
  
  const navigate = (targetPage: Page, targetAnchor?: string) => {
    setPage(targetPage);
    setAnchor(targetAnchor || null);
    if (!targetAnchor) {
      window.scrollTo(0, 0);
    }
  };

  const renderPage = () => {
    switch(page) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} onNavigateHome={() => navigate('home')} />;
      case 'dashboard':
        return user ? <Dashboard user={user} onLogout={handleLogout} onNavigate={navigate} /> : <Login onLoginSuccess={handleLoginSuccess} onNavigateHome={() => navigate('home')}/>;
      case 'training':
        return <TrainingPage onBackToDashboard={() => navigate('dashboard')} onNavigate={navigate} />;
      case 'mortgage-guide':
        return <MortgageGuidePage onBackToTraining={() => navigate('training')} anchor={anchor} />;
      case 'home':
      default:
        return (
          <>
            <Header user={user} onNavigate={navigate} onLogout={handleLogout} />
            <main>
              <Hero />
              <Features />
              <Solutions />
              <HowItWorks />
              <Results />
              <Services />
              <Testimonial />
              <Faq />
              <Cta />
            </main>
            <Footer />
          </>
        );
    }
  }

  return (
    <div className="bg-white text-gray-800 font-sans">
      {renderPage()}
    </div>
  );
};

export default App;
