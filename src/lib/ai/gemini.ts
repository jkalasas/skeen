import { GoogleGenAI, Type, type Content, type GenerateContentConfig } from '@google/genai';

import { BaseAIClient, type Product, type ProductAssessment } from './base';
import { imageFileToBase64 } from '$lib/image';

const BASE_CONFIG: GenerateContentConfig = {
	thinkingConfig: {
		thinkingBudget: 5000
	},
	responseMimeType: 'application/json'
};

const PRODUCT_INFO_CONFIG: GenerateContentConfig = {
	...BASE_CONFIG,
	systemInstruction: 'Provide a detailed assessment of the skincare product.',
	responseSchema: {
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
	},
	temperature: 0,
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
	temperature: 0.7,
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

	async assessProduct(product: Product): Promise<ProductAssessment> {
		const response = await this.client.models.generateContent({
			model: 'gemini-flash-lite-latest',
			contents: this.buildContent(product),
			config: PRODUCT_INFO_CONFIG
		});

		return JSON.parse(response.text as string) as ProductAssessment;
	}

	async assessProductFromImages(images: File[]): Promise<ProductAssessment> {
		const response = await this.client.models.generateContent({
			model: 'gemini-flash-lite-latest',
			contents: await this.buildContentFromImages(images),
			config: PRODUCT_INFO_CONFIG
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
