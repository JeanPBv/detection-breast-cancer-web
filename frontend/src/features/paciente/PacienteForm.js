import React, { useState } from "react";
import { registrarPaciente } from "./pacienteApi";
import { useNavigate } from "react-router-dom";
import "./PacienteForm.css";
import PacienteFormBase from "../components/PacienteFormBase";
import { toast } from "react-toastify";

function PacienteForm() {
    const [formData, setFormData] = useState({ nombre: "", apellido: "", dni: "", edad: "", sexo: "" });
    const [mensaje] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await registrarPaciente(formData);
          toast.success("Paciente registrado correctamente");
          setFormData({ nombre: "", apellido: "", dni: "", edad: "", sexo: "" });
          setTimeout(() => navigate("/pacientes/lista"), 1000);
        } catch (err) {
          if (err.response && err.response.data.detail === "DNI_DUPLICADO") {
            toast.error("El DNI ya está registrado.");
          } else {
            toast.error("Error al registrar paciente");
          }
        }
    };
    
    const camposCompletos = Object.values(formData).every(val => val !== "");

    return (
      <PacienteFormBase
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        mensaje={mensaje}
        modo="registro"
        deshabilitarBoton={!camposCompletos}
      />
    );

}

export default PacienteForm;
