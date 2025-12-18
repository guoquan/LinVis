import { calculateRank, isLinearlyIndependent, isInSpan, getDependencyRelations, gramSchmidt, type Vector3 } from '../utils/linearAlgebra';
import { useLanguage } from '../hooks/useLanguage';
import { TARGET_COLORS } from '../constants/colors';

interface SidebarProps {
  vectors: Vector3[];
  setVectors: (v: Vector3[]) => void;
  targetVectors: Vector3[];
  setTargetVectors: (v: Vector3[]) => void;
  autoRotate: boolean;
  onToggleRotate: () => void;
  showCoordinates: boolean;
  onToggleCoordinates: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onResetView: () => void;
  onClose?: () => void;
}

export function Sidebar({ 
  vectors, setVectors, targetVectors, setTargetVectors,
  autoRotate, onToggleRotate, showCoordinates, onToggleCoordinates,
  fontSize, onFontSizeChange,
  onResetView, onClose 
}: SidebarProps) {
  const { t, language, setLanguage } = useLanguage();
  const rank = calculateRank(vectors);
  const independent = isLinearlyIndependent(vectors);
  const relations = getDependencyRelations(vectors);

  // Determine span status for each target vector
  const spanStatuses = targetVectors.map(v => isInSpan(vectors, v));

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const handleVectorChange = (index: number, axis: 0 | 1 | 2, value: string) => {
    const numVal = parseFloat(value) || 0;
    const newVectors = [...vectors];
    newVectors[index] = [...newVectors[index]];
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

  const handleTargetChange = (index: number, axis: 0 | 1 | 2, value: string) => {
    const numVal = parseFloat(value) || 0;
    const newTargets = [...targetVectors];
    newTargets[index] = [...newTargets[index]];
    newTargets[index][axis] = numVal;
    setTargetVectors(newTargets);
  };

  const handleAddTarget = () => {
     setTargetVectors([...targetVectors, [1, 1, 1]]);
  };

  const handleRemoveTarget = (index: number) => {
      const newTargets = targetVectors.filter((_, i) => i !== index);
      setTargetVectors(newTargets);
  };

  const renderVectorInput = (
      vec: Vector3, 
      index: number, 
      onChange: (idx: number, axis: 0|1|2, val: string) => void,
      onRemove: (idx: number) => void,
      color?: string,
      label?: string
  ) => (
    <div key={index} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: '#333', 
        padding: '8px', 
        borderRadius: '6px',
        minWidth: '70px',
        borderTop: color ? `3px solid ${color}` : 'none'
    }}>
      <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>
          {label || `v${index+1}`}
      </div>
      
      <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2px',
          // Brackets style using borders
          borderLeft: '2px solid #666',
          borderRight: '2px solid #666',
          borderRadius: '8px',
          padding: '2px 6px',
          marginBottom: '8px'
      }}>
        {['x', 'y', 'z'].map((axis, i) => (
            <input
            key={`${index}-${axis}`}
            type="number"
            step="0.1"
            value={vec[i]}
            onChange={(e) => onChange(index, i as 0|1|2, e.target.value)}
            style={{ 
                width: '40px', 
                background: '#444', 
                border: 'none', 
                borderBottom: '1px solid #555', 
                color: 'white', 
                padding: '2px', 
                textAlign: 'center',
                fontSize: '13px'
            }}
            />
        ))}
      </div>

      <button 
        onClick={() => onRemove(index)}
        style={{ 
            background: '#ff4444', border: 'none', color: 'white', 
            width: '20px', height: '20px', borderRadius: '50%', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontSize: '14px', lineHeight: '1'
        }}
        title="Remove"
      >
        &times;
      </button>
    </div>
  );

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
            top: '15px', right: '15px', background: 'transparent', border: 'none',
            color: '#aaa', fontSize: '24px', cursor: 'pointer', padding: '5px', lineHeight: 0.8
          }}
          title="Close Sidebar"
        >
          &times;
        </button>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingRight: onClose ? '30px' : '0' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>{t('controls')}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={toggleLanguage}
                style={{ 
                    background: 'transparent', color: '#bbb', border: '1px solid #555', 
                    padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' 
                }}
            >
                {language === 'en' ? '中文' : 'EN'}
            </button>
            <button 
                onClick={onResetView}
                style={{ 
                    background: '#555', color: 'white', border: 'none', 
                    padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' 
                }}
            >
                {t('resetView')}
            </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}>
            <input type="checkbox" checked={autoRotate} onChange={onToggleRotate} style={{ marginRight: '8px' }} />
            {t('autoRotate')}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
            <input type="checkbox" checked={showCoordinates} onChange={onToggleCoordinates} style={{ marginRight: '8px' }} />
            {t('showCoordinates')}
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          {t('fontSize')}: {fontSize.toFixed(1)}
        </label>
        <input 
          type="range"
          min="0.2"
          max="3.0"
          step="0.1"
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Analysis Results */}
      <div style={{ background: '#333', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, fontSize: '16px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>{t('analysis')}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>{t('rank')}:</span>
          <strong>{rank}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>{t('linearIndep')}:</span>
          <strong style={{ color: independent ? '#4f4' : '#f44' }}>{independent ? t('yes') : t('no')}</strong>
        </div>
        
        {!independent && relations.length > 0 && (
          <div style={{ marginTop: '10px', padding: '8px', background: '#443322', borderRadius: '4px', borderLeft: '3px solid #f80' }}>
            <div style={{ fontSize: '12px', color: '#fb0', marginBottom: '4px' }}>{t('dependenciesFound')}:</div>
            {relations.map((rel, i) => (
              <div key={i} style={{ fontSize: '13px', fontFamily: 'monospace' }}>{rel}</div>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid #555', marginTop: '10px', paddingTop: '5px' }}>
            <div style={{ marginBottom: '5px' }}>{t('targetInSpan')}:</div>
            {targetVectors.map((_, i) => {
                const inS = spanStatuses[i];
                const color = TARGET_COLORS[i % TARGET_COLORS.length];
                return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '2px' }}>
                        <span style={{ color: color }}>b{i+1}:</span>
                        <strong style={{ color: inS ? '#4f4' : '#f44' }}>{inS ? t('yes') : t('no')}</strong>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Basis Vectors */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '16px', margin: 0, color: '#4488ff' }}>{t('basisVectors')}</h3>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
                onClick={() => {
                    const orthogonal = gramSchmidt(vectors);
                    // Add orthogonal vectors to target vectors to visualize them
                    setTargetVectors([...targetVectors, ...orthogonal]);
                }}
                style={{ background: '#22cc88', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                title={t('gramSchmidt')}
            >
                {t('orthogonalize')}
            </button>
            <button 
                onClick={handleAddVector}
                style={{ background: '#4488ff', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
                {t('addCol')}
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', overflowX: 'auto', paddingBottom: '10px', alignItems: 'flex-start' }}>
          {vectors.map((v, index) => renderVectorInput(v, index, handleVectorChange, handleRemoveVector))}
          {vectors.length === 0 && <div style={{ color: '#888', padding: '10px' }}>{t('emptyMatrix')}</div>}
        </div>
      </div>

      {/* Target Vectors */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '16px', margin: 0, color: '#FF4500' }}>{t('targetVectors')}</h3>
          <button 
            onClick={handleAddTarget}
            style={{ background: '#FF4500', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
          >
            {t('addTarget')}
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', overflowX: 'auto', paddingBottom: '10px', alignItems: 'flex-start' }}>
          {targetVectors.map((v, index) => renderVectorInput(
              v, 
              index, 
              handleTargetChange, 
              handleRemoveTarget, 
              TARGET_COLORS[index % TARGET_COLORS.length],
              `b${index+1}`
          ))}
          {targetVectors.length === 0 && <div style={{ color: '#888', padding: '10px' }}>No Targets</div>}
        </div>
      </div>
      
      <div style={{ marginTop: '30px', fontSize: '12px', color: '#888' }}>
        <p>{t('instructions')}</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>{t('instruction1')}</li>
          <li>{t('instruction2')}</li>
          <li>{t('instruction3')}</li>
          <li>{t('instruction4')}</li>
        </ul>
      </div>
    </div>
  );
}
