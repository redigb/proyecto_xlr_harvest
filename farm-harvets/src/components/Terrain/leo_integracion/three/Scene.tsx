import { useRef, useEffect, useState } from 'react';
import Terreno, { updateCropGrowth } from './Terreno';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Tipos
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
  originalColor?: number;
}

interface Plot extends THREE.Group {
  userData: PlotUserData;
}

interface FarmPlot {
  id: string;
  position: { lat: number; lng: number };
  cultivated: boolean;
  cropType?: string;
  growth?: number;
  health?: number;
  resources?: { water: number; nutrients: number };
}

interface SectorData {
  id: number;
  plot: Plot;
  position?: { lat: number; lng: number }; // GPS para clima
}

interface SceneProps {
  onSectorClick: (sectorData: SectorData | null) => void;
  selectedPlot: FarmPlot | null; // Nueva prop
}

// Conversión de coordenadas GPS a posición en escena (ajusta según tu escala)
const latLngToScenePosition = (lat: number, lng: number) => {
  // Escala simplificada: ajusta según el tamaño de tu terreno
  const scale = 0.1; // Ejemplo: 1 grado = 0.1 unidades en la escena
  return new THREE.Vector3(lng * scale, 0, -lat * scale); // Ajusta Y según tu terreno
};

const Scene: React.FC<SceneProps> = ({ onSectorClick, selectedPlot }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const highlightedPlotRef = useRef<Plot | null>(null);
  const sceneReadyRef = useRef<boolean>(false);
  const hasCriticalError = useRef<boolean>(false);
  const terrenoGroupRef = useRef<THREE.Group | null>(null);

  const mouseMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);


  // --- Highlight y clics ---
  const highlightSector = (sector: Plot) => {
    const child = sector.children[0] as THREE.Mesh;
    const mat = child?.material as THREE.MeshStandardMaterial;
    if (mat && mat.isMaterial) {
      mat.emissive.set(0x666666);
      mat.emissiveIntensity = 0.7;
      setTimeout(() => {
        if (mat.isMaterial) {
          mat.emissive.set(0x000000);
          mat.emissiveIntensity = 0;
        }
      }, 300);
    }
  };

  useEffect(() => {
    // Limpia canvas previo
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
    // Posición inicial por defecto
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

    // --- Loading manager ---
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, loaded, total) => {
      setProgress((loaded / total) * 100);
    };
    loadingManager.onLoad = () => {
      sceneReadyRef.current = true;
    };
    loadingManager.onError = (url) => {
      console.warn('Error al cargar:', url);
    };

    // --- Luces ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xfff4e6, 1.5);
    dir.position.set(20, 30, 15);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 50;
    dir.shadow.camera.left = -25;
    dir.shadow.camera.right = 25;
    dir.shadow.camera.top = 25;
    dir.shadow.camera.bottom = -25;
    scene.add(dir);

    const fill = new THREE.DirectionalLight(0xffebc5, 0.4);
    fill.position.set(-15, 15, -10);
    scene.add(fill);

    // --- Fondo ---
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
    raycaster.params.Mesh = { threshold: 0.1 };
    const mouse = new THREE.Vector2();

    // --- Terreno ---
    let terrenoGroup: THREE.Group;
    try {
      terrenoGroup = Terreno(scene);
      scene.add(terrenoGroup);
      terrenoGroupRef.current = terrenoGroup;

      // Fallback: marcar ready si el manager falla
      setTimeout(() => {
        if (!sceneReadyRef.current) sceneReadyRef.current = true;
      }, 1000);
    } catch (err) {
      console.error('Error creando terreno:', err);
      setError('Error al crear el terreno');
      hasCriticalError.current = true;
      return;
    }

    // --- Centrar cámara en selectedPlot ---
    if (selectedPlot) {
      console.log('Centrar cámara en parcela:', selectedPlot);
      const scenePos = latLngToScenePosition(selectedPlot.position.lat, selectedPlot.position.lng);
      camera.position.set(scenePos.x + 10, 14, scenePos.z + 10); // Ajustar offset
      camera.lookAt(scenePos.x, 0, scenePos.z);

      // Seleccionar parcela inicial
      const plotId = parseInt(selectedPlot.id.replace('plot-', ''));
      const plotMap = terrenoGroup.children.find(
        (child) => (child as Plot).userData.id === plotId
      ) as Plot | undefined;
      if (plotMap) {
        console.log('Parcela encontrada en terreno:', plotMap);
        onSectorClick({
          id: plotId,
          plot: plotMap,
          position: selectedPlot.position,
        });
        highlightSector(plotMap);
      } else {
        console.warn('Parcela no encontrada en terreno:', plotId);
        onSectorClick(null);
      }
    }


    const handleClick = (event: MouseEvent) => {
      if (!sceneReadyRef.current || hasCriticalError.current) return;
      event.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      try {
        raycaster.setFromCamera(mouse, camera);
        const plots = terrenoGroup.children.filter(
          (child) => (child as Plot).userData.type === 'farmPlot'
        ) || [];
        const intersects = raycaster.intersectObjects(plots, true);

        if (intersects.length > 0) {
          let object = intersects[0].object as unknown as Plot;
          while (object && !object.userData.id && object.parent) {
            object = object.parent as unknown as Plot;
          }
          if (object.userData.id && object.children[0]) {
            onSectorClick({
              id: object.userData.id,
              plot: object,
              position: selectedPlot?.position, // Usar GPS del mapa
            });
            highlightSector(object);
          } else {
            onSectorClick(null);
          }
        } else {
          onSectorClick(null);
        }
      } catch (err) {
        console.error('Error en raycaster (click):', err);
        setError('Error al procesar clic en parcela');
        hasCriticalError.current = true;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!sceneReadyRef.current || hasCriticalError.current) return;
      if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);

      mouseMoveTimeoutRef.current = setTimeout(() => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        try {
          raycaster.setFromCamera(mouse, camera);
          const plots = terrenoGroup.children.filter(
            (child) => (child as Plot).userData.type === 'farmPlot'
          ) || [];
          const intersects = raycaster.intersectObjects(plots, true);

          if (highlightedPlotRef.current && highlightedPlotRef.current.children[0]) {
            const mat = (highlightedPlotRef.current.children[0] as THREE.Mesh)
              .material as THREE.MeshStandardMaterial;
            if (mat) {
              mat.emissive.set(0x000000);
              mat.emissiveIntensity = 0;
            }
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
              if (mat) {
                mat.emissive.set(0xffff00);
                mat.emissiveIntensity = 0.5;
              }
              renderer.domElement.style.cursor = 'pointer';
            } else {
              highlightedPlotRef.current = null;
            }
          } else {
            highlightedPlotRef.current = null;
            renderer.domElement.style.cursor = 'auto';
          }
        } catch (err) {
          console.error('Error en raycaster (mousemove):', err);
          setError('Error al procesar movimiento del mouse');
          hasCriticalError.current = true;
        }
      }, 100);
    };

    renderer.domElement.addEventListener('click', handleClick, { capture: true });
    renderer.domElement.addEventListener('mousemove', handleMouseMove, { passive: false });

    // --- Controles ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.panSpeed = 0.8;
    controls.screenSpacePanning = true;
    controls.minDistance = 8;
    controls.maxDistance = 70;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 8;

    const panBounds = {
      minX: -35,
      maxX: 35,
      minZ: -35,
      maxZ: 35,
    };

    controls.addEventListener('change', () => {
      const target = controls.target;
      target.x = THREE.MathUtils.clamp(target.x, panBounds.minX, panBounds.maxX);
      target.z = THREE.MathUtils.clamp(target.z, panBounds.minZ, panBounds.maxZ);
      controls.target.copy(target);
    });

    controlsRef.current = controls;

    // --- Animación ---
    const clock = new THREE.Clock();
    const animate = () => {
      if (hasCriticalError.current) {
        console.warn('Bucle de animación detenido debido a error crítico');
        return;
      }

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

      try {
        renderer.render(scene, camera);
      } catch (err) {
        console.error('Error en renderizado:', err);
        setError('Error al renderizar la escena');
        hasCriticalError.current = true;
      }
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
  }, [selectedPlot]); // Dependencia en selectedPlot para re-centrar cámara

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
            <p className="text-sm text-blue-600 mt-2">Preparando tu experiencia de cultivo</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scene;