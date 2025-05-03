import React from 'react';
import { FaUpload } from 'react-icons/fa';

const UploadImages = ({
    images,
    setImages,
    selectedImage,
    setSelectedImage,
    setShowModal,
    setModalMessage,
    setModalTitle,
    setModalType
}) => {
  const MAX_SIZE_MB = 5;
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];

  const isDuplicate = (file) => {
    return images.some(img => img.file.name === file.name && img.file.size === file.size);
  };

  const isValidFormat = (file) => SUPPORTED_FORMATS.includes(file.type);
  const isValidSize = (file) => file.size <= MAX_SIZE_MB * 1024 * 1024;

  const processFiles = (files) => {
    const validImages = [];

    for (const file of files) {
      if (!isValidFormat(file)) {
        setModalTitle("🚨¡Alerta!🚨");
        setModalMessage(`Formato no permitido: ${file.name}`);
        setModalType("alert");
        setShowModal(true);
        continue;
      }
      if (!isValidSize(file)) {
        setModalTitle("🚨¡Alerta!🚨");
        setModalMessage(`La imagen "${file.name}" supera los ${MAX_SIZE_MB}MB.`);
        setModalType("alert");
        setShowModal(true);
        continue;
      }
      if (isDuplicate(file)) {
        setModalTitle("🚨¡Alerta!🚨");
        setModalMessage(`La imagen "${file.name}" ya ha sido subida.`);
        setModalType("alert");
        setShowModal(true);
        continue;
      }
      validImages.push({
        file,
        preview: URL.createObjectURL(file)
      });
    }

    if (validImages.length > 0) {
      setImages(prev => {
        const all = [...prev, ...validImages];
        if (!selectedImage) {
          setSelectedImage(validImages[0].preview);
        }
        return all;
      });
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const confirmClearImages = () => {
    setModalTitle("⚠¿Estás seguro?⚠");
    setModalMessage("Borrarás todas las imágenes cargadas.");
    setModalType("confirm");
    setShowModal(true);
  };

  return (
    <div className="left-panel">
      <h2>🧬 Sube una imagen histopatológica 🧬</h2>

      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('fileInput').click()}
      >
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="selected-preview"
            className="selected-image-preview"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p>Coloque la imagen aquí</p>
            <p>o haga clic para cargar</p>
            <FaUpload style={{ cursor: 'pointer', fontSize: '2rem' }} />
          </div>
        )}

        <input
          id="fileInput"
          type="file"
          accept="image/jpeg, image/jpg, image/png"
          multiple
          onChange={handleImageUpload}
          className="hidden-input"
        />
      </div>

      {images.length > 0 && (
        <>
          <div className="button-group">
            <button className="clear-button" onClick={confirmClearImages}>Limpiar</button>
            <button className="send-button" disabled={!images.length}>Enviar</button>
          </div>

          <p className="preview-label">Imágenes precargadas:</p>
          <div className="image-preview-container">
            {images.map((img, index) => (
              <img
                key={index}
                src={img.preview}
                alt={`preview-${index}`}
                className="image-preview"
                onClick={() => setSelectedImage(img.preview)}
                style={{
                  cursor: 'pointer',
                  border: img.preview === selectedImage ? '5px solid #3b82f6' : ''
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UploadImages;