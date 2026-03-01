import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const BProfileSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    availableTime: {
      weekdays: { type: Number, default: 2, min: 0.5, max: 8  },
      weekends: { type: Number, default: 4, min: 0.5, max: 12 },
    },
    pss: {
      score:       { type: Number,  default: 0.85 },
      dataPoints:  { type: Number,  default: 0    },
      lastUpdated: { type: Date,    default: null  },
      isEstimated: { type: Boolean, default: true  },
    },
    courseCode:            { type: String,  default: null  },
    batchYear:             { type: String,  default: null  },
    onboardingCompleted:   { type: Boolean, default: false },
    onboardingCompletedAt: { type: Date,    default: null  },
  },
  { timestamps: true, collection: 'BStudentProfiles' }
);

export default model('BProfile', BProfileSchema);