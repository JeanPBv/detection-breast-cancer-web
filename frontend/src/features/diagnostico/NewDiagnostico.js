import React, { useState,  useEffect } from 'react';
import './DiagnosticoStyles.css';
import UploadImages from '../components/UploadImages';
import ModalMensaje from '../components/ModalMensaje';
import DataAugmentationPanel from '../components/DataAugmentationPanel';

const NewDiagnostico = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [transformedImage, setTransformedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [flip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const clearImages = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setSelectedImage(null);
    setTransformedImage(null);
    setShowModal(false);
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
  
    window.addEventListener('wheel', handleWheel, { passive: false });
  
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="diagnostico-container">
      <ModalMensaje
        show={showModal}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setShowModal(false)}
        onConfirm={clearImages}
      />

      <UploadImages
        images={images}
        setImages={setImages}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        setShowModal={setShowModal}
        setModalMessage={setModalMessage}
        setModalTitle={setModalTitle}
        setModalType={setModalType}
        transformedImage={transformedImage}

        zoom={zoom}
        brightness={brightness}
        contrast={contrast}
        flip={flip}
        position={position}
        setPosition={setPosition}
        dragging={dragging}
        setDragging={setDragging}
        startPos={startPos}
        setStartPos={setStartPos}
      />


      <div className="right-panel">
        <DataAugmentationPanel
          selectedImage={selectedImage}
          setTransformedImage={setTransformedImage}
          zoom={zoom}
          setZoom={setZoom}
          brightness={brightness}
          setBrightness={setBrightness}
          contrast={contrast}
          setContrast={setContrast}
        />
      </div>
    </div>
  );
};

export default NewDiagnostico;
