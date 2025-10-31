import type { UserProfile } from '$lib/types/profile';

export interface Product {
	name: string;
	description?: string | null;
	ingredients?: string[] | null;
}

export interface ProductAssessment {
	pros: string[];
	cons: string[];
	score: number;
}

export interface ProductComparison {
	areSimilar: boolean;
	reason?: string;
	productAnalyses?: {
		name: string;
		strengths: string[];
		weaknesses: string[];
		score: number;
	}[];
	recommendation?: string;
}

export interface ProductCombination {
	isCompatible: boolean;
	compatibilityScore: number;
	synergies: string[];
	conflicts: string[];
	recommendations: string[];
}

export abstract class BaseAIClient {
	abstract assessProduct(
		product: Product,
		userProfile?: UserProfile | null
	): Promise<ProductAssessment>;
	abstract assessProductFromImages(
		images: File[],
		userProfile?: UserProfile | null
	): Promise<ProductAssessment>;
	abstract extractProductInfo(images: File[]): Promise<Product>;
	abstract compareProducts(
		products: Product[],
		userProfile?: UserProfile | null
	): Promise<ProductComparison>;
	abstract assessProductCombination(
		products: Product[],
		userProfile?: UserProfile | null
	): Promise<ProductCombination>;
}
