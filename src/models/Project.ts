import { Schema, model, Document } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description: string;
    keyFeatures: string[];
    companyContext: string;
    IndustryCase: string[];
    technologies: string[];
    IndustrySkill: string[];
    vectorEmbedding?: number[];


}

const projectSchema = new Schema<IProject>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    keyFeatures: { type: [String], required: true},
    companyContext: {type: String, required: true},
    IndustryCase: { type: [String], required: true},
    technologies: { type: [String], default: [] },
    IndustrySkill: { type: [String], required: true},
    vectorEmbedding: { type: [Number], default: undefined }
}, {
    timestamps: true
});

export const Project = model<IProject>('Project', projectSchema);