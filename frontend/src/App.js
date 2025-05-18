import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PacienteForm from "./features/paciente/PacienteForm";
import PacienteLista from "./features/paciente/PacienteLista";
import EditarPaciente from "./features/paciente/EditarPaciente";
import NewDiagnostico from "./features/diagnostico/NewDiagnostico";
import Home from "./features/Home";

function AppWrapper() {
  const location = useLocation();
  const isDiagnosticoRoute = location.pathname.startsWith("/pacientes/diagnostico");

  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} />

      {isDiagnosticoRoute ? (
        <Routes>
          <Route path="/pacientes/diagnostico/:id" element={<NewDiagnostico />} />
        </Routes>
      ) : (
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pacientes" element={<PacienteForm />} />
            <Route path="/pacientes/lista" element={<PacienteLista />} />
            <Route path="/pacientes/editar/:id" element={<EditarPaciente />} />
          </Routes>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
