"use client";

import { useEffect } from 'react';
import * as faceapi from 'face-api.js';

export const useSecureFaceAuth = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onSuccess: () => void,
  onFallback: () => void
) => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const currentVideoRef = videoRef.current;
    
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      onFallback();
      return;
    }

    const initFaceAuth = async () => {
      try {
        // Enforce a strict 5-second timeout for model loading/camera access
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('FACE_API_TIMEOUT')), 5000);
        });

        await Promise.race([
          Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
              if (currentVideoRef) currentVideoRef.srcObject = stream;
            })
          ]),
          timeoutPromise
        ]);

        clearTimeout(timeoutId);
        
        // Poll for face detection instead of mocking
        const detectFace = async () => {
          if (!currentVideoRef || !currentVideoRef.srcObject) {
            timeoutId = setTimeout(detectFace, 1000);
            return;
          }

          try {
            const detection = await faceapi.detectSingleFace(currentVideoRef, new faceapi.TinyFaceDetectorOptions());
            if (detection) {
              console.log('[Z-AI Security] Face detected successfully.');
              onSuccess();
            } else {
              timeoutId = setTimeout(detectFace, 500); // Check every 500ms
            }
          } catch (err) {
            console.warn('[Z-AI Security] Detection error:', err);
            timeoutId = setTimeout(detectFace, 1000);
          }
        };

        // Start polling once models are loaded and stream is ready
        detectFace();

      } catch (error) {
        console.warn('[Z-AI Security] FaceID failed or timed out. Falling back.', error);
        
        if (currentVideoRef?.srcObject) {
          const stream = currentVideoRef.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          currentVideoRef.srcObject = null;
        }
        
        onFallback();
      }
    };

    initFaceAuth();

    return () => {
      clearTimeout(timeoutId);
      if (currentVideoRef?.srcObject) {
         const stream = currentVideoRef.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoRef, onSuccess, onFallback]);
};

