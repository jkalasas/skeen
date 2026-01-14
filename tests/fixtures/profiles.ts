import type { UserProfile, SkinType, AgeRange, SkinConcern, SunExposure } from '$lib/types/profile';

export const testProfile: UserProfile = {
	skinType: 'Combination',
	isSensitive: false,
	ageRange: '25-34',
	skinConcerns: ['Acne', 'Dark Spots'],
	sunExposure: 'Medium (some outdoor)'
};

export const testProfileSensitive: UserProfile = {
	skinType: 'Dry',
	isSensitive: true,
	ageRange: '35-44',
	skinConcerns: ['Dryness', 'Redness', 'Aging'],
	sunExposure: 'Low (mostly indoors)'
};

export const testProfileOily: UserProfile = {
	skinType: 'Oily',
	isSensitive: false,
	ageRange: '18-24',
	skinConcerns: ['Acne', 'Dullness'],
	sunExposure: 'High (frequently outdoors)'
};

export const testProfileMinimal: UserProfile = {
	skinType: 'Normal',
	isSensitive: false,
	ageRange: 'Under 18',
	skinConcerns: []
};

export const allSkinTypes: SkinType[] = ['Oily', 'Dry', 'Combination', 'Normal'];

export const allAgeRanges: AgeRange[] = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55+'];

export const allSkinConcerns: SkinConcern[] = [
	'Acne',
	'Aging',
	'Dark Spots',
	'Dryness',
	'Redness',
	'Dullness'
];

export const allSunExposures: SunExposure[] = [
	'Low (mostly indoors)',
	'Medium (some outdoor)',
	'High (frequently outdoors)'
];

export function createTestProfile(overrides: Partial<UserProfile> = {}): UserProfile {
	return {
		...testProfile,
		...overrides
	};
}
