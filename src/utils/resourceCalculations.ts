import { ResourceRole, ResourceActivity, ResourceComplexity, DependencyLevel } from '../types';

// Matrix: Role x Activity -> Base MD
export const BASE_MD_MATRIX: Record<ResourceRole, Record<ResourceActivity, number>> = {
    Analyst: {
        design: 5,
        development: 0, // Not applicable
        testing: 2,
        deployment: 1,
        support: 2,
    },
    Backend: {
        design: 3,
        development: 10,
        testing: 4,
        deployment: 3,
        support: 5,
    },
    QA: {
        design: 2,
        development: 0,
        testing: 4,
        deployment: 1,
        support: 1,
    },
    DevOps: {
        design: 3,
        development: 2, // Infrastructure as code
        testing: 2,
        deployment: 5,
        support: 5,
    },
};

export const COMPLEXITY_FACTORS: Record<ResourceComplexity, number> = {
    Low: 0.8,
    Medium: 1.0,
    High: 1.3,
    'Very High': 1.6,
};

export const DEPENDENCY_FACTORS: Record<DependencyLevel, number> = {
    1: 1.0,
    2: 1.1,
    3: 1.2,
    4: 1.4,
    5: 1.6,
};

export function getBaseMD(role: ResourceRole, activity: ResourceActivity): number {
    return BASE_MD_MATRIX[role]?.[activity] || 0;
}

export function calculateITMD(
    role: ResourceRole,
    activity: ResourceActivity,
    complexity: ResourceComplexity,
    dependencyLevel: DependencyLevel
): { baseMD: number; itmd: number } {
    const baseMD = getBaseMD(role, activity);
    const complexityFactor = COMPLEXITY_FACTORS[complexity];
    const dependencyFactor = DEPENDENCY_FACTORS[dependencyLevel];

    const itmd = baseMD * complexityFactor * dependencyFactor;
    return { baseMD, itmd: parseFloat(itmd.toFixed(2)) }; // rounding to 2 decimal places
}
