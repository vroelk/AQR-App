export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const formattedMinutes = minutes.toString().padStart(2, '0');
	const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
	return `${formattedMinutes}:${formattedSeconds}`;
};

export const formatTick = (value: number, duration: number) => {
	const seconds = roundTime(value, duration);
	if (seconds === 0) {
		return '00:00';
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const formattedMinutes = minutes.toString().padStart(2, '0');
	const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
	return `${formattedMinutes}:${formattedSeconds}`;
};

export const roundTime = (time: number, duration: number): number => {
	return Math.round((time / 100) * duration);
};

export const getAge = (birthDate: string | Date, onDate: Date = new Date()) => {
	const b: Date =
		typeof birthDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(birthDate)
			? new Date(
				Number(birthDate.slice(0, 4)),
				Number(birthDate.slice(5, 7)) - 1,
				Number(birthDate.slice(8, 10))
			)
			: new Date(birthDate);

	let age = onDate.getFullYear() - b.getFullYear();
	const m = onDate.getMonth() - b.getMonth();

	if (m < 0 || (m === 0 && onDate.getDate() < b.getDate())) {
		age--;
	}
	return age;
}
