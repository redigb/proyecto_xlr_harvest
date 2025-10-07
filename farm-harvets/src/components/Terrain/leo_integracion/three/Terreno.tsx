import * as THREE from 'three';

/** Datos del userData de una parcela o entidad del terreno */
export interface PlotUserData {
  id: number;
  type?: string;
  crop?: string | null;
  plantTime?: number | null;
  isGrown?: boolean;
  isWatered?: boolean;
  crops?: THREE.Object3D[];
  originalColor?: number;
  isTree?: boolean;
  isCloud?: boolean;
  isBush?: boolean;
  isCow?: boolean;
  trunk?: THREE.Object3D;
  crowns?: THREE.Object3D[];
  dispose?: () => void;
}

/** Objeto Three.js con datos de parcela */
export interface Plot extends THREE.Group {
  userData: PlotUserData;
}

/**
 * Crea el terreno principal del juego
 */
const Terreno = (scene: THREE.Scene): THREE.Group => {
  const group = new THREE.Group();
  let groundTexture: THREE.Texture | null = null;

  const terrainSize = 80;
  const groundGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize);
  let groundMaterial: THREE.MeshStandardMaterial;

  try {
    groundTexture = new THREE.TextureLoader().load(
      '/assets/textures/grass.jpg',
      (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(12, 12);
        texture.needsUpdate = true;
      },
      undefined,
      (error) => console.error('Error cargando textura de suelo:', error)
    );
    groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      color: 0x7cfc00,
    });
  } catch {
    groundMaterial = new THREE.MeshStandardMaterial({ color: 0x32cd32 });
  }

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  // === Parcelas de cultivo ===
  const plotSize = 3.0;
  const gridSize = 4;
  const spacing = 1.0;
  const totalSize = (plotSize + spacing) * gridSize - spacing;
  const startX = -totalSize / 2 + plotSize / 2;
  const startZ = -totalSize / 2 + plotSize / 2;
  const drySoilColor = 0xd2b48c; // Marrón claro (Tan)

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const plotGroup = new THREE.Group() as Plot;
      const plotX = startX + x * (plotSize + spacing);
      const plotZ = startZ + z * (plotSize + spacing);

      const plotGeometry = new THREE.BoxGeometry(plotSize, 0.3, plotSize);
      const plotMaterial = new THREE.MeshStandardMaterial({
        color: drySoilColor,
        emissive: 0x000000,
        emissiveIntensity: 0,
      });

      const plotBase = new THREE.Mesh(plotGeometry, plotMaterial);
      plotBase.position.y = 0.15;
      plotBase.castShadow = true;
      plotBase.receiveShadow = true;
      plotGroup.add(plotBase);

      plotGroup.userData = {
        id: x * gridSize + z + 1,
        type: 'farmPlot',
        crop: null,
        plantTime: null,
        isGrown: false,
        isWatered: false,
        crops: [],
        originalColor: drySoilColor,
      };

      plotGroup.position.set(plotX, 0, plotZ);
      group.add(plotGroup);
    }
  }

  // === Árboles, nubes, arbustos, vacas, rocas y cercas ===
  createTrees(group, totalSize);
  createClouds(group);
  createBushes(group, 20, terrainSize);
  createCows(group, 8, terrainSize);
  createRocks(group, 15, terrainSize);
  createFence(group, 36);

  // === Limpieza ===
  group.userData.dispose = () => {
    if (groundTexture) groundTexture.dispose();

    group.traverse((obj: THREE.Object3D) => {
      const mesh = obj as THREE.Mesh;

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          (mesh.material as THREE.Material).dispose();
        }
      }

      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
    });
  };

  return group;
};

// -----------------------------------------------------
// Funciones auxiliares para crear elementos
// -----------------------------------------------------

function createTree(): THREE.Group {
  const tree = new THREE.Group();
  const trunkHeight = 2.5 + Math.random() * 0.5;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.25, trunkHeight, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  tree.add(trunk);

  const crowns: THREE.Object3D[] = [];
  const colors = [0x228b22, 0x2e8b57, 0x3cb371, 0x228b22];
  for (let i = 0; i < 4; i++) {
    const crownHeight = 1.8 - i * 0.3 + Math.random() * 0.3;
    const crownRadius = 1.4 - i * 0.25 + Math.random() * 0.2;
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(crownRadius, crownHeight, 8),
      new THREE.MeshStandardMaterial({ color: colors[i] })
    );
    crown.position.y = trunkHeight + i * 1.2 + crownHeight / 2;
    crown.castShadow = true;
    tree.add(crown);
    crowns.push(crown);
  }

  tree.userData.trunk = trunk;
  tree.userData.crowns = crowns;
  tree.userData.isTree = true;
  return tree;
}

