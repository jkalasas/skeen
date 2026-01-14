import type { ProductAssessment, ProductComparison, ProductCombination } from '$lib/ai/base';

export const testAssessment: ProductAssessment = {
	pros: [
		'Contains hyaluronic acid for deep hydration',
		'Non-comedogenic formula',
		'Suitable for sensitive skin'
	],
	cons: ['May feel heavy in humid weather', 'Contains fragrance'],
	score: 7.5
};

export const testAssessmentHigh: ProductAssessment = {
	pros: [
		'Dermatologist recommended',
		'Fragrance-free',
		'Contains beneficial ceramides',
		'Excellent for barrier repair'
	],
	cons: ['Premium price point'],
	score: 9.2
};

export const testAssessmentLow: ProductAssessment = {
	pros: ['Affordable'],
	cons: [
		'Contains potentially irritating ingredients',
		'High alcohol content',
		'May cause dryness',
		'Not suitable for sensitive skin'
	],
	score: 3.5
};

export const testComparison: ProductComparison = {
	areSimilar: true,
	reason: 'Both products are daily moisturizers targeting dry skin',
	productAnalyses: [
		{
			name: 'CeraVe Moisturizing Cream',
			strengths: ['Contains ceramides', 'Fragrance-free'],
			weaknesses: ['Thick texture'],
			score: 8.5
		},
		{
			name: 'Neutrogena Hydro Boost',
			strengths: ['Lightweight', 'Fast absorbing'],
			weaknesses: ['Contains fragrance'],
			score: 7.8
		}
	],
	recommendation: 'CeraVe is better for very dry skin, while Neutrogena suits oily skin better'
};

export const testComparisonNotSimilar: ProductComparison = {
	areSimilar: false,
	reason: 'Cannot compare a cleanser with a sunscreen as they serve different purposes'
};

export const testCombination: ProductCombination = {
	isCompatible: true,
	compatibilityScore: 8.5,
	synergies: [
		'Niacinamide and hyaluronic acid work well together',
		'Both products support skin barrier function'
	],
	conflicts: [],
	recommendations: [
		'Apply the lighter serum first',
		'Wait 1-2 minutes between applications',
		'Can be used both morning and evening'
	]
};

export const testCombinationIncompatible: ProductCombination = {
	isCompatible: false,
	compatibilityScore: 2.5,
	synergies: [],
	conflicts: [
		'Retinol and AHA should not be used together',
		'May cause excessive irritation and sensitivity'
	],
	recommendations: ['Use on alternate nights', 'Never layer these products directly']
};
