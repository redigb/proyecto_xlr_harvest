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
interface Plot extends THREE.Object3D {
    isGroup?: boolean;
    userData: PlotUserData;
    children: THREE.Object3D[];
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
    const drySoilColor = 0xd2b48c;

    for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
            const plotGroup = new THREE.Group() as Plot;
            const plotX = startX + x * (plotSize + spacing);
            const plotZ = startZ + z * (plotSize + spacing);

            const plotGeometry = new THREE.BoxGeometry(plotSize, 0.3, plotSize);
            const plotMaterial = new THREE.MeshStandardMaterial({
                color: drySoilColor,
                emissive: 0x000000,
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

    // === Árboles, nubes, arbustos, vacas y cercas ===
    createTrees(group, totalSize);
    createClouds(group);
    createBushes(group, 20, terrainSize);
    createCows(group, 8, terrainSize);
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
// Funciones auxiliares
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
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(size, 8, 6),
            material
        );
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
    const count = 35;
    const radius = totalSize / 2 + 2;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius + 2.5 + Math.random() * 5;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const tree = createTree();
        tree.position.set(x + Math.random() * 3 - 1.5, 0, z + Math.random() * 3 - 1.5);
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
        bush.add(main);
        bush.position.set(
            (Math.random() - 0.5) * (terrainSize - 20),
            0,
            (Math.random() - 0.5) * (terrainSize - 20)
        );
        bush.userData.isBush = true;
        group.add(bush);
    }
}

function createCows(group: THREE.Group, count: number, terrainSize: number) {
    for (let i = 0; i < count; i++) {
        const cow = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        body.position.y = 0.4;
        cow.add(body);
        cow.position.set(
            (Math.random() - 0.5) * (terrainSize - 15),
            0,
            (Math.random() - 0.5) * (terrainSize - 15)
        );
        cow.userData.isCow = true;
        group.add(cow);
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
        fence.add(post);
    }
    group.add(fence);
}

/**
 * Crea cultivos dentro de una parcela
 */
export function createCropsForPlot(
    plotGroup: Plot,
    plotSize: number,
    cropType: string
) {
    plotGroup.userData.crops?.forEach((c) => {
        (c as any).geometry?.dispose?.();
        (c as any).material?.dispose?.();
        plotGroup.remove(c);
    });
    plotGroup.userData.crops = [];

    if (!cropType) return;

    const cropCount = 9;
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
    if (elapsed >= growthTime && !data.isGrown) data.isGrown = true;

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

export default Terreno;
