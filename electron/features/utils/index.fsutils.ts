import {
	PatientMetadata,
	PatientMetadataSchema,
	SessionMetadata,
	SessionMetadataSchema,
	VaultMetadata,
	VaultMetadataSchema
} from '../../../src/types/vault.types';
import fs from 'fs';
import path from 'path';

export const checkVaultPath = (vaultPath: string) => {
	if (!fs.existsSync(vaultPath)) {
		return {
			success: false,
			message: 'VAULTPATHNOTEXISTS',
			data: null
		};
	}

	if (!fs.lstatSync(vaultPath).isDirectory()) {
		return {
			success: false,
			message: 'VAULTPATHNOTADIRECTORY',
			data: null
		};
	}

	if (!fs.existsSync(path.join(vaultPath, '_vault.json'))) {
		return {
			success: false,
			message: 'VAULTPATHNOTCONTAINSVAULTJSON',
			data: null
		};
	}

	const vaultData = fs.readFileSync(
		path.join(vaultPath, '_vault.json'),
		'utf-8'
	);

	let parsedVaultData;
	try {
		parsedVaultData = JSON.parse(vaultData);
	} catch (error) {
		return {
			success: false,
			message: 'VAULTPATHNOTCONTAINSVAULTJSON',
			data: null
		};
	}

	if (!parsedVaultData || typeof parsedVaultData !== 'object') {
		return {
			success: false,
			message: 'VAULTPATHNOTCONTAINSVAULTJSON',
			data: null
		};
	}

	const result = VaultMetadataSchema.safeParse(parsedVaultData);
	if (!result.success) {
		return {
			success: false,
			message: 'VAULTPATHNOTCONTAINSVAULTJSON',
			data: null
		};
	}

	const vaultMetadata: VaultMetadata = result.data;

	const patients: PatientMetadata[] = [];
	const patientDirs = fs
		.readdirSync(vaultPath)
		.filter(file => fs.lstatSync(path.join(vaultPath, file)).isDirectory())
		.filter(file => file.startsWith('p__'));

	for (const patientDir of patientDirs) {
		const patientFilePath = path.join(vaultPath, patientDir, '_patient.json');
		if (!fs.existsSync(patientFilePath)) {
			return {
				success: false,
				message: 'VAULTPATHNOTCONTAINSPATIENTJSON',
				data: null
			};
		}

		const patientData = fs.readFileSync(patientFilePath, 'utf-8');
		let parsedPatientData;
		try {
			parsedPatientData = JSON.parse(patientData);
		} catch (error) {
			return {
				success: false,
				message: 'VAULTPATHNOTCONTAINSPATIENTJSON',
				data: null
			};
		}
		if (!parsedPatientData || typeof parsedPatientData !== 'object') {
			return {
				success: false,
				message: 'VAULTPATHNOTCONTAINSPATIENTJSON',
				data: null
			};
		}
		const patientResult = PatientMetadataSchema.safeParse(parsedPatientData);
		if (!patientResult.success) {
			return {
				success: false,
				message: 'VAULTPATHNOTCONTAINSPATIENTJSON',
				data: null
			};
		}
		const patientMetadata: PatientMetadata = patientResult.data;
		patients.push(patientMetadata);
	}

	return {
		success: true,
		message: 'VAULTPATHVALID',
		data: { vaultMetadata, patients }
	};
};

export const createVaultPath = (vaultPath: string) => {
	if (fs.existsSync(vaultPath)) {
		if (!fs.lstatSync(vaultPath).isDirectory()) {
			return {
				success: false,
				message: 'VAULTPATHNOTDIRECTORY',
				data: null
			};
		}

		const isEmpty = fs.readdirSync(vaultPath).length === 0;
		if (!isEmpty) {
			return {
				success: false,
				message: 'VAULTPATHNOTEMPTY',
				data: null
			};
		}
	}

	if (!fs.existsSync(vaultPath)) {
		fs.mkdirSync(vaultPath, { recursive: true });
	}

	const vaultMetadata: VaultMetadata = {
		therapistName: '',
		notes: '',
		dateCreated: new Date().toISOString()
	};

	fs.writeFileSync(
		path.join(vaultPath, '_vault.json'),
		JSON.stringify(vaultMetadata, null, 2)
	);

	return {
		success: true,
		message: 'VAULTCREATED',
		data: vaultMetadata
	};
};

