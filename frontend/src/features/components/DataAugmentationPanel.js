import React, { useEffect } from 'react';

const DataAugmentationPanel = ({
    selectedImage,
    setTransformedImage,
    zoom,
    setZoom,
    brightness,
    setBrightness,
    contrast,
    setContrast
  }) => {

  useEffect(() => {
    if (!selectedImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage;

    img.onload = () => {
      const scale = zoom / 100;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const transformed = canvas.toDataURL('image/jpeg');
      setTransformedImage(transformed);
    };
  }, [selectedImage, zoom, brightness, contrast, setTransformedImage]);

  return (
    <div>
      <h2>⚙️ Ajustes de Imagen ⚙️</h2>
      {!selectedImage ? (
        <p style={{ opacity: 0.6 }}>Seleccione una imagen para aplicar ajustes.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>Zoom: {zoom}%</label>
            <input
                type="range"
                min="100"
                max="200"
                step="1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
            />

            <label>Brillo: {brightness}%</label>
            <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
            />

            <label>Contraste: {contrast}%</label>
            <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
            />
        </div>
      )}
    </div>
  );
};

export default DataAugmentationPanel;
