export type SkinType = 'Oily' | 'Dry' | 'Combination' | 'Normal';

export type AgeRange = 'Under 18' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';

export type SkinConcern = 'Acne' | 'Aging' | 'Dark Spots' | 'Dryness' | 'Redness' | 'Dullness';

export type SunExposure =
	| 'Low (mostly indoors)'
	| 'Medium (some outdoor)'
	| 'High (frequently outdoors)';

export interface UserProfile {
	skinType: SkinType;
	isSensitive: boolean;
	ageRange: AgeRange;
	skinConcerns: SkinConcern[]; // Changed from primaryConcern to skinConcerns (array)
	sunExposure?: SunExposure;
}
