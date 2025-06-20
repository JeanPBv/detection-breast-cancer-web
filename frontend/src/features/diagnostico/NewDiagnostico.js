import React, { useState,  useEffect} from 'react';
import './DiagnosticoStyles.css';
import UploadImages from '../components/UploadImages';
import ModalMensaje from '../components/ModalMensaje';
import DataAugmentationPanel from '../components/DataAugmentationPanel';
import DiagnosticResult from '../components/DiagnosticResult';
import { useParams } from 'react-router-dom';

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
  const { id: pacienteId } = useParams();
  const [resultadoActual, setResultadoActual] = useState(null);
  const [diagnosticoId, setDiagnosticoId] = useState('');
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
        onConfirm={() => {
          if (modalType === 'confirm') {
            clearImages();
          } else if (modalType === 'confirm-guardar') {
            document.dispatchEvent(new CustomEvent("confirmar-guardar"));
            setShowModal(false);
          } else if (modalType === 'confirm-eliminar') {
            document.dispatchEvent(new CustomEvent("confirmar-eliminar"));
            setShowModal(false);
          }
        }}
      />

      <UploadImages
        pacienteId={pacienteId} 
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
        setResultadoActual={setResultadoActual}
        setDiagnosticoId = {setDiagnosticoId}
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
        <br/>
        <DiagnosticResult 
        resultadoActual={resultadoActual}
        diagnosticoId = {diagnosticoId} 
        pacienteId={pacienteId} 
        images={images}
        setShowModal={setShowModal}
        setModalTitle={setModalTitle}
        setModalMessage={setModalMessage}
        setModalType={setModalType}/>
      </div>
    </div>
  );
};

export default NewDiagnostico;
