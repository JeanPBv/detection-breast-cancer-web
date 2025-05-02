import React, { useEffect, useState } from "react";
import { obtenerPacientes } from "./pacienteApi";
import "./PacienteForm.css";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaChevronLeft, FaChevronRight} from "react-icons/fa";


function PacienteLista() {
  const [pacientes, setPacientes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const limite = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerPacientes(pagina, limite);
        setPacientes(data);
      } catch (error) {
        console.error("Error al obtener pacientes:", error);
      }
    };
    fetchData();
  }, [pagina]);

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Pacientes registrados:</h2>
        <button className="btn-registrar" onClick={() => navigate("/pacientes")}>
          <FaPlus /> Registrar paciente
        </button>
      </div>

      <table className="tabla-pacientes">
        <thead>
          <tr>
            <th >Nombre</th>
            <th>Apellido</th>
            <th className="centrado">DNI</th>
            <th className="centrado">Edad</th>
            <th>Sexo</th>
            <th className="centrado">Acción</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.apellido}</td>
              <td className="centrado">{p.dni}</td>
              <td className="centrado">{p.edad}</td>
              <td>{p.sexo === "F" ? "Femenino" : "Masculino"}</td>
              <td className="centrado">
                <span title="Editar" onClick={() => navigate(`/pacientes/editar/${p.id}`)}>
                  <FaEdit style={{ cursor: "pointer" }} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="paginacion">
        <button onClick={() => setPagina(p => Math.max(p - 1, 1))}>
          <FaChevronLeft />
        </button>
        <span className="pagina-label">Página {pagina}</span>
        <button onClick={() => setPagina(p => p + 1)} disabled={pacientes.length < limite}
          title={pacientes.length < limite ? "Fin de resultados" : ""}>
          <FaChevronRight />
        </button>
      </div>

    </div>
  );
}

export default PacienteLista;