export const createPatientPath = (
	vaultPath: string,
	patientData: PatientMetadata
) => {
	const patientPath = path.join(vaultPath, `p__${patientData.id}`);

	if (fs.existsSync(patientPath)) {
		return {
			success: false,
			message: 'PATIENTEXISTS',
			data: null
		};
	}

	try {
		fs.mkdirSync(patientPath);

		fs.writeFileSync(
			path.join(patientPath, '_patient.json'),
			JSON.stringify(patientData, null, 2)
		);
	} catch (error) {
		return {
			success: false,
			message: 'ERRORCREATEPATIENTPATH',
			data: null
		};
	}

	return {
		success: true,
		message: 'PATIENTCREATED',
		data: patientData
	};
};

export const updatePatientData = (
	vaultPath: string,
	patientData: PatientMetadata
) => {
	const patientPath = path.join(vaultPath, `p__${patientData.id}`);

	if (!fs.existsSync(patientPath)) {
		return {
			success: false,
			message: 'PATIENTNOTEXISTS',
			data: null
		};
	}

	if (!fs.lstatSync(patientPath).isDirectory()) {
		return {
			success: false,
			message: 'PATIENTPATHNOTDIRECTORY',
			data: null
		};
	}

	try {
		fs.writeFileSync(
			path.join(patientPath, '_patient.json'),
			JSON.stringify(patientData, null, 2)
		);
	} catch (error) {
		return {
			success: false,
			message: 'ERRORUPDATEPATIENTDATA',
			data: null
		};
	}
	return {
		success: true,
		message: 'PATIENTUPDATED',
		data: patientData
	};
};

export const getPatientSessionsData = (
	vaultPath: string,
	patientId: string
) => {
	const patientPath = path.join(vaultPath, `p__${patientId}`);

	if (!fs.existsSync(patientPath)) {
		return {
			success: false,
			message: 'PATIENTNOTEXISTS',
			data: null
		};
	}
	if (!fs.lstatSync(patientPath).isDirectory()) {
		return {
			success: false,
			message: 'PATIENTPATHNOTDIRECTORY',
			data: null
		};
	}

	const sessionFiles = fs
		.readdirSync(patientPath)
		.filter(file => fs.lstatSync(path.join(patientPath, file)).isFile())
		.filter(file => file.startsWith('s__') && file.endsWith('.json'));

	const sessions: SessionMetadata[] = [];
	for (const sessionFile of sessionFiles) {
		const sessionFilePath = path.join(patientPath, sessionFile);
		const sessionData = fs.readFileSync(sessionFilePath, 'utf-8');
		let parsedSessionData;
		try {
			parsedSessionData = JSON.parse(sessionData);
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: 'SESSIONFILENOTVALIDJSON',
				data: null
			};
		}

		if (!parsedSessionData || typeof parsedSessionData !== 'object') {
			return {
				success: false,
				message: 'SESSIONFILENOTVALIDJSON',
				data: null
			};
		}

		const sessionResult = SessionMetadataSchema.safeParse(parsedSessionData);
		if (!sessionResult.success) {
			return {
				success: false,
				message: 'SESSIONFILENOTVALIDSESSIONJSON',
				data: null
			};
		}
		const sessionMetadata: SessionMetadata = sessionResult.data;
		sessions.push(sessionMetadata);
	}

	return {
		success: true,
		message: 'SESSIONSRETRIEVED',
		data: {
			patientId,
			sessions
		}
	};
};

