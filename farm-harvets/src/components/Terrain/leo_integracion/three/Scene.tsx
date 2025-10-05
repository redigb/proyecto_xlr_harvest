import { useRef, useEffect, useState } from 'react';
import Terreno, { updateCropGrowth } from './Terreno';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ------------------ Tipos base ------------------
interface PlotUserData {
  id: number;
  type?: string;
  crop?: string | null;
  isWatered?: boolean;
  isGrown?: boolean;
  plantTime?: number | null;
  crops?: THREE.Object3D[];
  isTree?: boolean;
  isCloud?: boolean;
  dispose?: () => void;
  trunk?: THREE.Object3D;
  crowns?: THREE.Object3D[];
}
interface Plot extends THREE.Group {
  userData: PlotUserData;
}
interface SectorData {
  id: number;
  plot: Plot;
}
interface SceneProps {
  onSectorClick: (sectorData: SectorData | null) => void;
}

// ------------------ Componente ------------------
const Scene: React.FC<SceneProps> = ({ onSectorClick }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const highlightedPlotRef = useRef<Plot | null>(null);
  const sceneReadyRef = useRef<boolean>(false);
  const hasCriticalError = useRef<boolean>(false);

  const mouseMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Limpia cualquier canvas previo dentro de este contenedor
    if (mountRef.current) {
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    }

    // --- Escena, cámara y renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87ceeb, 20, 50);

    const camera = new THREE.PerspectiveCamera(
      65,
      (window.innerWidth * 0.8) / (window.innerHeight - 100),
      0.1,
      1000
    );
    camera.position.set(18, 14, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight - 100);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x87ceeb);
    renderer.domElement.id = 'three-canvas';
    mountRef.current?.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Loading manager (solo para este archivo) ---
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, loaded, total) => {
      setProgress((loaded / total) * 100);
    };
    loadingManager.onLoad = () => {
      sceneReadyRef.current = true;
    };
    loadingManager.onError = (url) => {
      console.warn('Error al cargar:', url);
      // No bloqueamos toda la escena si un asset falla
    };

    // --- Luces ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xfff4e6, 1.5);
    dir.position.set(20, 30, 15);
    dir.castShadow = true;
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xffebc5, 0.4);
    fill.position.set(-15, 15, -10);
    scene.add(fill);

    // --- Fondo (no bloqueante) ---
    const textureLoader = new THREE.TextureLoader(loadingManager);
    let backgroundTexture: THREE.Texture | null = null;
    textureLoader.load(
      '/assets/360/background.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        backgroundTexture = texture;
        scene.background = texture;
      },
      undefined,
      () => {
        scene.background = new THREE.Color(0x87ceeb);
      }
    );

    // --- Raycaster ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let terrenoGroup: THREE.Group | null = null;

    const highlightSector = (sector: Plot) => {
      const child = sector.children[0] as THREE.Mesh;
      const mat = child?.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissive.set(0x666666);
        mat.emissiveIntensity = 0.7;
        setTimeout(() => {
          mat.emissive.set(0x000000);
          mat.emissiveIntensity = 0;
        }, 300);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!sceneReadyRef.current || hasCriticalError.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const plots =
        terrenoGroup?.children.filter(
          (child) => (child as Plot).userData.type === 'farmPlot'
        ) || [];
      const intersects = raycaster.intersectObjects(plots, true);

      if (intersects.length > 0) {
        let object = intersects[0].object as unknown as Plot;
        while (object && !object.userData.id && object.parent) {
          object = object.parent as unknown as Plot;
        }
        if (object.userData.id && object.children[0]) {
          onSectorClick({ id: object.userData.id, plot: object });
          highlightSector(object);
        } else {
          onSectorClick(null);
        }
      } else {
        onSectorClick(null);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!sceneReadyRef.current || hasCriticalError.current) return;
      if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);

      mouseMoveTimeoutRef.current = setTimeout(() => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const plots =
          terrenoGroup?.children.filter(
            (child) => (child as Plot).userData.type === 'farmPlot'
          ) || [];
        const intersects = raycaster.intersectObjects(plots, true);

        // limpiar resaltado previo
        if (highlightedPlotRef.current) {
          const mat = (highlightedPlotRef.current.children[0] as THREE.Mesh)
            .material as THREE.MeshStandardMaterial;
          mat.emissive.set(0x000000);
          mat.emissiveIntensity = 0;
          renderer.domElement.style.cursor = 'auto';
        }

        if (intersects.length > 0) {
          let object = intersects[0].object as unknown as Plot;
          while (object && !object.userData.id && object.parent) {
            object = object.parent as unknown as Plot;
          }
          if (object.userData.id && object.children[0]) {
            highlightedPlotRef.current = object;
            const mat = (object.children[0] as THREE.Mesh)
              .material as THREE.MeshStandardMaterial;
            mat.emissive.set(0xffff00);
            mat.emissiveIntensity = 0.5;
            renderer.domElement.style.cursor = 'pointer';
          } else {
            highlightedPlotRef.current = null;
          }
        } else {
          highlightedPlotRef.current = null;
          renderer.domElement.style.cursor = 'auto';
        }
      }, 100);
    };

    // --- Terreno ---
    try {
      terrenoGroup = Terreno(scene);
      scene.add(terrenoGroup);

      // Fallback: si el manager no marca "ready", marcamos manualmente
      // (útil si Terreno carga texturas con otro loader)
      setTimeout(() => {
        if (!sceneReadyRef.current) sceneReadyRef.current = true;
      }, 0);

      renderer.domElement.addEventListener('click', handleClick);
      renderer.domElement.addEventListener('mousemove', handleMouseMove);
    } catch (err) {
      console.error('Error creando terreno:', err);
      setError('Error al crear el terreno');
      hasCriticalError.current = true;
    }

    // --- Controles ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.panSpeed = 0.8;
    controls.zoomSpeed = 0.9;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 6;
    controls.maxDistance = 80;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minPolarAngle = Math.PI / 8;
    controlsRef.current = controls;

    // --- Animación ---
    const clock = new THREE.Clock();
    const animate = () => {
      if (hasCriticalError.current) return;
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const currentTime = Date.now();

      controls.update();

      if (terrenoGroup) {
        terrenoGroup.children.forEach((child) => {
          const data = (child as Plot).userData;
          if (data.isTree) animateTree(child, elapsedTime);
          else if (data.isCloud) animateCloud(child, elapsedTime);
          else if (data.type === 'farmPlot') updateCropGrowth(child as Plot, currentTime);
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // --- Resize ---
    const handleResize = () => {
      camera.aspect = (window.innerWidth * 0.8) / (window.innerHeight - 100);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth * 0.8, window.innerHeight - 100);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);
      controlsRef.current?.dispose();
      backgroundTexture?.dispose();
      (terrenoGroup as any)?.userData?.dispose?.();
      if (rendererRef.current && mountRef.current?.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  // --- Animaciones auxiliares ---
  const animateTree = (tree: THREE.Object3D, time: number) => {
    const data = (tree as Plot).userData;
    if (data.trunk && data.crowns) {
      const wind = 0.03;
      data.trunk.rotation.z = Math.sin(time * 0.6) * wind;
      data.crowns.forEach((crown, i) => {
        crown.rotation.z = Math.sin(time * 1.0 + i) * wind * 1.5;
      });
    }
  };
  const animateCloud = (cloud: THREE.Object3D, time: number) => {
    cloud.position.x += Math.sin(time * 0.1) * 0.01;
    cloud.position.y += Math.sin(time * 0.5 + cloud.position.x) * 0.002;
  };

  // --- Render UI ---
  if (error) {
    return (
      <div className="relative w-full h-[calc(100vh-100px)] bg-blue-100 flex items-center justify-center">
        <div className="text-red-800 text-center font-luckiest bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl border-2 border-red-200">
          <p className="text-xl mb-2">Error al cargar la escena</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-100px)] bg-blue-100">
      <div ref={mountRef} className="w-full h-full" style={{ pointerEvents: 'auto' }} />
      {!sceneReadyRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 transition-opacity duration-500 pointer-events-none">
          <div className="text-blue-800 text-center font-luckiest bg-white/90 p-8 rounded-2xl shadow-2xl border-2 border-blue-200">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl mb-2">Cargando Terreno...</p>
            <p className="text-lg font-bold">{Math.round(progress)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scene;
