import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/pacientes`;

export const registrarPaciente = async (data) => {
    return await axios.post(API_URL, data);
};

export const obtenerPacientes = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const response = await axios.get(`${API_URL}/lista/?skip=${skip}&limit=${limit}`);
    return response.data;
};

export const obtenerPacientePorId = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  };
  
export const actualizarPaciente = async (id, data) => {
    await axios.put(`${API_URL}/${id}`, data);
};
  