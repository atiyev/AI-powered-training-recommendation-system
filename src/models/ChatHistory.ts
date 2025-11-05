import { Schema, model, Document, Types } from 'mongoose';

export interface IChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface IChatHistory extends Document {
    userId: Types.ObjectId; 
    sessionId: string; 
    messages: IChatMessage[];
    context: {
        lastTrainingDiscussed?: string; 
        lastProjectDiscussed?: string; 
        userDepartment: string; 
    };
}

const chatMessageSchema = new Schema<IChatMessage>({
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant']
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const chatHistorySchema = new Schema<IChatHistory>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: { type: String, required: true },
    messages: [chatMessageSchema],
    context: {
        lastTrainingDiscussed: { type: String },
        lastProjectDiscussed: { type: String },
        userDepartment: { type: String, required: true }
    }
}, {
    timestamps: true
});


chatHistorySchema.index({ userId: 1, sessionId: 1 });

export const ChatHistory = model<IChatHistory>('ChatHistory', chatHistorySchema);
