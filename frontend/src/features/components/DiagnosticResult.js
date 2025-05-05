import React, { useState, useEffect } from "react";
import { obtenerPacientePorId} from "../paciente/pacienteApi";
import { guardarDiagnostico, eliminarDiagnostico} from '../diagnostico/diagnosticoApi';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DiagnosticResult = ({ 
    resultadoActual,
    diagnosticoId,
    pacienteId,
    images,
    setShowModal,
    setModalTitle,
    setModalMessage,
    setModalType
}) => {
    const [descripcion, setDescripcion] = useState("");
    const [paciente, setPaciente] = useState(null);
    const [resultadosParciales, setResultadosParciales] = useState([]);
    const navigate = useNavigate();
    const resultadoPromedio = {};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await obtenerPacientePorId(pacienteId);
                setPaciente(data);
            } catch (error) {
                console.error("Error al obtener paciente:", error);
            }
        };
        if (pacienteId) fetchData();
    }, [pacienteId]);

    useEffect(() => {
        if (resultadoActual) {
          setResultadosParciales((prev) => [...prev, resultadoActual]);
        }
    }, [resultadoActual]);

    resultadosParciales.forEach((resultado) => {
        for (const [clase, valor] of Object.entries(resultado)) {
        resultadoPromedio[clase] = (resultadoPromedio[clase] || 0) + valor;
        }
    });
    for (const clase in resultadoPromedio) {
        resultadoPromedio[clase] /= resultadosParciales.length;
    }
    
    useEffect(() => {
        const handleConfirmarGuardar = () => {
          handleGuardar();
        };
      
        document.addEventListener("confirmar-guardar", handleConfirmarGuardar);
        return () => {
          document.removeEventListener("confirmar-guardar", handleConfirmarGuardar);
        };
    }, [descripcion, resultadoPromedio]);

    useEffect(() => {
        const handleConfirmarEliminar = () => {
          handleEliminar();
        };
      
        document.addEventListener("confirmar-eliminar", handleConfirmarEliminar);
        return () => {
          document.removeEventListener("confirmar-eliminar", handleConfirmarEliminar);
        };
    }, [diagnosticoId]);

    if (!resultadoActual) return null;

    const modalGuardar = () => {
        const faltantes = images.filter(img => !img.analizada);
        if (faltantes.length > 0) {
          setModalTitle('⚠️¿Estás seguro?⚠️');
          setModalMessage(`Falta${faltantes.length > 1 ? 'n' : ''} ${faltantes.length} imagen${faltantes.length > 1 ? 'es' : ''} por analizar. ¿Deseas continuar de todos modos?`);
          setModalType('confirm-guardar');
          setShowModal(true);
        } else {
            handleGuardar();
        }
    };

    const modalEliminar = () => {
        setModalTitle('🚨 ¡Alerta! 🚨');
        setModalMessage('Al eliminar el diagnóstico se perderá toda la información de las imágenes ya procesadas.\n\n¿Estás seguro que deseas continuar?');
        setModalType('confirm-eliminar');
        setShowModal(true);
      };

    const handleGuardar = async () => {
        if (!descripcion.trim()) return;
        
        const benigno = (resultadoPromedio["Benigno"] || 0).toFixed(2);
        const ductal = (resultadoPromedio["Carcinoma ductal"] || 0).toFixed(2);
        const lobulillar = (resultadoPromedio["Carcinoma lobulillar"] || 0).toFixed(2);
        
        const resultadoTexto = `${benigno} - ${ductal} - ${lobulillar}`;
        
        const formData = new FormData();
        formData.append("diagnostico_id", diagnosticoId);
        formData.append("descripcion", descripcion);
        formData.append("resultado", resultadoTexto);
        
        try {
            await guardarDiagnostico(formData);
            toast.success("Diagnóstico registrado correctamente");
            setTimeout(() => navigate("/pacientes/lista"), 1000);
        } catch (error) {
            toast.error("Error al guardar el diagnóstico");
        }
    };
      

    const handleEliminar = async () => {
        try {
          await eliminarDiagnostico(diagnosticoId);
          toast.success("Diagnóstico eliminado correctamente");
          navigate("/pacientes/lista");
        } catch (error) {
          toast.error("Error al eliminar el diagnóstico");
          console.error(error);
        }
    };

    return (
        <div>
            <h2>🧪 Diagnóstico Final 🧪</h2>
            <div className="resultado-box">
                <h2 className="clase-principal">Diagnóstico de {paciente ? `${paciente.nombre} ${paciente.apellido}` : ""} </h2>

                {Object.entries(resultadoPromedio).map(([clase, porcentaje]) => (
                <div key={clase} className="clase-item">
                    <div className="clase-info">
                    <span className="clase-nombre">{clase}</span>
                    <span>{porcentaje.toFixed(2)}%</span>
                    </div>
                    <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${porcentaje}%` }} />
                    </div>
                </div>
                ))}
            </div>
            <div className="acciones-diagnostico">
                <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Escriba la descripción del diagnóstico..."
                    className="descripcion-textarea"
                    rows={3}
                />

                <div className="botones-diagnostico">
                    <button
                    onClick={modalGuardar}
                    disabled={!descripcion.trim()}
                    className={`boton-guardar ${!descripcion.trim() ? 'deshabilitado' : ''}`}
                    >
                    Guardar Diagnóstico Final
                    </button>
                    <button
                    onClick={modalEliminar}
                    className="boton-eliminar"
                    >
                    Eliminar Diagnóstico
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticResult;