export const saveSessionData = (
	vaultPath: string,
	patientId: string,
	sessionData: SessionMetadata,
	createNew: boolean = true
) => {
	const patientPath = path.join(vaultPath, `p__${patientId}`);

	if (!fs.existsSync(patientPath)) {
		return {
			success: false,
			message: 'PATIENTNOTEXISTS',
			data: null
		};
	}
	if (!fs.lstatSync(patientPath).isDirectory()) {
		return {
			success: false,
			message: 'PATIENTPATHNOTDIRECTORY',
			data: null
		};
	}
	const sessionFileName = `s__${sessionData.id}.json`;
	const sessionFilePath = path.join(patientPath, sessionFileName);

	if (!createNew && !fs.existsSync(sessionFilePath)) {
		return {
			success: false,
			message: 'SESSIONFILENOTEXISTS',
			data: null
		};
	}

	try {
		fs.writeFileSync(sessionFilePath, JSON.stringify(sessionData, null, 2));
	} catch (error) {
		return {
			success: false,
			message: 'CREATESESSIONFILEERROR',
			data: null
		};
	}

	return {
		success: true,
		message: 'SESSIONSAVED',
		data: sessionData
	};
};

export const getSessionData = (
	vaultPath: string,
	patientId: string,
	sessionId: string
) => {
	const sessionPath = path.join(
		vaultPath,
		`p__${patientId}`,
		`s__${sessionId}.json`
	);

	if (!fs.existsSync(sessionPath)) {
		return {
			success: false,
			message: 'SESSIONPATHNOTEXISTS',
			data: null
		};
	}
	if (!fs.lstatSync(sessionPath).isFile()) {
		return {
			success: false,
			message: 'SESSIONPATHNOTFILE',
			data: null
		};
	}

	const sessionData = fs.readFileSync(sessionPath, 'utf-8');
	let parsedSessionData;
	try {
		parsedSessionData = JSON.parse(sessionData);
	} catch (error) {
		return {
			success: false,
			message: 'SESSIONFILENOTVALIDJSON',
			data: null
		};
	}

	if (!parsedSessionData || typeof parsedSessionData !== 'object') {
		return {
			success: false,
			message: 'SESSIONFILENOTVALIDJSON',
			data: null
		};
	}
	const sessionResult = SessionMetadataSchema.safeParse(parsedSessionData);
	if (!sessionResult.success) {
		return {
			success: false,
			message: 'SESSIONFILENOTVALIDSESSIONJSON',
			data: null
		};
	}

	return {
		success: true,
		message: 'SESSIONSRETRIEVED',
		data: {
			sessionData: sessionResult.data
		}
	};
};

export const deleteSession = (
	vaultPath: string,
	patientId: string,
	sessionId: string
) => {
	const sessionPath = path.join(
		vaultPath,
		`p__${patientId}`,
		`s__${sessionId}.json`
	);

	if (!fs.existsSync(sessionPath)) {
		return {
			success: false,
			message: 'SESSIONPATHNOTEXISTS',
			data: null
		};
	}
	if (!fs.lstatSync(sessionPath).isFile()) {
		return {
			success: false,
			message: 'SESSIONPATHNOTFILE',
			data: null
		};
	}

	try {
		fs.unlinkSync(sessionPath);
	} catch (error) {
		return {
			success: false,
			message: 'SESSIONDELETEERROR',
			data: null
		};
	}

	return {
		success: true,
		message: 'SESSIONDELETED',
		data: null
	};
};

export const deletePatient = (vaultPath: string, patientId: string) => {
	const patientPath = path.join(vaultPath, `p__${patientId}`);

	if (!fs.existsSync(patientPath)) {
		return {
			success: false,
			message: 'PATIENTPATHNOTEXISTS',
			data: null
		};
	}

	try {
		fs.rmSync(patientPath, { recursive: true });
		return {
			success: true,
			message: 'PATIENTDELETED',
			data: null
		};
	} catch (error) {
		return {
			success: false,
			message: 'PATIENTDELETEERROR',
			data: null
		};
	}
};
