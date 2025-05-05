import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PacienteForm from "./features/paciente/PacienteForm";
import PacienteLista from "./features/paciente/PacienteLista";
import EditarPaciente from "./features/paciente/EditarPaciente";
import NewDiagnostico from "./features/diagnostico/NewDiagnostico";
import Home from "./features/Home";

function App() {
  return (
    <Router>
      <div className="app-container">
        <ToastContainer position="top-right" autoClose={2500} />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/pacientes" element={<PacienteForm />} />
          <Route path="/pacientes/lista" element={<PacienteLista />} />
          <Route path="/pacientes/editar/:id" element={<EditarPaciente />} />
          <Route path="/pacientes/diagnostico/:id" element={<NewDiagnostico />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;