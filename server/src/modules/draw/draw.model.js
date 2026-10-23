import mongoose from 'mongoose';

const drawSchema = new mongoose.Schema({
  month: { 
    type: String, 
    required: true 
  }, 
  status: { 
    type: String, 
    enum: ['simulation', 'published'], 
    default: 'simulation' 
  },
  drawType: { 
    type: String, 
    enum: ['random', 'algorithmic'], 
    required: true 
  },
  winningNumbers: [{ 
    type: Number 
  }], 
  prizePool: {
    total: { 
      type: Number, 
      required: true 
    },
    tier5: { 
      type: Number, 
      required: true 
    }, 
    tier4: { 
      type: Number, 
      required: true 
    }, 
    tier3: { 
      type: Number, 
      required: true 
    }, 
    rolloverAmount: { 
      type: Number, 
      default: 0 
    }
  },
  winners: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    tier: { 
      type: Number, 
      enum: [3, 4, 5] 
    },
    prizeAmount: { 
      type: Number 
    },
    verificationStatus: { 
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending' 
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid'], 
      default: 'pending' 
    },
    proofUrl: { 
      type: String 
    } 
  }]
}, { timestamps: true });

export default mongoose.model('Draw', drawSchema);