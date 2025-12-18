export type Vector3 = [number, number, number];

/**
 * Calculates the rank of a matrix formed by the given vectors (treated as rows or columns).
 * Uses Gaussian elimination with partial pivoting.
 */
export function calculateRank(vectors: Vector3[]): number {
    if (vectors.length === 0) return 0;
    
    // Deep copy to avoid modifying input
    const mat = vectors.map(v => [...v]); 
    const rows = mat.length;
    const cols = 3;
    let rank = 0;
    let pivotRow = 0;

    for (let col = 0; col < cols && pivotRow < rows; col++) {
        // Find pivot
        let maxRow = pivotRow;
        let maxVal = Math.abs(mat[maxRow][col]);

        for (let i = pivotRow + 1; i < rows; i++) {
            if (Math.abs(mat[i][col]) > maxVal) {
                maxVal = Math.abs(mat[i][col]);
                maxRow = i;
            }
        }

        // If maxVal is effectively 0, this column contributes no rank
        if (maxVal < 1e-9) continue;

        // Swap rows
        [mat[pivotRow], mat[maxRow]] = [mat[maxRow], mat[pivotRow]];

        // Eliminate
        for (let i = pivotRow + 1; i < rows; i++) {
            const factor = mat[i][col] / mat[pivotRow][col];
            for (let j = col; j < cols; j++) {
                mat[i][j] -= factor * mat[pivotRow][j];
            }
        }
        
        pivotRow++;
        rank++;
    }
    return rank;
}

export function isLinearlyIndependent(vectors: Vector3[]): boolean {
    if (vectors.length === 0) return true;
    if (vectors.length > 3) return false; // More than 3 vectors in R3 must be dependent
    return calculateRank(vectors) === vectors.length;
}

export function isInSpan(basisVectors: Vector3[], targetVector: Vector3): boolean {
    if (basisVectors.length === 0) {
        // Span of empty set is origin {0,0,0}
        return targetVector.every(val => Math.abs(val) < 1e-9);
    }
    const rankA = calculateRank(basisVectors);
    const rankAugmented = calculateRank([...basisVectors, targetVector]);
    return rankA === rankAugmented;
}

/**
 * Analyzes the vectors to find linear dependencies.
 * Returns a list of strings describing the dependencies (e.g. "v3 = 2*v1 + 1*v2").
 */
export function getDependencyRelations(vectors: Vector3[]): string[] {
    try {
        const relations: string[] = [];
        const independentVectors: { vec: Vector3, index: number }[] = [];

        for (let i = 0; i < vectors.length; i++) {
            const currentVec = vectors[i];
            
            // Check if currentVec is approx zero
            const norm = Math.sqrt(currentVec[0]**2 + currentVec[1]**2 + currentVec[2]**2);
            if (norm < 1e-6) {
                relations.push(`v${i+1} is Zero Vector`);
                continue;
            }

            if (independentVectors.length === 0) {
                independentVectors.push({ vec: currentVec, index: i });
                continue;
            }

            const rankWithout = calculateRank(independentVectors.map(v => v.vec));
            const rankWith = calculateRank([...independentVectors.map(v => v.vec), currentVec]);

            if (rankWith === rankWithout) {
                // Dependent! Try to find coefficients.
                try {
                    const coeffs = solveSystem(independentVectors.map(v => v.vec), currentVec);
                    
                    if (coeffs) {
                        const parts = coeffs.map((c, idx) => {
                            if (Math.abs(c) < 1e-4) return null;
                            const val = Math.abs(c - 1) < 1e-4 ? "" : Math.abs(c + 1) < 1e-4 ? "-" : parseFloat(c.toFixed(2)) + "*";
                            return `${val}v${independentVectors[idx].index + 1}`;
                        }).filter(p => p !== null);
                        
                        relations.push(`v${i+1} = ${parts.join(' + ') || '0'}`);
                    } else {
                        relations.push(`v${i+1} is dependent (complex)`);
                    }
                } catch {
                    relations.push(`v${i+1} is dependent`);
                }
            } else {
                independentVectors.push({ vec: currentVec, index: i });
            }
        }
        return relations;
    } catch (err) {
        console.error("Dependency calculation error:", err);
        return ["Error calculating dependencies"];
    }
}

