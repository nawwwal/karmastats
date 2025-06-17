# KARMASTAT Backend Migration Analysis 🔧

## Executive Summary

Comprehensive analysis of the TypeScript backend library structure for KARMASTAT, focusing on maintainability, refactoring opportunities, and potential build/logic errors without rebuilding.

---

## 1. File Structure & Size Analysis

| File | Size (KB) | Lines | Status | Complexity |
|------|-----------|-------|--------|------------|
| `lib/theme.ts` | 11.0 | 356 | ✅ Well-structured | Low |
| `lib/family-study.ts` | 15.0 | 377 | ⚠️ Needs splitting | High |
| `lib/comparativeStudy.ts` | 9.4 | 281 | ⚠️ Mixed concerns | Medium |
| `lib/survivalAnalysis.ts` | 11.0 | 310 | ⚠️ Mixed concerns | Medium |
| `lib/regression.ts` | 9.0 | 262 | ⚠️ Mixed concerns | Medium |
| `lib/studyDetector.ts` | 8.5 | 181 | ✅ Good structure | Low |
| `lib/infectious.ts` | 5.0 | 150 | ✅ Excellent structure | Low |
| `lib/diagnosticTest.ts` | 6.4 | 177 | ✅ Good structure | Low |
| `lib/crossSectional.ts` | 2.7 | 85 | ✅ Excellent structure | Low |
| `lib/clinicalTrial.ts` | 6.7 | 169 | ✅ Good structure | Low |
| `lib/math/statistics.ts` | 4.4 | 137 | ✅ Good structure | Medium |
| `lib/math/matrix.ts` | 2.4 | 91 | ✅ Excellent structure | Low |
| `lib/math/sample-size/tTest.ts` | 5.9 | 165 | ✅ Good structure | Medium |
| `lib/math/sample-size/utils.ts` | 2.1 | 63 | ✅ Good structure | Low |
| `lib/math/sample-size/comparativeStudy.ts` | 2.7 | 94 | ✅ Good structure | Low |
| `lib/utils.ts` | 1.0 | 38 | ✅ Excellent structure | Low |
| `lib/pdf-utils.ts` | 0.7 | 21 | ⚠️ Incomplete | Low |

---

## 2. Maintainability Assessment

### 🟢 **Well-Maintained Files**
- **`lib/infectious.ts`** - Excellent OOP design with DiseaseModel class
- **`lib/crossSectional.ts`** - Clean, focused, single responsibility
- **`lib/utils.ts`** - Perfect utility functions
- **`lib/math/matrix.ts`** - Well-structured mathematical operations
- **`lib/math/statistics.ts`** - Good statistical function library

### 🟡 **Moderately Maintained Files**
- **`lib/studyDetector.ts`** - Good but could benefit from rule externalization
- **`lib/diagnosticTest.ts`** - Well-structured but repetitive calculations
- **`lib/clinicalTrial.ts`** - Good structure but similar calculation patterns
- **`lib/math/sample-size/tTest.ts`** - Good but could be more modular

### 🔴 **Maintenance Issues**

#### `lib/family-study.ts` (377 lines)
**Issues:**
- Massive file mixing schemas, types, data, and functions
- IFCT food database hardcoded (200+ lines of static data)
- Multiple concerns: validation, calculations, classification systems
- Hard to test individual components

#### `lib/comparativeStudy.ts` (281 lines)
**Issues:**
- Duplicate implementations (`calculateCaseControl` vs `ComparativeStudy.calculateCaseControl`)
- Mixed functional and OOP patterns
- Hardcoded z-score lookup tables
- Schema validation mixed with business logic

#### `lib/survivalAnalysis.ts` (310 lines)
**Issues:**
- Mixed class-based and functional approach
- Complex nested calculations within single methods
- Hardcoded statistical constants

#### `lib/regression.ts` (262 lines)
**Issues:**
- Four different regression types in single file
- Matrix operations dependencies scattered
- Mixed error handling patterns

---

## 3. Refactoring Recommendations

### **Priority 1: Split Large Files**

#### `lib/family-study.ts` → Multiple Files
```
lib/family-study/
├── schemas.ts           # Zod schemas only
├── types.ts             # TypeScript interfaces
├── data/
│   ├── consumption-units.ts
│   ├── ses-classifications.ts
│   └── food-database.ts
├── calculations/
│   ├── bmi.ts
│   ├── consumption-units.ts
│   ├── nutritional-adequacy.ts
│   └── ses-classification.ts
└── index.ts             # Re-exports
```

#### `lib/comparativeStudy.ts` → Focused Files
```
lib/sample-size/comparative/
├── schemas.ts           # Validation schemas
├── case-control.ts      # Case-control calculations
├── cohort.ts           # Cohort calculations
├── constants.ts        # Z-score tables
└── index.ts            # Unified interface
```

#### `lib/regression.ts` → Type-Specific Files
```
lib/regression/
├── schemas.ts          # All regression schemas
├── linear.ts           # Linear regression
├── polynomial.ts       # Polynomial regression
├── logistic.ts         # Logistic regression
├── multiple.ts         # Multiple regression
├── utils.ts           # Common utilities
└── index.ts           # Unified exports
```

### **Priority 2: Extract Common Patterns**

#### Create `lib/statistical-tables.ts`
```typescript
export const zScores = {
  alpha: { 0.01: 2.576, 0.05: 1.96, 0.10: 1.645 },
  beta: { 0.80: 0.842, 0.85: 1.036, 0.90: 1.282, 0.95: 1.645 }
};
```

