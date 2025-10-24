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
	abstract assessProduct(product: Product): Promise<ProductAssessment>;
	abstract assessProductFromImages(images: File[]): Promise<ProductAssessment>;
	abstract extractProductInfo(images: File[]): Promise<Product>;
}
