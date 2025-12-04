import { useMemo } from 'react';
import * as THREE from 'three';
import { calculateRank, getBasis, type Vector3 } from '../utils/linearAlgebra';
import { SPAN_VIS_COLOR } from '../App'; // Import the color constant

interface SpanVisualizerProps {
  vectors: Vector3[];
  color?: string;
}

export function SpanVisualizer({ vectors, color = SPAN_VIS_COLOR }: SpanVisualizerProps) {
  const rank = useMemo(() => calculateRank(vectors), [vectors]);
  const basis = useMemo(() => getBasis(vectors), [vectors]);

  // Rank 1: Line (Infinite-ish)
  if (rank === 1 && basis.length >= 1) {
    const u = new THREE.Vector3(...basis[0]).normalize();
    
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), u);

    return (
        <group quaternion={quaternion}>
            {/* Core line */}
            <mesh>
                <cylinderGeometry args={[0.02, 0.02, 200, 8]} /> {/* Thinner */}
                <meshBasicMaterial color={SPAN_VIS_COLOR} opacity={0.8} transparent />
            </mesh>
            {/* Faint glow/guide */}
            <mesh>
                <cylinderGeometry args={[0.05, 0.05, 200, 8]} /> 
                <meshBasicMaterial color={SPAN_VIS_COLOR} opacity={0.2} transparent depthWrite={false} />
            </mesh>
        </group>
    );
  }

  // Rank 2: Skewed Grid Plane
  if (rank === 2 && basis.length >= 2) {
      const u = new THREE.Vector3(...basis[0]);
      const v = new THREE.Vector3(...basis[1]);
      
      const points: THREE.Vector3[] = [];
      const size = 10; 
      const step = 1; 

      for (let i = -size; i <= size; i += step) {
          const start = u.clone().multiplyScalar(-size).add(v.clone().multiplyScalar(i));
          const end = u.clone().multiplyScalar(size).add(v.clone().multiplyScalar(i));
          points.push(start, end);
      }

      for (let i = -size; i <= size; i += step) {
          const start = v.clone().multiplyScalar(-size).add(u.clone().multiplyScalar(i));
          const end = v.clone().multiplyScalar(size).add(u.clone().multiplyScalar(i));
          points.push(start, end);
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      const normal = new THREE.Vector3().crossVectors(u, v).normalize();
      const planeQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      return (
          <group>
            <lineSegments geometry={geometry}>
                <lineBasicMaterial color={SPAN_VIS_COLOR} opacity={0.6} transparent linewidth={1} /> {/* Standard width */}
            </lineSegments>
            {/* Semi-transparent backing plane */}
            <mesh quaternion={planeQuat}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={SPAN_VIS_COLOR} opacity={0.15} transparent side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          </group>
      );
  }

  // Rank 3: 3D Skewed Lattice
  if (rank === 3 && basis.length >= 3) {
      const u = new THREE.Vector3(...basis[0]);
      const v = new THREE.Vector3(...basis[1]);
      const w = new THREE.Vector3(...basis[2]);
      
      const points: THREE.Vector3[] = [];
      const size = 3; 
      
      for (let j = -size; j <= size; j++) {
          for (let k = -size; k <= size; k++) {
              const center = v.clone().multiplyScalar(j).add(w.clone().multiplyScalar(k));
              const start = center.clone().add(u.clone().multiplyScalar(-size));
              const end = center.clone().add(u.clone().multiplyScalar(size));
              points.push(start, end);
          }
      }

      for (let i = -size; i <= size; i++) {
          for (let k = -size; k <= size; k++) {
              const center = u.clone().multiplyScalar(i).add(w.clone().multiplyScalar(k));
              const start = center.clone().add(v.clone().multiplyScalar(-size));
              const end = center.clone().add(v.clone().multiplyScalar(size));
              points.push(start, end);
          }
      }

      for (let i = -size; i <= size; i++) {
          for (let j = -size; j <= size; j++) {
              const center = u.clone().multiplyScalar(i).add(v.clone().multiplyScalar(j));
              const start = center.clone().add(w.clone().multiplyScalar(-size));
              const end = center.clone().add(w.clone().multiplyScalar(size));
              points.push(start, end);
          }
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      return (
          <group>
            <lineSegments geometry={geometry}>
                <lineBasicMaterial color={SPAN_VIS_COLOR} opacity={0.3} transparent linewidth={1} /> {/* Standard width */}
            </lineSegments>
          </group>
      );
    }
  return null;
}