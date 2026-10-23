import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { 
		type: String, 
		required: true, 
		unique: true,
		lowercase: true,
		trim: true
	},
  password: { 
		type: String, 
		required: true 
	},
  role: { 
    type: String, 
    enum: ['public', 'subscriber', 'admin'], 
    default: 'public' 
  },
  subscription: {
    status: { 
			type: String, 
			enum: ['active', 'inactive', 'canceled'], 
			default: 'inactive' 
		},
    plan: { 
			type: String, 
			enum: ['monthly', 'yearly', 'none'], 
			default: 'none' 
		},
    stripeCustomerId: { 
			type: String 
		},
    stripeSubscriptionId: { 
			type: String 
		},
    renewalDate: { 
			type: Date 
		}
  },
  charityPreferences: {
    charityId: { 
			type: mongoose.Schema.Types.ObjectId, 
			ref: 'Charity' 
		},
    contributionPercentage: { 
			type: Number, 
			min: 10, 
			default: 10 
		}
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
	
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);