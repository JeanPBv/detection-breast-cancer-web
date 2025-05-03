import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PacienteForm from "./features/paciente/PacienteForm";
import PacienteLista from "./features/paciente/PacienteLista";
import EditarPaciente from "./features/paciente/EditarPaciente";
import NewDiagnostico from "./features/diagnostico/NewDiagnostico";
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={2500} />
      <Routes>
        <Route path="/" element={
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1>Mi primera app en React 🎉</h1>
              <p>¡Hola, mundo desde React!</p>
            </header>
          </div>
        } />
        <Route path="/pacientes" element={<PacienteForm />} />
        <Route path="/pacientes/lista" element={<PacienteLista />} />
        <Route path="/pacientes/editar/:id" element={<EditarPaciente />} />
        <Route path="/pacientes/diagnostico/:id" element={<NewDiagnostico/>} />
      </Routes>
    </Router>
  );
}

export default App;