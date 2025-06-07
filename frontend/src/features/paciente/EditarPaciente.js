import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPacientePorId, actualizarPaciente } from "./pacienteApi";
import PacienteFormBase from "../components/PacienteFormBase";
import { toast } from "react-toastify";

function EditarPaciente() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ nombre: "", apellido: "", dni: "", edad: "", sexo: "" });
    const [mensaje] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await actualizarPaciente(id, formData);
            toast.success("Cambios guardados exitosamente");
            setTimeout(() => navigate("/pacientes/lista"), 1000);
        } catch(err) {
            if (err.response && err.response.data.detail === "DNI_DUPLICADO") {
                toast.error("El DNI ya está registrado.");
            } else {
                toast.error("Error al registrar paciente");
            }
        }
    };

    const [originalData, setOriginalData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await obtenerPacientePorId(id);
            setFormData(data);
            setOriginalData(data); 
        };
        fetchData();
    }, [id]);

    const formularioModificado = () => {
        if (!originalData) return false;
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    const camposCompletos = Object.values(formData).every(val => val !== "");
    return (
    <PacienteFormBase
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        mensaje={mensaje}
        modo="edicion"
        deshabilitarBoton={!formularioModificado() || !camposCompletos}
    />
  );
}

export default EditarPaciente;
