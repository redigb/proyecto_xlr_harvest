import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Terreno from './Terreno.jsx';  // Importa el terreno
import RaycasterLogic from './Raycaster.js';  // Lógica de clics

const Scene = ({ onSectorClick }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Configuración básica de Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, (window.innerWidth * 0.8) / (window.innerHeight - 100), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight - 100);  // Ajusta al layout con header
    renderer.setClearColor(0x87CEEB);  // Cielo azul para farm vibe
    mountRef.current.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Terreno (grilla de sectores)
    const terrenoGroup = Terreno(scene);  // Crea y agrega la grilla
    scene.add(terrenoGroup);

    // Posición inicial de cámara
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Inicializa raycaster para clics
    RaycasterLogic.init(renderer, camera, terrenoGroup, onSectorClick);

    // Animación loop
    const animate = () => {
      requestAnimationFrame(animate);
      // Rotación sutil para demo (opcional, quítala después)
      terrenoGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Limpieza al desmontar
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onSectorClick]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-[calc(100vh-100px)] bg-green-200"  // Placeholder verde si no carga 3D
    />
  );
};

export default Scene;  // ¡Este es el clave! Export default para el import en Game.jsx