import { useMemo } from 'react';
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { VectorArrow } from './VectorArrow';
import { type Vector3 } from '../utils/linearAlgebra';

interface Props {
  vectors: Vector3[];
  fontSize: number;
}

interface GramSchmidtStep {
  index: number;
  original: THREE.Vector3;
  orthogonal: THREE.Vector3;
  projectionSum: THREE.Vector3;
}

export function GramSchmidtVisualizer({ vectors, fontSize }: Props) {
  const steps = useMemo(() => {
      const uVectors: THREE.Vector3[] = [];
      const visualizations: GramSchmidtStep[] = []; 

      vectors.forEach((vRaw, i) => {
          const v = new THREE.Vector3(...vRaw);
          const u = v.clone();
          
          // Subtract projections onto existing u's
          uVectors.forEach((prevU) => {
              const uLenSq = prevU.lengthSq();
              if (uLenSq > 1e-9) {
                  const proj = prevU.clone().multiplyScalar(v.dot(prevU) / uLenSq);
                  u.sub(proj);
              }
          });

          // The vector 'u' is now the orthogonal part.
          // sum(projections) = v - u.
          const sumProjections = v.clone().sub(u);

          uVectors.push(u);

          visualizations.push({
              index: i,
              original: v,
              orthogonal: u.clone(),
              projectionSum: sumProjections, 
          });
      });

      return visualizations;
  }, [vectors]);

  return (
    <group>
       {steps.map((step, i) => {
           // For the first vector, u1 = v1. Just show u1 label or highlight?
           // We'll show u1 vector in Green to indicate it's part of the new basis.
           
           const isZero = step.orthogonal.length() < 1e-5;

           return (
               <group key={i}>
                   {/* The Orthogonal Vector u_i (result) */}
                   {/* We draw this at the origin */}
                   {!isZero && (
                       <VectorArrow
                          end={step.orthogonal.toArray()}
                          color="#39FF14" // Neon Green
                          label={`u${i+1}`}
                          fontSize={fontSize}
                       />
                   )}

                   {/* Skip projection visualization for the first vector as it equals the original */}
                   {i > 0 && (
                       <>
                           {/* The Projection Vector (in the previous span) */}
                           {step.projectionSum.length() > 1e-5 && (
                               <>
                                   {/* Line from Origin to Projection Point */}
                                   <Line
                                       points={[[0,0,0], step.projectionSum.toArray()]}
                                       color="#FFFF00" // Yellow
                                       dashed
                                       dashSize={0.1}
                                       gapSize={0.05}
                                       lineWidth={2}
                                   />
                                   {/* Dot at Projection Point */}
                                   <mesh position={step.projectionSum}>
                                       <sphereGeometry args={[0.04]} />
                                       <meshBasicMaterial color="#FFFF00" />
                                   </mesh>
                                   {/* Label for Projection */}
                                   <Html position={step.projectionSum.clone().multiplyScalar(0.5)} center style={{ pointerEvents: 'none' }}>
                                       <div style={{ color: '#FFFF00', fontSize: '12px', background: 'rgba(0,0,0,0.5)', padding: '2px' }}>
                                           proj
                                       </div>
                                   </Html>
                               </>
                           )}

                           {/* The "Difference" Line: From Projection Point to Tip of v_i */}
                           {/* This visually completes the triangle: p + u = v */}
                           {/* Equivalently, it connects v_i tip to projection tip? No. */}
                           {/* v = p + u.  */}
                           {/* We have v (original). We have p (projection). */}
                           {/* We want to show that v - p = u. */}
                           {/* So drawing a line from p to v represents u (shifted). */}
                           <Line
                               points={[step.projectionSum.toArray(), step.original.toArray()]}
                               color="#39FF14" // Green matches u_i
                               dashed
                               dashSize={0.1}
                               gapSize={0.05}
                               lineWidth={2}
                               opacity={0.6}
                               transparent
                           />
                       </>
                   )}
               </group>
           )
       })}
    </group>
  );
}
