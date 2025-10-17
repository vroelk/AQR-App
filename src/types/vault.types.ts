// import { text } from 'node:stream/consumers';
import { z } from 'zod';

export const VaultMetadataSchema = z.object({
	therapistName: z.string(),
	notes: z.string(),
	dateCreated: z.string()
});

export type VaultMetadata = z.infer<typeof VaultMetadataSchema>;

export const PatientMetadataSchema = z.object({
	id: z.string(),
	name: z.string(),
	surname: z.string(),
	diagnosis: z.string(),
	notes: z.string(),
	dateCreated: z.string(),
	birthDate: z.string(),
});
export type PatientMetadata = z.infer<typeof PatientMetadataSchema>;

export const DatasetSchema = z.object({
	label: z.enum(['VQR', 'PEQR', 'IQR', 'TQR']),
	color: z.string(),
	data: z.array(
		z.object({
			x: z.number(),
			y: z.number()
		})
	)
});

export type Dataset = z.infer<typeof DatasetSchema>;

export const SessionMetadataSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	notes: z.string(),
	date: z.string(),
	duration: z.number(),
	name: z.string(),
	datasets: z.array(DatasetSchema),
	comments: z.array(
		z.object({
			x: z.number(),
			y: z.number(),
			text: z.string(),
			isBreak: z.boolean().optional()
		})
	)
});

export type SessionMetadata = z.infer<typeof SessionMetadataSchema>;

export interface ChartData {
	duration: number;
	name: string;
	data: {
		datasets: {
			label: Scale;
			backgroundColor: string;
			borderColor: string;
			borderWidth: number;
			hidden: boolean;
			data: {
				x: number;
				y: number;
			}[];
		}[];
		comments: {
			x: number;
			y: number;
			text: string;
			isBreak?: boolean;
		}[];
	};
	notes: string;
	date: string;
}

export type Scale = 'VQR' | 'PEQR' | 'IQR' | 'TQR';

export const SCALES = ['VQR', 'PEQR', 'IQR', 'TQR'] as const;
