import React from 'react';
import logo from '../logo.svg';
import './Home.css';
import NavBar from "./components/NavBar";

function Home() {
  return (
    <div className="home-container">
      <NavBar />
      <div className="App center-content">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>💻 TALLER INTEGRADOR 💻</h1>
          <p>¡Sprint 1°!</p>
        </header>
      </div>
    </div>
  );
}

export default Home;
