import { useMemo } from 'react';
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { getCoordinates, type Vector3 } from '../utils/linearAlgebra';

interface CoordinateVisualizerProps {
  basisVectors: Vector3[];
  targetVector: Vector3;
  color: string;
  fontSize: number;
}

export function CoordinateVisualizer({ basisVectors, targetVector, color, fontSize }: CoordinateVisualizerProps) {
  const data = useMemo(() => getCoordinates(basisVectors, targetVector), [basisVectors, targetVector]);

  if (!data) return null;

  const { coordinates, basisUsed } = data;
  const rank = basisUsed.length;

  if (rank === 0) return null;
  
  const Label = ({ position, text, color }: { position: [number, number, number], text: string, color: string }) => (
      <Html position={position} center style={{ pointerEvents: 'none' }}>
          <div style={{
              color: color,
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: `${fontSize * 16}px`, // Scale base font size (16px)
              fontFamily: 'monospace',
              border: `1px solid ${color}`
          }}>
              {text}
          </div>
      </Html>
  );

  // Rank 1: Line
  if (rank === 1) {
    // p = c1 * v1
    const v1 = new THREE.Vector3(...basisUsed[0]);
    const c1 = coordinates[0];
    const p = v1.clone().multiplyScalar(c1);

    return (
      <group>
         {/* Highlight the component along the basis vector */}
         <Line
            points={[[0,0,0], p.toArray()]}
            color={color}
            lineWidth={4}
            dashed={true}
            dashScale={1}
            dashSize={0.1}
            gapSize={0.05}
         />
         <Label position={p.clone().multiplyScalar(0.5).toArray()} text={c1.toFixed(2)} color={color} />
      </group>
    );
  }

  // Rank 2: Plane
  if (rank === 2) {
      // p = c1*v1 + c2*v2
      const v1 = new THREE.Vector3(...basisUsed[0]);
      const v2 = new THREE.Vector3(...basisUsed[1]);
      const c1 = coordinates[0];
      const c2 = coordinates[1];
      
      const comp1 = v1.clone().multiplyScalar(c1);
      const comp2 = v2.clone().multiplyScalar(c2);
      const p = comp1.clone().add(comp2);

      return (
          <group>
              {/* Component 1 along v1 */}
              <Line
                points={[[0,0,0], comp1.toArray()]}
                color={color}
                lineWidth={3}
                dashed={true}
                dashSize={0.2}
                gapSize={0.1}
              />
              {/* Component 2 along v2 */}
               <Line
                points={[[0,0,0], comp2.toArray()]}
                color={color}
                lineWidth={3}
                dashed={true}
                dashSize={0.2}
                gapSize={0.1}
              />
              
              {/* Parallel line from comp1 to p (parallel to v2) */}
              <Line
                points={[comp1.toArray(), p.toArray()]}
                color={color}
                lineWidth={1}
                opacity={0.5}
                transparent
              />

              {/* Parallel line from comp2 to p (parallel to v1) */}
              <Line
                points={[comp2.toArray(), p.toArray()]}
                color={color}
                lineWidth={1}
                opacity={0.5}
                transparent
              />

              {/* Labels */}
              <mesh position={comp1}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color={color} />
              </mesh>
              <mesh position={comp2}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color={color} />
              </mesh>
              <Label position={comp1.clone().multiplyScalar(1.05).toArray()} text={c1.toFixed(2)} color={color} />
              <Label position={comp2.clone().multiplyScalar(1.05).toArray()} text={c2.toFixed(2)} color={color} />
          </group>
      );
  }
  
  // Rank 3: Space
  if (rank === 3) {
      const v1 = new THREE.Vector3(...basisUsed[0]);
      const v2 = new THREE.Vector3(...basisUsed[1]);
      const v3 = new THREE.Vector3(...basisUsed[2]);
      const c1 = coordinates[0];
      const c2 = coordinates[1];
      const c3 = coordinates[2];
      
      const comp1 = v1.clone().multiplyScalar(c1);
      const comp2 = v2.clone().multiplyScalar(c2);
      const comp3 = v3.clone().multiplyScalar(c3);
      
      const p = comp1.clone().add(comp2).add(comp3);
      
      // Draw path: 0 -> c1v1 -> c1v1+c2v2 -> p
      const p1 = comp1;
      const p2 = comp1.clone().add(comp2);
      
      return (
          <group>
            {/* Main Path */}
            <Line
                points={[[0,0,0], p1.toArray(), p2.toArray(), p.toArray()]}
                color={color}
                lineWidth={2}
                dashed={true}
            />
            
            {/* Show individual components on axes */}
            <Line points={[[0,0,0], comp1.toArray()]} color={color} lineWidth={1} opacity={0.5} transparent />
            <Line points={[[0,0,0], comp2.toArray()]} color={color} lineWidth={1} opacity={0.5} transparent />
            <Line points={[[0,0,0], comp3.toArray()]} color={color} lineWidth={1} opacity={0.5} transparent />

             <mesh position={comp1}><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color={color} /></mesh>
             <mesh position={comp2}><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color={color} /></mesh>
             <mesh position={comp3}><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color={color} /></mesh>

             <Label position={comp1.clone().multiplyScalar(1.05).toArray()} text={c1.toFixed(2)} color={color} />
             <Label position={comp2.clone().multiplyScalar(1.05).toArray()} text={c2.toFixed(2)} color={color} />
             <Label position={comp3.clone().multiplyScalar(1.05).toArray()} text={c3.toFixed(2)} color={color} />
          </group>
      );
  }

  return null;
}