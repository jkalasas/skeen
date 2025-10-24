export function imageFileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (typeof reader.result === 'string') {
				const dataUrl = reader.result;
				resolve(dataUrl.split(',')[1]); // Extract Base64 part from data URL
			} else {
				reject(new Error('Failed to read file as string.'));
			}
		};

		reader.onerror = (error) => {
			reject(error);
		};

		reader.readAsDataURL(file); // Reads the file as a data URL (Base64 encoded)
	});
}