export function getBasis(vectors: Vector3[]): Vector3[] {
    const basis: Vector3[] = [];
    for (const v of vectors) {
        // If adding v keeps the set independent, add it.
        // Or simply: check if v is in the span of current basis.
        // But calculateRank is easier: rank(basis + v) > rank(basis)
        
        // Optimization: if v is zero, skip
        const norm = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
        if (norm < 1e-6) continue;

        const currentRank = calculateRank(basis);
        const newRank = calculateRank([...basis, v]);
        if (newRank > currentRank) {
            basis.push(v);
        }
        if (basis.length === 3) break; // Max rank in R3
    }
    return basis;
}

// Solves A * x = b for x, where A's columns are 'basis'
// Assumes solution exists.
export function solveSystem(basis: Vector3[], target: Vector3): number[] | null {
    // Create augmented matrix [Columns | target]
    // But our rank function expects ROWS. 
    // Let's work with rows: 
    // We want x_1 * c_1 + ... + x_k * c_k = t
    // This is a system of 3 linear equations with k unknowns.
    // Eq1: x_1*c_1[0] + ... = t[0]
    
    const numVars = basis.length;
    const numEqs = 3;
    
    // Augmented matrix: numEqs rows, numVars + 1 columns
    const mat: number[][] = [];
    for(let r=0; r<numEqs; r++) {
        const row: number[] = [];
        for(let c=0; c<numVars; c++) {
            row.push(basis[c][r]);
        }
        row.push(target[r]);
        mat.push(row);
    }

    // Gaussian elimination to RREF
    let pivotRow = 0;
    const colCount = numVars; // processing columns 0 to numVars-1

    for (let col = 0; col < colCount && pivotRow < numEqs; col++) {
        // Pivot selection
        let maxRow = pivotRow;
        let maxVal = Math.abs(mat[maxRow][col]);
        for(let i=pivotRow+1; i<numEqs; i++) {
            if (Math.abs(mat[i][col]) > maxVal) {
                maxVal = Math.abs(mat[i][col]);
                maxRow = i;
            }
        }
        
        if (maxVal < 1e-9) continue;
        
        // Swap
        [mat[pivotRow], mat[maxRow]] = [mat[maxRow], mat[pivotRow]];
        
        // Normalize pivot row
        const pivotVal = mat[pivotRow][col];
        for(let j=col; j<=colCount; j++) {
            mat[pivotRow][j] /= pivotVal;
        }
        
        // Eliminate other rows
        for(let i=0; i<numEqs; i++) {
            if (i !== pivotRow) {
                const factor = mat[i][col];
                for(let j=col; j<=colCount; j++) {
                    mat[i][j] -= factor * mat[pivotRow][j];
                }
            }
        }
        pivotRow++;
    }

    // Extract solution
    // Since we processed columns in order, and we assume independent basis,
    // The first k columns should form an identity submatrix (with potentially zero rows at bottom).
    // The variables x_0 ... x_{k-1} correspond to cols 0 ... k-1.
    
    const solution = new Array(numVars).fill(0);
    // For each variable column, find the pivot 1
    for(let c=0; c<numVars; c++) {
        // Find row with 1 in this column
        let foundRow = -1;
        for(let r=0; r<numEqs; r++) {
            if (Math.abs(mat[r][c] - 1) < 1e-4) {
                // Check if it's a pivot (only non-zero entry in this row to the left?)
                // Since we did full elimination (RREF), yes.
                foundRow = r;
                break;
            }
        }
        
        if (foundRow !== -1) {
            solution[c] = mat[foundRow][numVars]; // The last column
        }
    }
    
    return solution;
}

/**
 * Performs Gram-Schmidt orthogonalization on the given vectors.
 * Returns the orthogonal basis vectors.
 */
