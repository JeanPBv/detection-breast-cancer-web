import React from "react";


function PacienteFormBase({ formData, setFormData, onSubmit, mensaje, modo = "registro", deshabilitarBoton = false }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="form-dark">
      <h2>{modo === "registro" ? "Registro del Paciente" : "Editar Paciente"}</h2>
      <form onSubmit={onSubmit}>
        <div className="row">
          <div className="input-group">
            <label>Nombres</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Apellidos</label>
            <input name="apellido" value={formData.apellido} onChange={handleChange} required />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Edad</label>
            <input
              type="number"
              name="edad"
              min="0"
              value={formData.edad}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Dni</label>
            <input
              type="text"
              name="dni"
              inputMode="numeric"
              pattern="\d*"
              maxLength={8}
              value={formData.dni}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Sexo</label>
          <div className="radio-group">
            <label>
              <input type="radio" name="sexo" value="M" checked={formData.sexo === "M"} onChange={handleChange} />
              Masculino
            </label>
            <label>
              <input type="radio" name="sexo" value="F" checked={formData.sexo === "F"} onChange={handleChange} />
              Femenino
            </label>
          </div>
        </div>

        <button type="submit" disabled={deshabilitarBoton}>
          {modo === "registro" ? "Registrar" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

export default PacienteFormBase;
