import axios from "axios";

const API_URL = "http://localhost:8000/diagnosticos";

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