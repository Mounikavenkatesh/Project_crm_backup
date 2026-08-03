import mongoose from 'mongoose';

/**
 * Mongoose Schema representing a Lead in the CRM.
 */
export const leadSchema = new mongoose.Schema(
  {
    /**
     * Name of the lead contact person.
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    /**
     * Company name associated with the lead.
     */
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    /**
     * Contact email address for the lead.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Email must be a valid email address',
      ],
    },
    /**
     * Optional phone number of the lead.
     */
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    /**
     * The sales pipeline status of the lead.
     */
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
        message: 'Status must be one of: New, Contacted, Meeting Scheduled, Proposal Sent, Won, Lost',
      },
      default: 'New',
    },
    /**
     * The source origin of the lead.
     */
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'],
        message: 'Source must be one of: Website, Referral, LinkedIn, Cold Call, Email Campaign, Other',
      },
      default: 'Website',
    },
    /**
     * Estimated or actual financial value of the lead/deal.
     */
    value: {
      type: Number,
      default: 0,
    },
    /**
     * Optional detailed notes about interactions with this lead.
     */
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    /**
     * Timestamp of when the lead was contacted.
     */
    contactedAt: {
      type: Date,
    },
    /**
     * Timestamp of when a meeting was scheduled with the lead.
     */
    meetingAt: {
      type: Date,
    },
    /**
     * Timestamp of when a proposal was sent to the lead.
     */
    proposalAt: {
      type: Date,
    },
    /**
     * Timestamp of when the lead was won.
     */
    wonAt: {
      type: Date,
    },
    /**
     * Reference to the User account that owns this lead.
     */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead owner is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index on owner and status for fast filtered queries
leadSchema.index({ owner: 1, status: 1 });

// Index on email for fast lookups
leadSchema.index({ email: 1 });

// Virtual field for age in days
leadSchema.virtual('age').get(function () {
  if (!this.createdAt) return 0;
  const differenceInTime = Date.now() - this.createdAt.getTime();
  return Math.floor(differenceInTime / (1000 * 3600 * 24));
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
export { Lead };
