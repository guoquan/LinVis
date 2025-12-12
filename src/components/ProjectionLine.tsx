import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { calculateRank, isInSpan, type Vector3 } from '../utils/linearAlgebra';

interface ProjectionLineProps {
  basisVectors: Vector3[];
  targetVector: Vector3;
  color?: string;
}

export function ProjectionLine({ basisVectors, targetVector, color = '#ffff00' }: ProjectionLineProps) {
  const rank = useMemo(() => calculateRank(basisVectors), [basisVectors]);
  const shouldRender = useMemo(() => {
    const inSpan = isInSpan(basisVectors, targetVector);
    return (rank === 1 || rank === 2) && !inSpan;
  }, [basisVectors, targetVector, rank]);

  const projection = useMemo(() => {
    if (!shouldRender) return null;

    const targetVec3 = new THREE.Vector3(...targetVector);
    
    // Case Rank 1: Line
    if (rank === 1) {
        const firstNonZero = basisVectors.find(v => new THREE.Vector3(...v).length() > 1e-5);
        if (!firstNonZero) return null;
        
        const u = new THREE.Vector3(...firstNonZero).normalize();
        // Project target onto u: (target . u) * u
        const dot = targetVec3.dot(u);
        return u.multiplyScalar(dot);
    }

    // Case Rank 2: Plane
    if (rank === 2) {
        let v1 = new THREE.Vector3();
        let v2 = new THREE.Vector3();
        
        const firstNonZero = basisVectors.find(v => new THREE.Vector3(...v).length() > 1e-5);
        if (!firstNonZero) return null; 
        v1.set(...firstNonZero);

        let foundV2 = false;
        for (const v of basisVectors) {
            const vec = new THREE.Vector3(...v);
            const cross = new THREE.Vector3().crossVectors(v1, vec);
            if (cross.length() > 1e-5) {
                v2 = vec;
                foundV2 = true;
                break;
            }
        }
        if (!foundV2) return null;

        const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
        
        // Project targetVec3 onto the normal to find the component perpendicular to the plane
        const distance = targetVec3.dot(normal); // (t . n)
        const perpComp = normal.clone().multiplyScalar(distance); // (t . n) * n
        
        // The projection of targetVec3 ONTO the plane is targetVec3 - perpComp
        return targetVec3.clone().sub(perpComp);
    }
    
    return null;
  }, [basisVectors, targetVector, rank, shouldRender]);

  if (!shouldRender || !projection) return null;

  return (
    <group>
        <Line
        points={[targetVector, projection.toArray()]} // Line from target to its projection
        color={color} 
        lineWidth={4} 
        dashed={true}
        dashScale={1}
        dashSize={0.1}
        gapSize={0.05}
        />
        {/* Marker at the foot of the perpendicular */}
        <mesh position={projection}>
            <sphereGeometry args={[0.08, 16, 16]} /> {/* Reduced radius */}
            <meshBasicMaterial color={color} />
        </mesh>
    </group>
  );
}