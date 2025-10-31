import { GoogleGenAI, Type, type Content, type GenerateContentConfig } from '@google/genai';

import { BaseAIClient, type Product, type ProductAssessment } from './base';
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
}
