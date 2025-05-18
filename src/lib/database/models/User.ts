import mongoose, { Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
  personal: {
    name: string;
    email: string;
    bio?: string;
    major?: string;
    gradYear: number;
    isAlumni: boolean;
    phone?: string;
  };
  org: {
    chapterId?: mongoose.Types.ObjectId;
    permissionLevel: 'admin' | 'lead' | 'member';
    track?: 'quant' | 'value';
    trackRoles: string[];
    execRoles: string[];
    joinDate?: Date;
    status: 'active' | 'inactive' | 'pending';
  };
  profile: {
    skills: string[];
    projects?: {
      title: string;
      description?: string;
      link?: string;
      githubLink?: string;
      type: 'value' | 'quant' | 'other';
      startDate?: Date;
      endDate?: Date;
      inProgress?: boolean;
      collaborators?: mongoose.Types.ObjectId[];
      tags?: string[];
      imageUrl?: string;
    }[];
    experiences?: {
      company: string;
      title: string;
      startDate: Date;
      endDate?: Date;
      current?: boolean;
      description?: string;
    }[];
    linkedin?: string;
    resumeUrl?: string;
    avatarUrl?: string;
    github?: string;
    interests?: string[];
    achievements?: string[];
  };
  activity: {
    lastLogin?: Date;
    internshipsPosted: number;
  };
  system: {
    clerkId: string;
    firstLogin: boolean;
    notifications?: {
      email: boolean;
      platform: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    personal: {
      name: { type: String, required: true, trim: true },
      email: {
        type: String,
        required: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      },
      bio: { type: String, maxlength: 1000 },
      major: { type: String },
      gradYear: { type: Number, required: true },
      isAlumni: { type: Boolean, default: false },
      phone: { type: String },
    },

    org: {
      chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter' },
      permissionLevel: {
        type: String,
        enum: ['admin', 'lead', 'member'],
        default: 'member',
      },
      track: { type: String, enum: ['quant', 'value'] },
      trackRoles: [
        {
          type: String,
          enum: [
            'QuantitativeResearchCommittee',
            'QuantitativeAnalyst',
            'InvestmentCommittee',
            'ValueAnalyst',
            'PortfolioManager',
          ],
        },
      ],
      execRoles: { type: [String], default: [] },
      joinDate: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active',
      },
    },

    profile: {
      skills: [{ type: String }],
      projects: [
        {
          title: { type: String, required: true },
          description: { type: String },
          link: { type: String },
          githubLink: { type: String },
          type: {
            type: String,
            enum: ['value', 'quant', 'other'],
            required: true,
          },
          startDate: { type: Date },
          endDate: { type: Date },
          inProgress: { type: Boolean, default: false },
          collaborators: [
            {
              type: Schema.Types.ObjectId,
              ref: 'User',
            },
          ],
          tags: [{ type: String }],
          imageUrl: { type: String },
        },
      ],
      experiences: [
        {
          company: { type: String, required: true },
          title: { type: String, required: true },
          startDate: { type: Date, required: true },
          endDate: { type: Date },
          current: { type: Boolean, default: false },
          description: { type: String },
        },
      ],
      linkedin: { type: String },
      resumeUrl: { type: String },
      avatarUrl: { type: String },
      github: { type: String },
      interests: [{ type: String }],
      achievements: [{ type: String }],
    },

    activity: {
      lastLogin: { type: Date },
      internshipsPosted: { type: Number, default: 0 },
    },

    system: {
      clerkId: { type: String, required: true, unique: true },
      firstLogin: { type: Boolean, default: true },
      notifications: {
        email: { type: Boolean, default: true },
        platform: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

// Permission level calculation
UserSchema.pre('save', function (next) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

  if (
    (this.personal?.email && adminEmails.includes(this.personal.email)) ||
    (this.org?.execRoles && this.org.execRoles.length > 0)
  ) {
    if (this.org) this.org.permissionLevel = 'admin';
  } else if (
    this.org?.trackRoles &&
    this.org.trackRoles.some(
      role => role.endsWith('Committee') || role === 'PortfolioManager'
    )
  ) {
    if (this.org) this.org.permissionLevel = 'lead';
  } else {
    if (this.org) this.org.permissionLevel = 'member';
  }

  next();
});

// Indexes for common queries
UserSchema.index({ 'personal.email': 1 });
UserSchema.index({ 'system.clerkId': 1 });
UserSchema.index({ 'org.chapterId': 1, 'org.permissionLevel': 1 });
UserSchema.index({ 'org.track': 1, 'personal.isAlumni': 1 });
UserSchema.index({ 'profile.skills': 1 });

// Compound unique index for email and clerkId
UserSchema.index(
  { 'personal.email': 1, 'system.clerkId': 1 },
  { unique: true, sparse: true }
);

export default mongoose.models.User ||
  mongoose.model<UserDocument>('User', UserSchema);