function createCloud(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
  });
  const count = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const size = 1.2 + Math.random() * 0.8;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 6), material);
    sphere.position.set(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 3
    );
    const scale = 0.8 + Math.random() * 0.4;
    sphere.scale.set(scale, scale * 0.7, scale);
    group.add(sphere);
  }
  group.userData.isCloud = true;
  return group;
}

function createTrees(group: THREE.Group, totalSize: number) {
  // Árboles cercanos a las parcelas
  const count = 35;
  const radius = totalSize / 2 + 2;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = radius + 2.5 + Math.random() * 5.5;
    const x = Math.cos(angle) * dist + (Math.random() - 0.5) * 3;
    const z = Math.sin(angle) * dist + (Math.random() - 0.5) * 3;
    const tree = createTree();
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    group.add(tree);
  }

  // Bosque exterior
  const forestCount = 25;
  const forestRadius = 35;
  for (let i = 0; i < forestCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = forestRadius * (0.6 + Math.random() * 0.8);
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const distFromCenter = Math.sqrt(x * x + z * z);
    if (distFromCenter < 15) continue;
    const tree = createTree();
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    group.add(tree);
  }

  // Árboles adicionales dispersos
  const additionalTrees = 10;
  for (let i = 0; i < additionalTrees; i++) {
    const x = (Math.random() - 0.5) * 70;
    const z = (Math.random() - 0.5) * 70;
    const distFromCenter = Math.sqrt(x * x + z * z);
    if (distFromCenter < 15 || distFromCenter > 35) continue;
    const tree = createTree();
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    group.add(tree);
  }
}

function createClouds(group: THREE.Group) {
  const count = 12;
  const height = 18;
  const radius = 40;
  for (let i = 0; i < count; i++) {
    const cloud = createCloud();
    const x = (Math.random() - 0.5) * radius * 2;
    const z = (Math.random() - 0.5) * radius * 2;
    const y = height + Math.random() * 5;
    const scale = 0.8 + Math.random() * 0.6;
    cloud.position.set(x, y, z);
    cloud.rotation.y = Math.random() * Math.PI * 2;
    cloud.scale.set(scale, scale, scale);
    group.add(cloud);
  }
}

function createBushes(group: THREE.Group, count: number, terrainSize: number) {
  const colors = [0x228b22, 0x32cd32, 0x3cb371, 0x2e8b57, 0x006400];
  for (let i = 0; i < count; i++) {
    const bush = new THREE.Group();
    const color = colors[Math.floor(Math.random() * colors.length)];

    const main = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 6),
      new THREE.MeshStandardMaterial({ color })
    );
    main.position.y = 0.4;
    main.scale.set(1, 0.6, 1);
    bush.add(main);

    // Esferas adicionales
    for (let j = 0; j < 3; j++) {
      const ballSize = 0.2 + Math.random() * 0.15;
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(ballSize, 6, 4),
        new THREE.MeshStandardMaterial({ color })
      );
      ball.position.set(
        (Math.random() - 0.5) * 0.5,
        0.3 + Math.random() * 0.3,
        (Math.random() - 0.5) * 0.5
      );
      bush.add(ball);
    }

    let x, z, validPosition = false;
    while (!validPosition) {
      x = (Math.random() - 0.5) * (terrainSize - 20);
      z = (Math.random() - 0.5) * (terrainSize - 20);
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      validPosition = distanceFromCenter > 8 && distanceFromCenter < 35;
    }

    bush.position.set(x as number, 0, z as number);
    bush.rotation.y = Math.random() * Math.PI * 2;
    const scale = 0.7 + Math.random() * 0.6;
    bush.scale.set(scale, scale, scale);
    bush.userData.isBush = true;
    bush.castShadow = true;
    group.add(bush);
  }
}

