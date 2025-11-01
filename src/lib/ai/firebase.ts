import {
	getGenerativeModel,
	type GenerativeModel,
	type ModelParams,
	type SchemaRequest,
	SchemaType
} from 'firebase/ai';
import {
	BaseAIClient,
	type Product,
	type ProductAssessment,
	type ProductComparison,
	type ProductCombination
} from './base';
import { imageFileToBase64 } from '$lib/image';
import type { UserProfile } from '$lib/types/profile';
import { getAIInstance } from '$lib/firebase';

const DEFAULT_MODEL = 'gemini-flash-latest';

function buildSystemInstruction(userProfile?: UserProfile | null): string {
	let instruction = 'Provide a detailed assessment of the skincare product.';

	if (userProfile) {
		instruction += `\n\nConsider the following user profile when making your assessment:
- Skin Type: ${userProfile.skinType}
- Sensitive Skin: ${userProfile.isSensitive ? 'Yes' : 'No'}
- Age Range: ${userProfile.ageRange}
- Skin Concerns: ${userProfile.skinConcerns.join(', ')}`;

		if (userProfile.sunExposure) {
			instruction += `\n- Sun Exposure: ${userProfile.sunExposure}`;
		}

		instruction +=
			'\n\nTailor your assessment to address their specific skin type, concerns, and sensitivity. Highlight ingredients that are particularly beneficial or potentially problematic for their profile.';
	}

	return instruction;
}

const ASSESS_PRODUCT_INFO_SCHEMA: SchemaRequest = {
	type: SchemaType.OBJECT,
	properties: {
		pros: {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.STRING
			}
		},
		cons: {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.STRING
			}
		},
		score: {
			type: SchemaType.NUMBER,
			description: 'A score from 0 to 10 evaluating the product overall.'
		}
	}
};

const EXTRACT_PRODUCT_INFO_SCHEMA: SchemaRequest = {
	type: SchemaType.OBJECT,
	properties: {
		name: {
			type: SchemaType.STRING
		},
		description: {
			type: SchemaType.STRING
		},
		ingredients: {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.STRING
			}
		}
	}
};

const COMPARE_PRODUCTS_SCHEMA: SchemaRequest = {
	type: SchemaType.OBJECT,
	properties: {
		areSimilar: {
			type: SchemaType.BOOLEAN,
			description:
				'Whether the products are similar enough to compare (e.g., both moisturizers, both cleansers)'
		},
		reason: {
			type: SchemaType.STRING,
			description: 'Explanation of similarity or why they cannot be compared'
		},
		productAnalyses: {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					name: {
						type: SchemaType.STRING,
						description: 'Product name'
					},
					strengths: {
						type: SchemaType.ARRAY,
						items: { type: SchemaType.STRING }
					},
					weaknesses: {
						type: SchemaType.ARRAY,
						items: { type: SchemaType.STRING }
					},
					score: {
						type: SchemaType.NUMBER
					}
				}
			}
		},
		recommendation: {
			type: SchemaType.STRING,
			description: 'Which product(s) are recommended and why'
		}
	}
};

const ASSESS_COMBINATION_SCHEMA: SchemaRequest = {
	type: SchemaType.OBJECT,
	properties: {
		isCompatible: {
			type: SchemaType.BOOLEAN,
			description: 'Whether the products can be used together safely'
		},
		compatibilityScore: {
			type: SchemaType.NUMBER,
			description: 'A score from 0 to 10 evaluating how well the products work together'
		},
		synergies: {
			type: SchemaType.ARRAY,
			items: { type: SchemaType.STRING },
			description: 'Ways the products complement each other'
		},
		conflicts: {
			type: SchemaType.ARRAY,
			items: { type: SchemaType.STRING },
			description: 'Potential issues or conflicts when using together'
		},
		recommendations: {
			type: SchemaType.ARRAY,
			items: { type: SchemaType.STRING },
			description: 'Recommendations for using the products together'
		}
	}
};

export class FirebaseAIClient extends BaseAIClient {
	private getModel(systemInstruction?: string, responseSchema?: SchemaRequest): GenerativeModel {
		const ai = getAIInstance();
		const config: ModelParams = {
			model: DEFAULT_MODEL
		};

		if (systemInstruction) {
			config.systemInstruction = systemInstruction;
		}

		if (responseSchema) {
			config.generationConfig = {
				responseMimeType: 'application/json',
				responseSchema,
				temperature: 0.3
			};
		} else {
			config.generationConfig = {
				responseMimeType: 'application/json'
			};
		}

		return getGenerativeModel(ai, config);
	}

