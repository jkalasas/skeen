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
}
