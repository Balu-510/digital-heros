import mongoose from 'mongoose';

const charitySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
	},
  description: { 
		type: String, 
		required: true
	},
  isFeatured: { 
		type: Boolean,
		default: false 
	},
  images: [{ 
		type: String 
	}],
  events: [{
    title: { 
			type: String, 
			required: true 
		},
    date: { 
			type: Date, 
			required: true 
		},
    description: { 
			type: String 
		}
  }]
}, { timestamps: true });

export default mongoose.model('Charity', charitySchema);