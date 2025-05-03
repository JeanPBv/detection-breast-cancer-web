import React, { useState } from 'react';
import './DiagnosticoStyles.css';
import UploadImages from '../components/UploadImages';
import ModalMensaje from '../components/ModalMensaje';

const NewDiagnostico = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const clearImages = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setSelectedImage(null);
    setShowModal(false);
  };

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
      />

      <div className="right-panel">
        {/* RESULTADOS Y DATA AUGMENTATION AQUÍ */}
      </div>
    </div>
  );
};

export default NewDiagnostico;