export function gramSchmidt(vectors: Vector3[]): Vector3[] {
    const orthogonalBasis: Vector3[] = [];

    for (const v of vectors) {
        const u = [...v] as Vector3; // Start with the original vector

        // Subtract projections onto existing orthogonal basis vectors
        for (const basisVec of orthogonalBasis) {
             // Calculate projection of v onto basisVec
             // proj_b(v) = (v . b) / (b . b) * b
             const dotProduct = u[0]*basisVec[0] + u[1]*basisVec[1] + u[2]*basisVec[2];
             const basisNormSq = basisVec[0]**2 + basisVec[1]**2 + basisVec[2]**2;
             
             if (basisNormSq > 1e-9) {
                 const scalar = dotProduct / basisNormSq;
                 u[0] -= scalar * basisVec[0];
                 u[1] -= scalar * basisVec[1];
                 u[2] -= scalar * basisVec[2];
             }
        }
        
        // If u is not the zero vector (meaning v was linearly independent), add it
        const norm = Math.sqrt(u[0]**2 + u[1]**2 + u[2]**2);
        if (norm > 1e-6) {
            orthogonalBasis.push(u);
        } else {
             // If it depends on previous vectors, it becomes 0.
             // We generally only keep non-zero vectors for a basis.
             // But to keep correspondence with input if possible, we could keep 0?
             // Usually Gram-Schmidt returns a basis for the Span, so we skip 0s.
        }
    }
    
    return orthogonalBasis;
}

export function getProjection(basisVectors: Vector3[], targetVector: Vector3): Vector3 | null {
    const rank = calculateRank(basisVectors);
    
    if (rank === 0) return [0, 0, 0];

    // Case Rank 1: Line
    if (rank === 1) {
        const firstNonZero = basisVectors.find(v => Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2) > 1e-5);
        if (!firstNonZero) return null;
        
        // dot product manually
        const u = [...firstNonZero];
        const len = Math.sqrt(u[0]**2 + u[1]**2 + u[2]**2);
        u[0] /= len; u[1] /= len; u[2] /= len;
        
        const dot = targetVector[0]*u[0] + targetVector[1]*u[1] + targetVector[2]*u[2];
        return [u[0]*dot, u[1]*dot, u[2]*dot];
    }

    // Case Rank 2: Plane
    if (rank === 2) {
        // Find two independent vectors
        const basis = getBasis(basisVectors);
        if (basis.length < 2) return null;

        const v1 = basis[0];
        const v2 = basis[1];
        
        // Cross product v1 x v2
        const nx = v1[1]*v2[2] - v1[2]*v2[1];
        const ny = v1[2]*v2[0] - v1[0]*v2[2];
        const nz = v1[0]*v2[1] - v1[1]*v2[0];
        
        const nLen = Math.sqrt(nx**2 + ny**2 + nz**2);
        const norm = [nx/nLen, ny/nLen, nz/nLen];
        
        // Project target onto normal
        const dist = targetVector[0]*norm[0] + targetVector[1]*norm[1] + targetVector[2]*norm[2];
        const perp = [norm[0]*dist, norm[1]*dist, norm[2]*dist];
        
        return [
            targetVector[0] - perp[0],
            targetVector[1] - perp[1],
            targetVector[2] - perp[2]
        ];
    }
    
    // Rank 3: Space (Identity)
    if (rank === 3) {
        return [...targetVector];
    }

    return null;
}

export function getCoordinates(basisVectors: Vector3[], targetVector: Vector3): { coordinates: number[], basisUsed: Vector3[] } | null {
    const basis = getBasis(basisVectors);
    if (basis.length === 0) return null;

    // 1. Get projection of target onto basis span
    const projection = getProjection(basis, targetVector);
    if (!projection) return null;

    // 2. Solve basis * x = projection
    const solution = solveSystem(basis, projection);
    
    if (solution) {
        return { coordinates: solution, basisUsed: basis };
    }
    return null;
}