import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/diagnosticos`;

export const analizarImagen = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/analizar-imagen`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al analizar la imagen');
  }
};

export const guardarDiagnostico = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/saved-diagnostic`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error("Error al guardar diagnóstico final");
  }
};

export const eliminarDiagnostico = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Error al eliminar el diagnóstico");
  }
};

export const listarDiagnosticos = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  try {
    const response = await axios.get(`${API_URL}/listar?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error("Error al listar diagnósticos");
  }
};

export const obtenerImagenesDiagnostico = async (diagnosticoId) => {
  try {
    const response = await axios.get(`${API_URL}/imagenes/${diagnosticoId}`);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener imágenes del diagnóstico");
}
};

export const descargarDiagnosticoPdf = (diagnosticoId) => {
  const url = `${API_URL}/descargar-pdf/${diagnosticoId}`;
  window.open(url, "_blank");
};