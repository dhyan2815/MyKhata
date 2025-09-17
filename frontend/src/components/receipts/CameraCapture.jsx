/**
 * CameraCapture Component
 * 
 * Handles camera interface for both mobile and desktop devices:
 * - Desktop: Uses react-webcam for webcam access
 * - Mobile: Uses native camera API with video element
 * - Responsive design with proper camera controls
 * - Camera switching functionality for mobile devices
 * - Photo capture with loading states
 */
import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useTheme } from '../../context/ThemeContext';
import { useCameraOperations } from '../../hooks/useCameraOperations';

/**
 * Camera error display component
 */
const CameraError = ({ error, isDark }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    <strong>Camera Error:</strong> {error}
  </div>
);

/**
 * Mobile camera interface component
 */
const MobileCameraInterface = ({ 
  mobileVideoRef, 
  mobileCanvasRef, 
  mobileCameraError, 
  isDark 
}) => (
  <div className="mb-4">
    {mobileCameraError ? (
      <CameraError error={mobileCameraError} isDark={isDark} />
    ) : (
      <div className="flex flex-col items-center">
        <video
          ref={mobileVideoRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg max-w-full mb-4"
          style={{ width: '400px', height: '300px', objectFit: 'cover' }}
        />
      </div>
    )}
    
    {/* Hidden canvas for mobile photo capture */}
    <canvas
      ref={mobileCanvasRef}
      style={{ display: 'none' }}
    />
  </div>
);

/**
 * Desktop webcam interface component
 */
const DesktopWebcamInterface = ({ webcamRef }) => (
  <div className="flex justify-center mb-4">
    <Webcam
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      className="rounded-lg max-w-full"
      width={400}
      height={300}
    />
  </div>
);

/**
 * Camera instructions component
 */
const CameraInstructions = ({ isMobile, isDark }) => (
  <div className={`mt-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
    {isMobile ? (
      <p>Tap "Capture Photo" to take a photo of your receipt</p>
    ) : (
      <p>Click "Capture Photo" to take a photo using your webcam</p>
    )}
  </div>
);

/**
 * Capture button component
 */
const CaptureButton = ({ 
  onCapture, 
  isScanning, 
  isDisabled, 
  isMobile 
}) => (
  <div className="flex justify-center">
    <button
      onClick={onCapture}
      disabled={isScanning || isDisabled}
      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isScanning ? 'Processing...' : 'Capture Photo'}
    </button>
  </div>
);

/**
 * Main CameraCapture component
 */
const CameraCapture = ({ 
  onCapture, 
  isScanning = false 
}) => {
  const { isDark } = useTheme();
  const webcamRef = useRef(null);
  
  // Use camera operations hook
  const {
    isMobile,
    mobileCameraStream,
    mobileCameraError,
    isMobileCameraActive,
    mobileVideoRef,
    mobileCanvasRef,
    startMobileCamera,
    capturePhoto,
  } = useCameraOperations();

  // Start mobile camera when component mounts (if mobile)
  useEffect(() => {
    if (isMobile && !mobileCameraStream) {
      startMobileCamera();
    }
  }, [isMobile, mobileCameraStream, startMobileCamera]);

  // Handle photo capture
  const handleCapture = () => {
    capturePhoto(webcamRef, onCapture);
  };

  // Check if camera is disabled
  const isCameraDisabled = isMobile && !isMobileCameraActive;

  return (
    <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {isMobile ? 'Take Photo with Mobile Camera' : 'Take Photo with Webcam'}
      </h2>
      
      {/* Mobile Camera Interface */}
      {isMobile && (
        <MobileCameraInterface
          mobileVideoRef={mobileVideoRef}
          mobileCanvasRef={mobileCanvasRef}
          mobileCameraError={mobileCameraError}
          isDark={isDark}
        />
      )}
      
      {/* Desktop Webcam Interface */}
      {!isMobile && (
        <DesktopWebcamInterface webcamRef={webcamRef} />
      )}
      
      {/* Capture Button */}
      <CaptureButton
        onCapture={handleCapture}
        isScanning={isScanning}
        isDisabled={isCameraDisabled}
        isMobile={isMobile}
      />
      
      {/* Instructions */}
      <CameraInstructions isMobile={isMobile} isDark={isDark} />
    </div>
  );
};

export default CameraCapture;
