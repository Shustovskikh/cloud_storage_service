import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

const App = () => (
  <Router>
    <div className="app-container">
      <Header />
      <main className="content">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  </Router>
);

export default App;
