import { vi } from 'vitest';
import type {
	BaseAIClient,
	Product,
	ProductAssessment,
	ProductComparison,
	ProductCombination
} from '$lib/ai/base';

export const mockAssessment: ProductAssessment = {
	pros: ['Contains hyaluronic acid', 'Suitable for dry skin', 'Non-comedogenic'],
	cons: ['May cause irritation for sensitive skin', 'Contains fragrance'],
	score: 7.5
};

export const mockComparison: ProductComparison = {
	areSimilar: true,
	reason: 'Both are moisturizers with similar active ingredients',
	productAnalyses: [
		{
			name: 'Product A',
			strengths: ['Hydrating', 'Affordable'],
			weaknesses: ['Contains fragrance'],
			score: 7.5
		},
		{
			name: 'Product B',
			strengths: ['Fragrance-free', 'Dermatologist tested'],
			weaknesses: ['More expensive'],
			score: 8.0
		}
	],
	recommendation: 'Product B is recommended for sensitive skin'
};

export const mockCombination: ProductCombination = {
	isCompatible: true,
	compatibilityScore: 8.5,
	synergies: ['Ingredients complement each other well', 'Good for layering'],
	conflicts: [],
	recommendations: ['Apply lighter product first', 'Use in AM/PM routine']
};

export const mockExtractedProduct: Product = {
	name: 'CeraVe Moisturizing Cream',
	description: 'Daily moisturizing cream for dry to very dry skin',
	ingredients: ['Hyaluronic Acid', 'Ceramides', 'Niacinamide', 'Glycerin']
};

export class MockAIClient implements BaseAIClient {
	assessProduct = vi.fn().mockResolvedValue(mockAssessment);
	assessProductFromImages = vi.fn().mockResolvedValue(mockAssessment);
	extractProductInfo = vi.fn().mockResolvedValue(mockExtractedProduct);
	compareProducts = vi.fn().mockResolvedValue(mockComparison);
	assessProductCombination = vi.fn().mockResolvedValue(mockCombination);
}

export function createMockAIClient(): MockAIClient {
	return new MockAIClient();
}

export function resetAIClientMocks(client: MockAIClient) {
	client.assessProduct.mockClear();
	client.assessProductFromImages.mockClear();
	client.extractProductInfo.mockClear();
	client.compareProducts.mockClear();
	client.assessProductCombination.mockClear();
}
