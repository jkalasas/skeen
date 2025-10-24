import { GoogleGenAI, Type, type Content, type GenerateContentConfig } from '@google/genai';

import { BaseAIClient, type Product, type ProductAssessment } from './base';

const BASE_CONFIG: GenerateContentConfig = {
	thinkingConfig: {
		thinkingBudget: 5000
	},
	responseMimeType: 'application/json'
};

const PRODUCT_INFO_CONFIG: GenerateContentConfig = {
	...BASE_CONFIG,
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
	}
};

const EXTRACT_PRODUCT_INFO_CONFIG: GenerateContentConfig = {
	...BASE_CONFIG,
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
	}
};

const PRODUCT_INFO_PROMPT =
	'You are an expert skincare product reviewer. Given the information of the product, provide a detailed assessment including the pros and cons, as well as an overall score from 0 to 10.';

const EXTRACT_PRODUCT_INFO_PROMPT =
	'You are an expert at extracting information about skincare products. Given the images of the product, extract the name, description, and ingredients list.';

export class GeminiAIClient extends BaseAIClient {
	private client: GoogleGenAI;

	constructor(apiKey: string) {
		super();

		this.client = new GoogleGenAI({ apiKey });
	}

	private buildContent(prompt: string, data: Record<string, any>): Content[] {
		return [
			{
				role: 'user',
				parts: [{ text: prompt }, { text: JSON.stringify(data) }]
			}
		];
	}

	private async buildContentFromImages(prompt: string, images: File[]): Promise<Content[]> {
		return [
			{
				role: 'user',
				parts: [
					{ text: prompt },
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

	async assessProduct(product: File): Promise<ProductAssessment> {
		const response = await this.client.models.generateContent({
			model: 'gemini-2.5-flash-light',
			contents: this.buildContent(PRODUCT_INFO_PROMPT, product),
			config: PRODUCT_INFO_CONFIG
		});

		return JSON.parse(response.data as string) as ProductAssessment;
	}

	async assessProductFromImages(images: File[]): Promise<ProductAssessment> {
		const response = await this.client.models.generateContent({
			model: 'gemini-2.5-flash-light',
			contents: await this.buildContentFromImages(PRODUCT_INFO_PROMPT, images),
			config: PRODUCT_INFO_CONFIG
		});

		return JSON.parse(response.data as string) as ProductAssessment;
	}

	async extractProductInfo(images: File[]): Promise<Product> {
		const response = await this.client.models.generateContent({
			model: 'gemini-2.5-flash-light',
			contents: await this.buildContentFromImages(EXTRACT_PRODUCT_INFO_PROMPT, images),
			config: EXTRACT_PRODUCT_INFO_CONFIG
		});

		return JSON.parse(response.data as string) as Product;
	}
}