	async assessProduct(
		product: Product,
		userProfile?: UserProfile | null
	): Promise<ProductAssessment> {
		const model = this.getModel(buildSystemInstruction(userProfile), ASSESS_PRODUCT_INFO_SCHEMA);

		const result = await model.generateContent(JSON.stringify(product));
		const response = result.response;
		const text = response.text();

		return JSON.parse(text) as ProductAssessment;
	}

	async assessProductFromImages(
		images: File[],
		userProfile?: UserProfile | null
	): Promise<ProductAssessment> {
		const model = this.getModel(buildSystemInstruction(userProfile), ASSESS_PRODUCT_INFO_SCHEMA);

		const imageParts = await Promise.all(
			images.map(async (image) => ({
				inlineData: {
					mimeType: image.type || 'image/jpeg',
					data: await imageFileToBase64(image)
				}
			}))
		);

		const result = await model.generateContent(imageParts);
		const response = result.response;
		const text = response.text();

		return JSON.parse(text) as ProductAssessment;
	}

	async extractProductInfo(images: File[]): Promise<Product> {
		const model = this.getModel(
			'Extract the following fields about the skincare product.',
			EXTRACT_PRODUCT_INFO_SCHEMA
		);

		const imageParts = await Promise.all(
			images.map(async (image) => ({
				inlineData: {
					mimeType: image.type || 'image/jpeg',
					data: await imageFileToBase64(image)
				}
			}))
		);

		const result = await model.generateContent(imageParts);
		const response = result.response;
		const text = response.text();

		return JSON.parse(text) as Product;
	}

	async compareProducts(
		products: Product[],
		userProfile?: UserProfile | null
	): Promise<ProductComparison> {
		let systemInstruction = `Compare these ${products.length} skincare products. First determine if they are similar enough to compare (e.g., all are moisturizers, all are cleansers, etc.). 
If they are not similar (e.g., comparing a lotion to a scrub), set areSimilar to false and explain why they cannot be compared.
If they are similar, provide a detailed comparison including strengths, weaknesses, scores for each product, and a recommendation.`;

		if (userProfile) {
			systemInstruction += `\n\nConsider the following user profile when making your comparison:
- Skin Type: ${userProfile.skinType}
- Sensitive Skin: ${userProfile.isSensitive ? 'Yes' : 'No'}
- Age Range: ${userProfile.ageRange}
- Skin Concerns: ${userProfile.skinConcerns.join(', ')}`;

			if (userProfile.sunExposure) {
				systemInstruction += `\n- Sun Exposure: ${userProfile.sunExposure}`;
			}
		}

		const model = this.getModel(systemInstruction, COMPARE_PRODUCTS_SCHEMA);

		const result = await model.generateContent(JSON.stringify({ products }));
		const response = result.response;
		const text = response.text();

		return JSON.parse(text) as ProductComparison;
	}

	async assessProductCombination(
		products: Product[],
		userProfile?: UserProfile | null
	): Promise<ProductCombination> {
		let systemInstruction = `Assess the compatibility and synergy of using these skincare products together in a routine. 
Identify any beneficial combinations or potential conflicts (e.g., ingredients that should not be used together). 
Provide specific recommendations for how to use them together safely and effectively.`;

		if (userProfile) {
			systemInstruction += `\n\nConsider the following user profile:
- Skin Type: ${userProfile.skinType}
- Sensitive Skin: ${userProfile.isSensitive ? 'Yes' : 'No'}
- Age Range: ${userProfile.ageRange}
- Skin Concerns: ${userProfile.skinConcerns.join(', ')}`;

			if (userProfile.sunExposure) {
				systemInstruction += `\n- Sun Exposure: ${userProfile.sunExposure}`;
			}
		}

		const model = this.getModel(systemInstruction, ASSESS_COMBINATION_SCHEMA);

		const result = await model.generateContent(JSON.stringify({ products }));
		const response = result.response;
		const text = response.text();

		return JSON.parse(text) as ProductCombination;
	}
}
