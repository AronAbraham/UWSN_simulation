import { Mesh, InstancedMesh, Matrix4 } from 'three';

// Create a mock BatchedMesh class
class MockBatchedMesh {
  constructor() {
    console.warn('BatchedMesh is not available in this version of three.js');
  }
}

// Export the mock for compatibility
export const BatchedMesh = MockBatchedMesh;

export function setObjectType(mesh) {

  if (mesh.isMesh) {

    return 0;

  } else if (mesh.isInstancedMesh) {

    return 1;

  } else {

    return 2;

  }

}

export function getFirstRayIntersection(objects, raycaster, localRay, appendMatrices = false) {

  const results = [];
  for (let i = 0, l = objects.length; i < l; i++) {

    const object = objects[i];
    if (object.visible === false) continue;

    const matrices = appendMatrices ? [] : null;
    const intersects = object.raycast(raycaster, localRay, matrices);
    for (let j = 0, jl = intersects.length; j < jl; j++) {

      const hit = intersects[j];
      hit.object = object;
      hit.faceIndex = hit.face.a;
      hit.point.applyMatrix4(object.matrixWorld);
      hit.distance = hit.point.distanceTo(raycaster.ray.origin);
      hit.object = object;

      if (appendMatrices) {

        hit.matrices = matrices;

      }

      results.push(hit);

    }

  }

  results.sort((a, b) => a.distance - b.distance);
  return results[0] || null;

}

export function isBufferGeometryBounded(bufferGeometry) {

  return !isNaN(bufferGeometry.boundingBox.min.x);

} 