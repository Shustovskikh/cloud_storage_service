import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <main className="home">
      <h1>Welcome to Cloud Storage Service</h1>
      <p>
        Manage and store your files securely with our cloud storage service, developed by Evgeny Shustovskikh. 
        This service ensures that your files are stored safely and can be accessed from anywhere at any time without payment for 30 calendar days.
      </p>
      <p>
        Whether you need to store important documents, images, or videos, our platform is designed to meet all your needs.
      </p>
      <section className="home-actions">
        <Link to="/login" className="button">Login</Link>
        <Link to="/register" className="button">Register</Link>
      </section>
    </main>
  );
};

export default Home;
