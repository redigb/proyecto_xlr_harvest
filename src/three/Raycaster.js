import * as THREE from 'three';

let raycaster, mouse, camera, renderer, selectedGroup, onClickCallback;

// Función init: configura el raycaster y listeners
const init = (r, c, group, callback) => {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  camera = c;
  renderer = r;
  selectedGroup = group;
  onClickCallback = callback;

  // Listener para clics en el canvas
  renderer.domElement.addEventListener('click', onMouseClick, false);
};

// Handler del click: detecta intersección con sectores
const onMouseClick = (event) => {
  // Normaliza coordenadas del mouse
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  // Rayo desde cámara
  raycaster.setFromCamera(mouse, camera);

  // Busca intersecciones con hijos del grupo de terreno (sectores)
  const intersects = raycaster.intersectObjects(selectedGroup.children, true);

  if (intersects.length > 0) {
    const sector = intersects[0].object;
    if (sector.userData && sector.userData.id) {
      onClickCallback({ id: sector.userData.id });  // Envía { id: X } al callback (para el panel)
    }
  }
};

// Cleanup (opcional, para desmontar)
const dispose = () => {
  if (renderer.domElement) {
    renderer.domElement.removeEventListener('click', onMouseClick);
  }
};

// Exporta como default: un objeto con métodos
export default { init, dispose };