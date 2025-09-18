/**
 * Custom hook for camera operations
 * 
 * Handles camera-related functionality including:
 * - Device detection (mobile vs desktop)
 * - Mobile camera initialization and management
 * - Camera switching for mobile devices
 * - Photo capture for both mobile and desktop cameras
 * - Camera stream cleanup
 */
import { useState, useEffect, useRef } from 'react';

export const useCameraOperations = () => {
  // Device detection states
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile camera states
  const [mobileCameraStream, setMobileCameraStream] = useState(null);
  const [mobileCameraError, setMobileCameraError] = useState(null);
  const [isMobileCameraActive, setIsMobileCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState('back'); // 'front' or 'back'
  
  // Camera refs
  const mobileVideoRef = useRef(null);
  const mobileCanvasRef = useRef(null);

  /**
   * Device detection effect
   * Detects if the user is on a mobile device
   */
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                            window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  /**
   * Cleanup effect for camera streams
   * Ensures camera streams are properly stopped when component unmounts
   */
  useEffect(() => {
    return () => {
      if (mobileCameraStream) {
        stopMobileCamera();
      }
    };
  }, [mobileCameraStream]);

  /**
   * Starts the mobile camera with specified mode (front/back)
   * Falls back to any available camera if specified camera fails
   */
  const startMobileCamera = async (mode = cameraMode) => {
    try {
      setMobileCameraError(null);
      
      // Determine camera constraints based on mode
      const constraints = {
        video: {
          facingMode: mode === 'back' ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMobileCameraStream(stream);
      setIsMobileCameraActive(true);
      setCameraMode(mode);
      
      if (mobileVideoRef.current) {
        mobileVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Mobile camera error:', error);
      setMobileCameraError(`Failed to access ${mode} camera. Please check permissions.`);
      
      // Fallback to any available camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMobileCameraStream(fallbackStream);
        setIsMobileCameraActive(true);
        
        if (mobileVideoRef.current) {
          mobileVideoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackError) {
        setMobileCameraError('No camera access available. Please use file upload instead.');
      }
    }
  };

  /**
   * Stops the mobile camera and cleans up streams
   */
  const stopMobileCamera = () => {
    if (mobileCameraStream) {
      mobileCameraStream.getTracks().forEach(track => track.stop());
      setMobileCameraStream(null);
      setIsMobileCameraActive(false);
    }
  };

  /**
   * Switches between front and back camera on mobile devices
   */
  const switchMobileCamera = async () => {
    if (mobileCameraStream) {
      stopMobileCamera();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      const newMode = cameraMode === 'back' ? 'front' : 'back';
      await startMobileCamera(newMode);
    }
  };

  /**
   * Sets camera mode and restarts camera if active
   */
  const setCameraModeAndRestart = async (mode) => {
    if (mobileCameraStream) {
      stopMobileCamera();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await startMobileCamera(mode);
    } else {
      setCameraMode(mode);
    }
  };

  /**
   * Captures a photo from mobile camera
   * Uses canvas to convert video frame to blob
   * @param {Function} onCapture - Callback function to handle captured file
   */
  const captureMobilePhoto = (onCapture) => {
    if (mobileVideoRef.current && mobileCanvasRef.current) {
      const video = mobileVideoRef.current;
      const canvas = mobileCanvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
          onCapture(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  /**
   * Captures a photo from desktop webcam
   * @param {Object} webcamRef - Reference to webcam component
   * @param {Function} onCapture - Callback function to handle captured file
   */
  const captureWebcamPhoto = (webcamRef, onCapture) => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to blob
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
            onCapture(file);
          });
      }
    }
  };

  /**
   * Generic photo capture function that handles both mobile and desktop
   * @param {Object} webcamRef - Reference to webcam component (for desktop)
   * @param {Function} onCapture - Callback function to handle captured file
   */
  const capturePhoto = (webcamRef, onCapture) => {
    if (isMobile && mobileCameraStream) {
      captureMobilePhoto(onCapture);
    } else if (webcamRef?.current) {
      captureWebcamPhoto(webcamRef, onCapture);
    }
  };

  // Return all state and functions for component use
  return {
    // Device state
    isMobile,
    
    // Mobile camera state
    mobileCameraStream,
    mobileCameraError,
    isMobileCameraActive,
    cameraMode,
    
    // Camera refs
    mobileVideoRef,
    mobileCanvasRef,
    
    // Camera operations
    startMobileCamera,
    stopMobileCamera,
    switchMobileCamera,
    setCameraModeAndRestart,
    capturePhoto,
    captureMobilePhoto,
    captureWebcamPhoto,
  };
};
