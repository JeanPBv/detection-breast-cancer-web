import React, { useRef, useEffect } from 'react';
import { FaUpload, FaPlus } from 'react-icons/fa';
import { analizarImagen } from '../diagnostico/diagnosticoApi';

const UploadImages = ({
  pacienteId,
  images,
  setImages,
  selectedImage,
  setSelectedImage,
  setShowModal,
  setModalMessage,
  setModalTitle,
  setModalType,
  transformedImage,
  zoom,
  brightness,
  contrast,
  flip,
  position,
  setPosition,
  dragging,
  setDragging,
  startPos,
  setStartPos,
  setResultadoActual,
  setDiagnosticoId
}) => {

  const MAX_SIZE_MB = 5;
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];
  const dropZoneRef = useRef(null);
  const imageRef = useRef(null);

  const isDuplicate = (file) =>
    images.some((img) => img.file.name === file.name && img.file.size === file.size);

  const isValidFormat = (file) => SUPPORTED_FORMATS.includes(file.type);
  const isValidSize = (file) => file.size <= MAX_SIZE_MB * 1024 * 1024;
  
  const handleMouseDown = (e) => {
    if (zoom <= 100) return;
    setDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleAnalyze = async () => {
    if (!selectedImage) return;
  
    const imgData = images.find(img => img.preview === selectedImage);
    if (!imgData) return;
  
    const originalFile = imgData.file;
  
    const img = new Image();
    img.src = selectedImage;
    await new Promise(resolve => { img.onload = resolve; });
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = zoom / 100;
  
    canvas.width = img.width;
    canvas.height = img.height;
  
    ctx.save();
    ctx.translate(
      canvas.width / 2 + position.x,
      canvas.height / 2 + position.y
    );
    ctx.scale(flip ? -scale : scale, scale);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
  
    const formData = new FormData();
    formData.append('original_image', originalFile);
    formData.append('augmented_image', blob);
    formData.append('zoom', zoom);
    formData.append('brightness', brightness);
    formData.append('contrast', contrast);
    formData.append('flip', flip);
    formData.append('paciente_id', pacienteId);
    formData.append('position_x', parseInt(position.x));
    formData.append('position_y', parseInt(position.y));

    try {
      const response = await analizarImagen(formData);
      if (setResultadoActual) {
        setResultadoActual(response.porcentajes);
      }
      
      if(setDiagnosticoId){
        setDiagnosticoId(response.diagnostico_id);
      }
      setImages(prev =>
        prev.map(img =>
          img.preview === selectedImage ? { ...img, analizada: true } : img
        )
      );
  
      const currentIndex = images.findIndex(img => img.preview === selectedImage);
      const nextImage = images.slice(currentIndex + 1).find(img => !img.analizada);

      if (nextImage) {
        setSelectedImage(nextImage.preview);
      } else {
        setSelectedImage(selectedImage); 
      }
  
    } catch (err) {
      console.error("Error al analizar imagen:", err);
    }
  };
  

  const handleMouseMove = (e) => {
    if (!dragging || !imageRef.current || !dropZoneRef.current) return;
  
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
  
    const container = dropZoneRef.current.getBoundingClientRect();
  
    const scaleFactor = zoom / 100;
  
    const imageWidth = imageRef.current.naturalWidth * scaleFactor;
    const imageHeight = imageRef.current.naturalHeight * scaleFactor;
  
    const maxX = Math.max((imageWidth - container.width) / 2, 0);
    const maxY = Math.max((imageHeight - container.height) / 2, 0);
  
    const clampedX = Math.min(Math.max(newX, -maxX), maxX);
    const clampedY = Math.min(Math.max(newY, -maxY), maxY);
  
    setPosition({ x: clampedX, y: clampedY });
  };
  
  const handleMouseUp = () => {
    setDragging(false);
  };

  const processFiles = (files) => {
    const validImages = [];
    for (const file of files) {
      if (!isValidFormat(file)) {
        setModalTitle('🚨¡Alerta!🚨');
        setModalMessage(`Formato no permitido: ${file.name}`);
        setModalType('alert');
        setShowModal(true);
        continue;
      }
      if (!isValidSize(file)) {
        setModalTitle('🚨¡Alerta!🚨');
        setModalMessage(`La imagen "${file.name}" supera los ${MAX_SIZE_MB}MB.`);
        setModalType('alert');
        setShowModal(true);
        continue;
      }
      if (isDuplicate(file)) {
        setModalTitle('🚨¡Alerta!🚨');
        setModalMessage(`La imagen "${file.name}" ya ha sido subida.`);
        setModalType('alert');
        setShowModal(true);
        continue;
      }
      validImages.push({ file, preview: URL.createObjectURL(file), analizada: false });
    }

    if (validImages.length > 0) {
      setImages((prev) => {
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
    setModalTitle('⚠️¿Estás seguro?⚠️');
    setModalMessage('Borrarás todas las imágenes cargadas.');
    setModalType('confirm');
    setShowModal(true);
  };

  useEffect(() => {
    if (!imageRef.current || !dropZoneRef.current) return;
  
    const container = dropZoneRef.current.getBoundingClientRect();
    const scaleFactor = zoom / 100;
  
    const imageWidth = imageRef.current.naturalWidth * scaleFactor;
    const imageHeight = imageRef.current.naturalHeight * scaleFactor;
  
    const maxX = Math.max((imageWidth - container.width) / 2, 0);
    const maxY = Math.max((imageHeight - container.height) / 2, 0);
  
    const clampedX = Math.min(Math.max(position.x, -maxX), maxX);
    const clampedY = Math.min(Math.max(position.y, -maxY), maxY);
  
    if (clampedX !== position.x || clampedY !== position.y) {
      setPosition({ x: clampedX, y: clampedY });
    }
  }, [zoom, position, setPosition]);
  

  return (
    <div className="left-panel">
      <h2>🧬 Sube una imagen histopatológica 🧬</h2>

      <div
      ref={dropZoneRef}
      className="upload-area"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => {
        if (!selectedImage) {
          document.getElementById('fileInput').click();
        }
      }}
      style={{
        overflow: 'hidden',
        border: '1px solid #ccc',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: zoom > 100 ? (dragging ? 'grabbing' : 'grab') : 'default',
      }}
    >
      {selectedImage ? (
        <img
          ref={imageRef}
          src={selectedImage}
          alt="Vista previa"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${flip ? -zoom / 100 : zoom / 100}, ${zoom / 100})`,
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            maxWidth: 'none',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p>Coloque la imagen aquí o haga clic para cargar</p>
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
            <button className="send-button" disabled={
              !images.length || !selectedImage || images.every(img => img.analizada)
            } onClick={handleAnalyze}>Analizar</button>
          </div>

          <p className="preview-label">Imágenes precargadas:</p>
          <div className="image-preview-container">
          {images.map((img, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img
                src={img.preview}
                alt={`preview-${index}`}
                className="image-preview"
                onClick={() => {
                  if (!img.analizada) setSelectedImage(img.preview);
                }}
                style={{
                  cursor: img.analizada ? 'not-allowed' : 'pointer',
                  border: img.preview === selectedImage ? '5px solid #3b82f6' : ''
                }}
              />
              {img.analizada && (
                <span style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'green',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}>✔</span>
              )}
            </div>
          ))}

            <div
              onClick={() => document.getElementById('fileInput').click()}
              className="image-preview"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1f2937',
                border: '2px dashed #ccc',
                cursor: 'pointer',
                fontSize: '2rem',
                color: '#555'
              }}
              title="Agregar más imágenes"
            >
              <FaPlus /> 
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadImages;