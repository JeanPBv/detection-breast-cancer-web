import React, { useEffect, useState } from "react";
import { listarDiagnosticos, obtenerImagenesDiagnostico, descargarDiagnosticoPdf } from "./diagnosticoApi";
import {FaChevronLeft, FaChevronRight, FaEye, FaDownload} from "react-icons/fa";
import NavBar from "../components/NavBar";

const ListaDiagnosticos = () => {
    const [diagnosticos, setDiagnosticos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const limite = 10;
    const [imagenesModal, setImagenesModal] = useState([]);
    const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [imagenAmpliada, setImagenAmpliada] = useState(null);

    useEffect(() => {
    const fetchDiagnosticos = async () => {
        try {
        const data = await listarDiagnosticos(pagina, limite);
        setDiagnosticos(data);
        } catch (error) {
        console.error("Error al obtener diagnósticos:", error.message);
        }
    };

    fetchDiagnosticos();
    }, [pagina]);

    const formatearResultado = (resultado) => {
    if (!resultado) return "";
        
    const partes = resultado.split("-").map(x => parseFloat(x.trim()));
    if (partes.length !== 3 || partes.some(isNaN)) return resultado;
        
    const etiquetas = ["Benigno", "Carcinoma ductal", "Carcinoma lobulillar"];
    const maxIndex = partes.indexOf(Math.max(...partes));
        
    return `${etiquetas[maxIndex]}: ${partes[maxIndex].toFixed(2)}%`;
    };    

    return (
    <>
        <NavBar />
        <div className="tabla-container">
            <div className="tabla-header">
                <h2>Diagnósticos Registrados:</h2>
            </div>
            <table className="tabla-pacientes">
                <thead>
                    <tr>
                        <th style={{ width: "5%" }}>ID</th>
                        <th style={{ width: "20%" }}>Paciente</th>
                        <th style={{ width: "20%" }}>Resultado</th>
                        <th style={{ width: "30%" }}>Descripción</th>
                        <th style={{ width: "15%" }} className="centrado">Fecha</th>
                        <th style={{ width: "10%" }} className="centrado">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                {diagnosticos.map((diagnostic) => (
                    <tr key={diagnostic.id}>
                        <td className="centrado">{diagnostic.id}</td>
                        <td >{diagnostic.paciente}</td>
                        <td>{formatearResultado(diagnostic.resultado)}</td>
                        <td>{diagnostic.descripcion}</td>
                        <td className="centrado">{diagnostic.fecha_diagnostico.split(" ")[0]}</td>
                        <td className="centrado">
                            <FaEye
                                className="icono-ojo"
                                style={{ cursor: "pointer", fontSize: "1.2rem" }}
                                title="Ver diagnóstico"
                                onClick={async () => {
                                try {
                                    const imagenes = await obtenerImagenesDiagnostico(diagnostic.id);
                                    setImagenesModal(imagenes);
                                    setDiagnosticoSeleccionado(diagnostic);
                                    setMostrarModal(true);
                                } catch (error) {
                                    console.error(error.message);
                                }
                                }}
                            />
                            <FaDownload
                                className="icono-descarga"
                                style={{ cursor: "pointer", fontSize: "1.2rem" }}
                                title="Exportar PDF"
                                onClick={() => descargarDiagnosticoPdf(diagnostic.id)}
                            />
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
                <button onClick={() => setPagina(p => p + 1)} disabled={diagnosticos.length < limite}
                    title={diagnosticos.length < limite ? "Fin de resultados" : ""}>
                    <FaChevronRight />
                </button>
            </div>
        </div>
        {mostrarModal && diagnosticoSeleccionado && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3 className="titulo-modal">📋 Detalle del Diagnóstico 📋</h3>
                    <p><strong>Paciente:</strong> {diagnosticoSeleccionado.paciente}</p>
                    {(() => {
                        const [fecha, hora] = diagnosticoSeleccionado.fecha_diagnostico.split(" ");
                        return (
                            <p>
                            <strong>Fecha:</strong> {fecha} &nbsp;&nbsp;
                            <strong>Hora:</strong> {hora}
                            </p>
                        );
                    })()}
                    {(() => {
                        const partes = diagnosticoSeleccionado.resultado.split("-").map(x => parseFloat(x.trim()));
                        const etiquetas = ["Benigno", "Carcinoma ductal", "Carcinoma lobulillar"];
                        return (
                            <div>
                                <p><strong>Diagnóstico:</strong></p>
                                {etiquetas.map((etiqueta, i) => (
                                    <p key={i} style={{ margin: "6px 20px" }}> 
                                        ➣ {etiqueta}: {partes[i].toFixed(2)}%
                                    </p>
                                ))}
                            </div>
                        );
                    })()}
                    <p><strong>Descripción:</strong> {diagnosticoSeleccionado.descripcion}</p>
                    <p><strong>Imágenes:</strong></p>
                    <div className="imagenes-container">
                        {imagenesModal.map((img, idx) => (
                        <img
                            key={idx}
                            src={`${process.env.REACT_APP_BACKEND_URL}${img}`}
                            alt={`Imagen ${idx + 1}`}
                            className="miniatura"
                            onClick={() => setImagenAmpliada(`${process.env.REACT_APP_BACKEND_URL}${img}`)}
                        />
                        ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button className="cerrar-btn" onClick={() => setMostrarModal(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        )}
        {imagenAmpliada && (
            <div className="visor-overlay" onClick={() => setImagenAmpliada(null)}>
                <img src={imagenAmpliada} alt="Imagen ampliada" className="imagen-ampliada" />
            </div>
        )}
    </>
    
    );
};

export default ListaDiagnosticos;
