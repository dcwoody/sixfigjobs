import React from 'react';
import Hero from './NavBar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <Hero />
      <div className="flex-grow w-full">
        {children}
      </div>
      <Footer />
    </main>
  );
};

export default MainLayout;
