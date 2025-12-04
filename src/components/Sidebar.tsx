import { calculateRank, isLinearlyIndependent, isInSpan, getDependencyRelations, type Vector3 } from '../utils/linearAlgebra';

interface SidebarProps {
  vectors: Vector3[];
  setVectors: (v: Vector3[]) => void;
  targetVector: Vector3;
  setTargetVector: (v: Vector3) => void;
  autoRotate: boolean;
  onToggleRotate: () => void;
  onResetView: () => void;
  onClose?: () => void;
}

export function Sidebar({ 
  vectors, setVectors, targetVector, setTargetVector,
  autoRotate, onToggleRotate, onResetView, onClose 
}: SidebarProps) {
  const rank = calculateRank(vectors);
  const independent = isLinearlyIndependent(vectors);
  const inSpan = isInSpan(vectors, targetVector);
  const relations = getDependencyRelations(vectors);

  const handleVectorChange = (index: number, axis: 0 | 1 | 2, value: string) => {
    const numVal = parseFloat(value) || 0;
    const newVectors = [...vectors];
    newVectors[index] = [...newVectors[index]]; // copy vector
    newVectors[index][axis] = numVal;
    setVectors(newVectors);
  };

  const handleAddVector = () => {
    setVectors([...vectors, [1, 0, 0]]);
  };

  const handleRemoveVector = (index: number) => {
    const newVectors = vectors.filter((_, i) => i !== index);
    setVectors(newVectors);
  };

  const handleTargetChange = (axis: 0 | 1 | 2, value: string) => {
    const numVal = parseFloat(value) || 0;
    const newTarget = [...targetVector];
    newTarget[axis] = numVal;
    setTargetVector(newTarget as Vector3);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#2a2a2a',
      color: '#eee',
      padding: '20px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      fontFamily: 'sans-serif',
      boxShadow: '-2px 0 10px rgba(0,0,0,0.5)',
      position: 'relative'
    }}>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px',
            lineHeight: 0.8
          }}
          title="Close Sidebar"
        >
          &times;
        </button>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingRight: onClose ? '30px' : '0' }}>
        <h2 style={{ margin: 0 }}>Controls</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={onResetView}
                style={{ 
                    background: '#555', color: 'white', border: 'none', 
                    padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' 
                }}
                title="Reset Camera View"
            >
                Reset View
            </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
            <input 
                type="checkbox" 
                checked={autoRotate} 
                onChange={onToggleRotate}
                style={{ marginRight: '8px' }}
            />
            Auto Rotate
        </label>
      </div>

      {/* Analysis Results */}
      <div style={{ background: '#333', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, fontSize: '16px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>Analysis</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Rank:</span>
          <strong>{rank}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Linear Indep.:</span>
          <strong style={{ color: independent ? '#4f4' : '#f44' }}>{independent ? 'Yes' : 'No'}</strong>
        </div>
        
        {!independent && relations.length > 0 && (
          <div style={{ marginTop: '10px', padding: '8px', background: '#443322', borderRadius: '4px', borderLeft: '3px solid #f80' }}>
            <div style={{ fontSize: '12px', color: '#fb0', marginBottom: '4px' }}>Dependencies Found:</div>
            {relations.map((rel, i) => (
              <div key={i} style={{ fontSize: '13px', fontFamily: 'monospace' }}>{rel}</div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '5px', borderTop: '1px solid #555' }}>
          <span>Target in Span:</span>
          <strong style={{ color: inSpan ? '#4f4' : '#f44' }}>{inSpan ? 'Yes' : 'No'}</strong>
        </div>
      </div>

      {/* Target Vector */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', color: '#ff4444' }}>Target Vector (b)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '2px', 
              borderLeft: '2px solid #888', 
              borderRight: '2px solid #888', 
              padding: '2px 8px',
              borderRadius: '8px'
            }}>
            {['x', 'y', 'z'].map((axis, i) => (
                <input
                  key={axis}
                  type="number"
                  step="0.1"
                  value={targetVector[i]}
                  onChange={(e) => handleTargetChange(i as 0|1|2, e.target.value)}
                  style={{ 
                    width: '50px', 
                    background: '#444', 
                    border: '1px solid #555', 
                    color: 'white', 
                    padding: '4px', 
                    borderRadius: '3px',
                    textAlign: 'center'
                  }}
                />
            ))}
          </div>
        </div>
      </div>

      {/* Vector List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '16px', margin: 0, color: '#4488ff' }}>Basis Vectors (A)</h3>
          <button 
            onClick={handleAddVector}
            style={{ background: '#4488ff', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Col
          </button>
        </div>
        
        <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '15px', 
            overflowX: 'auto', 
            paddingBottom: '10px',
            alignItems: 'flex-start'
        }}>
          {vectors.map((v, index) => (
            <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                background: '#333', 
                padding: '8px', 
                borderRadius: '6px',
                minWidth: '70px'
            }}>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>v{index+1}</div>
              
              <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '2px',
                  borderLeft: '2px solid #666',
                  borderRight: '2px solid #666',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  marginBottom: '8px'
              }}>
                {['x', 'y', 'z'].map((axis, i) => (
                    <input
                    key={`${index}-${axis}`}
                    type="number"
                    step="0.1"
                    value={v[i]}
                    onChange={(e) => handleVectorChange(index, i as 0|1|2, e.target.value)}
                    style={{ 
                        width: '40px', 
                        background: '#444', 
                        border: '1px solid #555', 
                        color: 'white', 
                        padding: '2px', 
                        borderRadius: '2px',
                        textAlign: 'center',
                        fontSize: '13px'
                    }}
                    />
                ))}
              </div>

              <button 
                onClick={() => handleRemoveVector(index)}
                style={{ 
                    background: '#ff4444', 
                    border: 'none', 
                    color: 'white', 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '14px',
                    lineHeight: '1'
                }}
                title="Remove column"
              >
                &times;
              </button>
            </div>
          ))}
          {vectors.length === 0 && <div style={{ color: '#888', fontStyle: 'italic', padding: '10px' }}>Empty Matrix</div>}
        </div>
      </div>
      
      <div style={{ marginTop: '30px', fontSize: '12px', color: '#888' }}>
        <p>Instructions:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Blue/Orange lines are basis vectors.</li>
          <li>Red arrow is the target vector.</li>
          <li>The transparent shape represents the Span.</li>
          <li>Drag to rotate, Scroll to zoom.</li>
        </ul>
      </div>
    </div>
  );
}
