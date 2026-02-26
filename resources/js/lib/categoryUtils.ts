import type { Category } from '@/types';

export interface FlatCategory extends Category {
    depth: number;
}

/**
 * Flatten categories with depth info for select dropdowns.
 * Top-level = depth 0, subcategories = depth 1.
 */
export function flattenCategories(categories: Category[]): FlatCategory[] {
    const result: FlatCategory[] = [];
    for (const cat of categories) {
        result.push({ ...cat, depth: 0 });
        if (cat.children && cat.children.length > 0) {
            for (const child of cat.children) {
                result.push({ ...child, depth: 1 });
            }
        }
    }
    return result;
}

/**
 * Get all categories as a flat list (parents + children).
 */
export function getAllCategories(categories: Category[]): Category[] {
    const result: Category[] = [];
    for (const cat of categories) {
        result.push(cat);
        if (cat.children && cat.children.length > 0) {
            result.push(...cat.children);
        }
    }
    return result;
}