#### Create `lib/sample-size/common.ts`
```typescript
export interface CommonSampleSizeParams {
  significanceLevel: number;
  statisticalPower: number;
  adjustmentRate?: number;
}

export function adjustForNonResponse(
  sampleSize: number,
  nonResponseRate: number
): number {
  return Math.ceil(sampleSize / (1 - nonResponseRate / 100));
}
```

### **Priority 3: Merge Related Small Files**

#### Consolidate Sample Size Utilities
```
lib/math/sample-size/ → lib/sample-size/
├── base.ts              # Common interfaces and utilities
├── comparative.ts       # Case-control and cohort
├── t-test.ts           # All t-test variants
├── survival.ts         # Survival analysis
├── diagnostic.ts       # Diagnostic tests
├── clinical-trials.ts  # Clinical trial calculations
└── cross-sectional.ts  # Descriptive studies
```

---

## 4. Potential Build & Logic Errors

### **Type Safety Issues**

#### Missing Input Validation
```typescript
// In regression.ts - linearRegression function
if (!xValues || !yValues || xValues.length !== yValues.length || xValues.length < 2) {
  return { error: "Input data must have at least 2 data points..." };
}
// ❌ Should use Zod validation before function call
```

#### Inconsistent Error Handling
```typescript
// Some functions return { error: string }
// Others throw exceptions
// Others return null/undefined
```

### **Mathematical Precision Issues**

#### Division by Zero Risks
```typescript
// In regression.ts line 65
const slope = ssXY / ssXX;
// ❌ No check for ssXX === 0
```

#### Matrix Singularity
```typescript
// In matrix.ts - invertMatrix function
if (Math.abs(augmented[i][i]) < 1e-12) {
  return null; // ✅ Good handling
}
```

#### Statistical Function Approximations
```typescript
// In statistics.ts - tcdf function
// Uses simplified approximation instead of proper implementation
// ⚠️ May cause precision issues for edge cases
```

### **Dependency Issues**

#### Circular Import Risk
```typescript
// Current structure is safe, but watch for:
// regression.ts → math/matrix.ts → math/statistics.ts
// No circular dependencies detected
```

#### Missing Type Exports
```typescript
// Some files export types, others don't
// Need consistent pattern for type exports
```

### **Runtime Logic Errors**

#### Array Index Assumptions
```typescript
// In statistics.ts - betacf function
for (; m <= MAXIT; m++) {
  // ❌ Infinite loop risk if convergence fails
}
```

#### Hardcoded Constants
```typescript
// In family-study.ts
const foodDatabase = {
  "Rice, raw": { energy: 345, protein: 6.8, ... }
  // ❌ Should be in separate data file
  // ❌ No validation on data integrity
};
```

#### Floating Point Comparisons
```typescript
// Multiple files use direct equality comparison
if (Math.abs(del - 1.0) < EPS) break;
// ✅ Good - uses epsilon comparison
```

---

## 5. Performance & Memory Issues

### **Large Static Data**
- `family-study.ts` contains 200+ lines of food database
- Should be lazy-loaded or in separate JSON file
- Currently loaded into memory regardless of usage

### **Inefficient Calculations**
```typescript
// In regression.ts - logistic regression
for (let iter = 0; iter < iterations; iter++) {
  // Matrix operations in tight loop
  // Could benefit from early termination optimization
}
```

### **Memory Leaks Risk**
```typescript
// Large array allocations in simulation functions
const s: number[] = [populationSize - initialCases];
// Arrays grow with simulation days - could be memory intensive
```

---

## 6. Migration Action Plan

### **Phase 1: Critical Fixes (Week 1)**
1. Fix division by zero in `regression.ts`
2. Standardize error handling patterns
3. Extract statistical constants to shared file
4. Add input validation to mathematical functions

### **Phase 2: Structure Refactoring (Week 2)**
1. Split `family-study.ts` into modular structure
2. Reorganize sample-size calculations
3. Create common statistical utilities
4. Implement consistent schemas across all modules

### **Phase 3: Optimization (Week 3)**
1. Move static data to external files
2. Implement lazy loading for large datasets
3. Optimize mathematical algorithms
4. Add comprehensive error boundaries

### **Phase 4: Testing & Documentation (Week 4)**
1. Add unit tests for all mathematical functions
2. Integration tests for complex calculations
3. Performance benchmarks
4. Complete API documentation

---

## 7. Recommended File Structure (Post-Migration)

```
lib/
├── schemas/              # All Zod validation schemas
├── types/               # TypeScript type definitions
├── data/                # Static data files (JSON)
├── statistical-tables/  # Constants and lookup tables
├── math/
│   ├── core/           # Basic mathematical operations
│   └── distributions/  # Statistical distributions
├── sample-size/        # All sample size calculations
├── regression/         # All regression types
├── disease-modeling/   # Infectious disease models
├── family-study/       # Family study components
├── utils/              # Common utilities
└── errors/             # Error handling and types
```

---

## 8. Build Safety Recommendations

### **TypeScript Strict Mode**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### **ESLint Rules**
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error"
  }
}
```

### **Runtime Validation**
- Implement Zod validation at all public API boundaries
- Add runtime checks for mathematical preconditions
- Comprehensive error handling with meaningful messages

---

**Status**: Ready for phased migration with clear priorities and risk mitigation strategies.
