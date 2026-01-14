import type { Product } from '$lib/ai/base';
import type { StoredProduct } from '$lib/db/products';

export const testProduct: Product = {
	name: 'CeraVe Moisturizing Cream',
	description: 'Daily moisturizing cream for dry skin',
	ingredients: ['Hyaluronic Acid', 'Ceramides', 'Niacinamide']
};

export const testStoredProduct: StoredProduct = {
	...testProduct,
	id: 1,
	timestamp: Date.now(),
	lastUsed: Date.now()
};

export const testProducts: Product[] = [
	testProduct,
	{
		name: 'Neutrogena Sunscreen SPF 50',
		description: 'Broad spectrum sunscreen',
		ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Vitamin E']
	},
	{
		name: 'The Ordinary Niacinamide 10%',
		description: 'Serum for blemishes and congestion',
		ingredients: ['Niacinamide', 'Zinc PCA', 'Glycerin']
	}
];

export const testProductMinimal: Product = {
	name: 'Simple Product'
};

export const testProductWithEmptyIngredients: Product = {
	name: 'Product Without Ingredients',
	description: 'A product with empty ingredients list',
	ingredients: []
};

export function createTestStoredProduct(overrides: Partial<StoredProduct> = {}): StoredProduct {
	return {
		...testStoredProduct,
		id: Math.floor(Math.random() * 1000),
		timestamp: Date.now(),
		...overrides
	};
}