function createCows(group: THREE.Group, count: number, terrainSize: number) {
  for (let i = 0; i < count; i++) {
    const cow = new THREE.Group();

    // Cuerpo
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    body.scale.set(1.5, 0.8, 1.0);
    body.position.y = 0.4;
    body.castShadow = true;
    cow.add(body);

    // Manchas
    const spotCount = 4 + Math.floor(Math.random() * 3);
    for (let j = 0; j < spotCount; j++) {
      const spot = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 + Math.random() * 0.08, 6, 4),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      spot.position.set(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.3 + 0.4,
        (Math.random() - 0.5) * 0.4
      );
      cow.add(spot);
    }

    // Cabeza
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    head.position.set(0.6, 0.5, 0);
    cow.add(head);

    // Orejas
    const ear = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 4, 4),
      new THREE.MeshStandardMaterial({ color: 0xf5f5dc })
    );
    const ear1 = ear.clone();
    ear1.position.set(0.7, 0.6, 0.15);
    ear1.scale.set(1, 0.3, 0.5);
    cow.add(ear1);
    const ear2 = ear.clone();
    ear2.position.set(0.7, 0.6, -0.15);
    ear2.scale.set(1, 0.3, 0.5);
    cow.add(ear2);

    // Cuernos (aleatorio)
    if (Math.random() > 0.3) {
      const horn = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, 0.15, 4),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      const horn1 = horn.clone();
      horn1.position.set(0.65, 0.65, 0.1);
      horn1.rotation.z = -0.3;
      cow.add(horn1);
      const horn2 = horn.clone();
      horn2.position.set(0.65, 0.65, -0.1);
      horn2.rotation.z = 0.3;
      cow.add(horn2);
    }

    // Patas
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    const positions = [
      [0.3, 0.15, 0.25],
      [0.3, 0.15, -0.25],
      [-0.3, 0.15, 0.25],
      [-0.3, 0.15, -0.25],
    ];
    positions.forEach((pos) => {
      const legClone = leg.clone();
      legClone.position.set(pos[0], pos[1], pos[2]);
      legClone.castShadow = true;
      cow.add(legClone);
    });

    // Cola
    const tail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.01, 0.4, 4),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    tail.position.set(-0.5, 0.5, 0);
    tail.rotation.z = Math.PI / 6;
    cow.add(tail);

    let x, z, validPosition = false;
    while (!validPosition) {
      x = (Math.random() - 0.5) * (terrainSize - 15);
      z = (Math.random() - 0.5) * (terrainSize - 15);
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      validPosition = distanceFromCenter > 10 && distanceFromCenter < 30;
    }

    cow.position.set(x as number, 0, z as number);
    cow.rotation.y = Math.random() * Math.PI * 2;
    const scale = 0.8 + Math.random() * 0.4;
    cow.scale.set(scale, scale, scale);
    cow.userData.isCow = true;
    group.add(cow);
  }
}

function createRocks(group: THREE.Group, count: number, terrainSize: number) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 20;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const distanceFromCenter = Math.sqrt(x * x + z * z);
    if (distanceFromCenter < 10) continue;

    const rockSize = 0.4 + Math.random() * 0.6;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(rockSize, 0),
      new THREE.MeshStandardMaterial({ color: 0x696969 })
    );
    rock.position.set(x, rockSize / 2, z);
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    rock.castShadow = true;
    group.add(rock);
  }
}

function createFence(group: THREE.Group, size: number) {
  const fence = new THREE.Group();
  const postGeometry = new THREE.CylinderGeometry(0.1, 0.12, 1.5, 6);
  const railGeometry = new THREE.BoxGeometry(0.08, 0.08, (2 * size) / 4);
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const postCount = 16;
  const step = (Math.PI * 2) / postCount;

  for (let i = 0; i < postCount; i++) {
    const angle = i * step;
    const x = Math.cos(angle) * size;
    const z = Math.sin(angle) * size;
    const post = new THREE.Mesh(postGeometry, woodMaterial);
    post.position.set(x, 0.75, z);
    post.castShadow = true;
    fence.add(post);

    if (i < postCount - 1) {
      const nextAngle = (i + 1) * step;
      const nextX = Math.cos(nextAngle) * size;
      const nextZ = Math.sin(nextAngle) * size;
      const rail = new THREE.Mesh(railGeometry, woodMaterial);
      const midX = (x + nextX) / 2;
      const midZ = (z + nextZ) / 2;
      const distance = Math.sqrt((nextX - x) ** 2 + (nextZ - z) ** 2);
      rail.scale.z = distance / ((2 * size) / 4);
      rail.position.set(midX, 0.4, midZ);
      rail.rotation.y = Math.atan2(nextZ - z, nextX - x);
      rail.castShadow = true;
      fence.add(rail);
    }
  }

  // Cerrar el círculo
  const firstAngle = 0;
  const lastAngle = (postCount - 1) * step;
  const firstX = Math.cos(firstAngle) * size;
  const firstZ = Math.sin(firstAngle) * size;
  const lastX = Math.cos(lastAngle) * size;
  const lastZ = Math.sin(lastAngle) * size;
  const rail = new THREE.Mesh(railGeometry, woodMaterial);
  const midX = (firstX + lastX) / 2;
  const midZ = (firstZ + lastZ) / 2;
  const distance = Math.sqrt((firstX - lastX) ** 2 + (firstZ - lastZ) ** 2);
  rail.scale.z = distance / ((2 * size) / 4);
  rail.position.set(midX, 0.4, midZ);
  rail.rotation.y = Math.atan2(firstZ - lastZ, firstX - lastX);
  rail.castShadow = true;
  fence.add(rail);

  group.add(fence);
}

