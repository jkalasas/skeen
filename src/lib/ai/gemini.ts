import { GoogleGenAI, Type, type Content, type GenerateContentConfig } from '@google/genai';

import {
	BaseAIClient,
	type Product,
	type ProductAssessment,
	type ProductComparison,
	type ProductCombination
} from './base';
import { imageFileToBase64 } from '$lib/image';
import type { UserProfile } from '$lib/types/profile';

const BASE_CONFIG: GenerateContentConfig = {
	thinkingConfig: {
		thinkingBudget: 5000
	},
	responseMimeType: 'application/json'
};

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

const ASSESS_PRODUCT_INFO_SCHEMA = {
	type: Type.OBJECT,
	properties: {
		pros: {
			type: Type.ARRAY,
			items: {
				type: Type.STRING
			}
		},
		cons: {
			type: Type.ARRAY,
			items: {
				type: Type.STRING
			}
		},
		score: {
			type: Type.NUMBER,
			description: 'A score from 0 to 10 evaluating the product overall.'
		}
	}
};

const EXTRACT_PRODUCT_INFO_CONFIG: GenerateContentConfig = {
	...BASE_CONFIG,
	systemInstruction: 'Extract the following fields about the skincare product.',
	responseSchema: {
		type: Type.OBJECT,
		properties: {
			name: {
				type: Type.STRING
			},
			description: {
				type: Type.STRING
			},
			ingredients: {
				type: Type.ARRAY,
				items: {
					type: Type.STRING
				}
			}
		}
	},
	temperature: 0
};

const COMPARE_PRODUCTS_SCHEMA = {
	type: Type.OBJECT,
	properties: {
		areSimilar: {
			type: Type.BOOLEAN,
			description:
				'Whether the products are similar enough to compare (e.g., both moisturizers, both cleansers)'
		},
		reason: {
			type: Type.STRING,
			description: 'Explanation of similarity or why they cannot be compared'
		},
		productAnalyses: {
			type: Type.ARRAY,
			items: {
				type: Type.OBJECT,
				properties: {
					name: {
						type: Type.STRING,
						description: 'Product name'
					},
					strengths: {
						type: Type.ARRAY,
						items: { type: Type.STRING }
					},
					weaknesses: {
						type: Type.ARRAY,
						items: { type: Type.STRING }
					},
					score: {
						type: Type.NUMBER
					}
				}
			}
		},
		recommendation: {
			type: Type.STRING,
			description: 'Which product(s) are recommended and why'
		}
	}
};

const ASSESS_COMBINATION_SCHEMA = {
	type: Type.OBJECT,
	properties: {
		isCompatible: {
			type: Type.BOOLEAN,
			description: 'Whether the products can be used together safely'
		},
		compatibilityScore: {
			type: Type.NUMBER,
			description: 'A score from 0 to 10 evaluating how well the products work together'
		},
		synergies: {
			type: Type.ARRAY,
			items: { type: Type.STRING },
			description: 'Ways the products complement each other'
		},
		conflicts: {
			type: Type.ARRAY,
			items: { type: Type.STRING },
			description: 'Potential issues or conflicts when using together'
		},
		recommendations: {
			type: Type.ARRAY,
			items: { type: Type.STRING },
			description: 'Recommendations for using the products together'
		}
	}
};

export class GeminiAIClient extends BaseAIClient {
	private client: GoogleGenAI;

	constructor(apiKey: string) {
		super();

		this.client = new GoogleGenAI({ apiKey });
	}

	private buildContent(data: Record<string, any>): Content[] {
		return [
			{
				role: 'user',
				parts: [{ text: JSON.stringify(data) }]
			}
		];
	}

	private async buildContentFromImages(images: File[]): Promise<Content[]> {
		return [
			{
				role: 'user',
				parts: [
					...(await Promise.all(
						images.map(async (image) => ({
							inlineData: {
								mimeType: 'image/jpeg',
								data: await imageFileToBase64(image)
							}
						}))
					))
				]
			}
		];
	}

	async assessProduct(
		product: Product,
		userProfile?: UserProfile | null
	): Promise<ProductAssessment> {
		const response = await this.client.models.generateContent({
			model: 'gemini-flash-lite-latest',
			contents: this.buildContent(product),
			config: {
				...BASE_CONFIG,
				systemInstruction: buildSystemInstruction(userProfile),
				responseSchema: ASSESS_PRODUCT_INFO_SCHEMA,
				temperature: 0.3
			}
		});

		return JSON.parse(response.text as string) as ProductAssessment;
	}

	async assessProductFromImages(
		images: File[],
		userProfile?: UserProfile | null
	): Promise<ProductAssessment> {
		const response = await this.client.models.generateContent({
			model: 'gemini-flash-lite-latest',
			contents: await this.buildContentFromImages(images),
			config: {
				...BASE_CONFIG,
				systemInstruction: buildSystemInstruction(userProfile),
				responseSchema: ASSESS_PRODUCT_INFO_SCHEMA,
				temperature: 0.3
			}
		});

		return JSON.parse(response.text as string) as ProductAssessment;
	}

	async extractProductInfo(images: File[]): Promise<Product> {
		const response = await this.client.models.generateContent({
			model: 'gemini-flash-lite-latest',
			contents: await this.buildContentFromImages(images),
			config: EXTRACT_PRODUCT_INFO_CONFIG
		});

		return JSON.parse(response.text as string) as Product;
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

		const response = await this.client.models.generateContent({
			model: 'gemini-flash-lite-latest',
			contents: this.buildContent({ products }),
			config: {
				...BASE_CONFIG,
				systemInstruction,
				responseSchema: COMPARE_PRODUCTS_SCHEMA,
				temperature: 0.3
			}
		});

		return JSON.parse(response.text as string) as ProductComparison;
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

		const response = await this.client.models.generateContent({
			model: 'gemini-flash-lite-latest',
			contents: this.buildContent({ products }),
			config: {
				...BASE_CONFIG,
				systemInstruction,
				responseSchema: ASSESS_COMBINATION_SCHEMA,
				temperature: 0.3
			}
		});

		return JSON.parse(response.text as string) as ProductCombination;
	}
}
