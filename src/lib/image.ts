function imageFileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result); // This will be the Base64 data URL
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