// -----------------------------------------------------
// Funciones exportadas para cultivos
// -----------------------------------------------------

/**
 * Crea cultivos dentro de una parcela
 */
export function createCropsForPlot(plotGroup: Plot, plotSize: number, cropType: string) {
  plotGroup.userData.crops?.forEach((c) => {
    const mesh = c as THREE.Mesh;
    mesh.geometry?.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
    plotGroup.remove(c);
  });
  plotGroup.userData.crops = [];

  if (!cropType) return;

  const rows = 3;
  const cols = 3;
  const cropSpacing = plotSize * 0.25;
  const startX = -plotSize / 2 + cropSpacing;
  const startZ = -plotSize / 2 + cropSpacing;
  const initialHeight = 0.2;

  let geometry: THREE.BufferGeometry;
  let material: THREE.MeshStandardMaterial;

  switch (cropType) {
    case 'Papa':
      geometry = new THREE.SphereGeometry(0.1, 6, 6);
      material = new THREE.MeshStandardMaterial({ color: 0xffd700 });
      break;
    case 'Maíz':
      geometry = new THREE.CylinderGeometry(0.05, 0.08, initialHeight, 6);
      material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
      break;
    case 'Quinua':
      geometry = new THREE.SphereGeometry(0.08, 6, 6);
      material = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
      break;
    default:
      return;
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = startX + i * cropSpacing;
      const z = startZ + j * cropSpacing;
      const crop = new THREE.Mesh(geometry, material);
      crop.position.set(x, 0.15 + initialHeight / 2, z);
      crop.castShadow = true;
      crop.userData = { initialHeight, growthFactor: 0 };
      plotGroup.add(crop);
      plotGroup.userData.crops?.push(crop);
    }
  }
}

/**
 * Actualiza el crecimiento de los cultivos con el tiempo
 */
export function updateCropGrowth(plotGroup: Plot, currentTime: number) {
  const data = plotGroup.userData;
  if (!data.crop || !data.plantTime) return;

  const growthTime = 120000; // 2 minutos
  const elapsed = currentTime - data.plantTime;
  if (elapsed >= growthTime && !data.isGrown) {
    data.isGrown = true;
    console.log(`Parcela ${data.id} lista para cosechar: ${data.crop}`);
  }

  const factor = Math.min(elapsed / growthTime, 1);
  data.crops?.forEach((crop: any) => {
    if (crop.userData.growthFactor !== factor) {
      crop.userData.growthFactor = factor;
      const scale = 1 + factor * 2;
      crop.scale.set(1, scale, 1);
      crop.position.y = 0.15 + (crop.userData.initialHeight * scale) / 2;
    }
  });
}

/**
 * Crea efecto de lluvia sobre la parcela al regar
 */
export function createRainEffect(plot: Plot) {
  const plotSize = 3.0;

  // Crear nube pequeña
  const cloudGroup = new THREE.Group();
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    transparent: true,
    opacity: 0.9,
  });

  for (let i = 0; i < 4; i++) {
    const size = 0.3 + Math.random() * 0.2;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 6), cloudMaterial);
    sphere.position.set((Math.random() - 0.5) * 0.8, 0, (Math.random() - 0.5) * 0.6);
    cloudGroup.add(sphere);
  }

  cloudGroup.position.set(0, 2.5, 0);
  plot.add(cloudGroup);

  // Crear partículas de lluvia
  const rainCount = 50;
  const rainGeometry = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(rainCount * 3);

  for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * plotSize;
    rainPositions[i * 3 + 1] = 2 + Math.random() * 1;
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * plotSize;
  }

  rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

  const rainMaterial = new THREE.PointsMaterial({
    color: 0x4db8ff,
    size: 0.08,
    transparent: true,
    opacity: 0.8,
  });

  const rainParticles = new THREE.Points(rainGeometry, rainMaterial);
  plot.add(rainParticles);

  // Animar lluvia
  let animationFrame = 0;
  const animateRain = () => {
    if (animationFrame < 120) {
      // 2 segundos a 60fps
      const positions = rainGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= 0.05; // Caída de gotas

        // Resetear gotas que caen muy bajo
        if (positions[i * 3 + 1] < 0.3) {
          positions[i * 3 + 1] = 2 + Math.random() * 1;
        }
      }

      rainGeometry.attributes.position.needsUpdate = true;
      animationFrame++;
      requestAnimationFrame(animateRain);
    } else {
      // Eliminar efectos después de la animación
      plot.remove(cloudGroup);
      plot.remove(rainParticles);

      // Limpiar geometrías y materiales
      cloudGroup.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      rainGeometry.dispose();
      rainMaterial.dispose();

      console.log('Efecto de lluvia completado y limpiado');
    }
  };

  animateRain();
}

export default Terreno;