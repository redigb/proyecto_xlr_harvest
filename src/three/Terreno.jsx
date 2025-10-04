import * as THREE from 'three';

const Terreno = (scene) => {
  const group = new THREE.Group();
  const sectorSize = 1;
  const gridSize = 9;  // 9x9 = 81 sectores para demo

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const geometry = new THREE.BoxGeometry(sectorSize, 0.2, sectorSize);  // Alto sutil para verlos
      const material = new THREE.MeshLambertMaterial({ 
        color: Math.random() > 0.5 ? 0x228B22 : 0x8B4513  // Verde o marrón aleatorio
      });
      const sector = new THREE.Mesh(geometry, material);
      const id = x * gridSize + z + 1;  // ID único (1-81)
      sector.position.set(
        (x - gridSize / 2 + 0.5) * sectorSize, 
        0, 
        (z - gridSize / 2 + 0.5) * sectorSize
      );
      sector.userData = { id };  // ¡Clave para raycaster!
      group.add(sector);
    }
  }

  // Posiciona el group en el origen
  group.position.y = -0.1;

  return group;
};

export default Terreno;  // Default export