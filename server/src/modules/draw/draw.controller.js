import Draw from './draw.model.js';
import User from '../user/user.model.js';
import Score from '../score/score.model.js';
import cloudinary from '../../config/cloudinary.js';

// Helper function to generate 5 unique random numbers between 1-45
const generateRandomDraw = () => {
  const numbers = new Set();
  while(numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers);
};

const generateAlgorithmicDraw = async () => {
  const activeUsers = await User.find({ 'subscription.status': 'active' }).select('_id');
  const activeUserIds = activeUsers.map(u => u._id);

  const frequencies = await Score.aggregate([
    { $match: { user: { $in: activeUserIds } } },
    { $group: { _id: '$points', count: { $sum: 1 } } }
  ]);

  const numbers = new Set();
  
  while (numbers.size < 5) {
    if (frequencies.length > 0) {
      const totalWeight = frequencies.reduce((sum, item) => sum + item.count, 0);
      let randomVal = Math.random() * totalWeight;
      
      for (let i = 0; i < frequencies.length; i++) {
        randomVal -= frequencies[i].count;
        if (randomVal <= 0) {
          numbers.add(frequencies[i]._id);
          frequencies.splice(i, 1); 
          break;
        }
      }
    } else {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
  }

  return Array.from(numbers);
};

// POST /api/draws/simulate (Admin Only)
export const simulateDraw = async (req, res) => {
  try {
    const { month } = req.body;
    const drawType = req.body.drawType === 'algorithmic' ? 'algorithmic' : 'random';
    if (!month) return res.status(400).json({ message: 'Month is required' });
    
    const activeUsersCount = await User.countDocuments({ 'subscription.status': 'active' });
    const contributionPerUser = 5; 
    const currentPool = activeUsersCount * contributionPerUser;

    // Rollover only comes from the last PUBLISHED draw (simulations don't count).
    const lastDraw = await Draw.findOne({ status: 'published' }).sort({ createdAt: -1 });
    const rollover = lastDraw && lastDraw.winners.filter(w => w.tier === 5).length === 0 
      ? lastDraw.prizePool.tier5 : 0;

    const winningNumbers = drawType === 'algorithmic' ? await generateAlgorithmicDraw() : generateRandomDraw();

    const draw = new Draw({
      month,
      drawType,
      status: 'simulation',
      winningNumbers,
      prizePool: {
        total: currentPool + rollover,
        tier5: (currentPool * 0.40) + rollover, 
        tier4: currentPool * 0.35,              
        tier3: currentPool * 0.25,
        rolloverAmount: rollover
      }
    });

    await draw.save();
    res.status(201).json(draw);
  } catch (error) {
    res.status(500).json({ message: 'Error simulating draw' });
  }
};

// PUT /api/draws/:id/publish (Admin Only)
export const publishDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) {
      return res.status(404).json({ message: 'Draw not found' });
    }

    if (draw.status === 'published') {
      return res.status(400).json({ message: 'Already published' });
    }

    const activeUsers = await User.find({ 'subscription.status': 'active' }).select('_id');
    const winnersList = [];
    let tier5Count = 0, tier4Count = 0, tier3Count = 0;

    for (const user of activeUsers) {
      const latestScores = await Score.find({ user: user._id }).sort({ date: -1 }).limit(5);
      const userNumbers = latestScores.map(score => score.points);
      
      const matchCount = userNumbers.filter(num => draw.winningNumbers.includes(num)).length;

      if (matchCount >= 3) {
        winnersList.push({ user: user._id, tier: matchCount, prizeAmount: 0 });
        if (matchCount === 5) {
          tier5Count++;
        }

        if (matchCount === 4) {
          tier4Count++;
        }

        if (matchCount === 3) {
          tier3Count++;
        }
      }
    }

    const splitPrize = (pool, count) => count > 0 ? (pool / count) : 0;
    
    winnersList.forEach(winner => {
      if (winner.tier === 5) {
        winner.prizeAmount = splitPrize(draw.prizePool.tier5, tier5Count);
      }

      if (winner.tier === 4) {
        winner.prizeAmount = splitPrize(draw.prizePool.tier4, tier4Count);
      }

      if (winner.tier === 3) {
        winner.prizeAmount = splitPrize(draw.prizePool.tier3, tier3Count);
      }
    });

    draw.winners = winnersList;
    draw.status = 'published';
    await draw.save();
    
    res.status(200).json(draw);
  } catch (error) {
    res.status(500).json({ message: 'Error publishing draw' });
  }
};

// POST /api/draws/:id/verify (Subscriber Route)
export const uploadVerificationProof = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const draw = await Draw.findById(req.params.id);
    if (!draw) {
      return res.status(404).json({ message: 'Draw not found' });
    }

    const winnerIndex = draw.winners.findIndex(w => w.user.toString() === req.user._id.toString());
    if (winnerIndex === -1) return res.status(403).json({ message: 'User is not a winner in this draw' });

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'digital-heroes/verification' },
      async (error, result) => {
        if (error) return res.status(500).json({ message: 'Cloudinary upload failed' });

        draw.winners[winnerIndex].proofUrl = result.secure_url;
        draw.winners[winnerIndex].verificationStatus = 'pending';
        await draw.save();

        res.status(200).json({ message: 'Proof uploaded successfully', url: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error during file upload' });
  }
};

// GET /api/draws/my-winnings (Subscriber Route)
export const getUserWinnings = async (req, res) => {
  try {
    const draws = await Draw.find({
      status: 'published',
      'winners.user': req.user._id
    }).sort({ createdAt: -1 });

    const results = draws.map(draw => {
      const winner = draw.winners.find(w => w.user.toString() === req.user._id.toString());
      return {
        _id: draw._id,
        month: draw.month,
        winningNumbers: draw.winningNumbers,
        tier: winner?.tier,
        prizeAmount: winner?.prizeAmount || 0,
        verificationStatus: winner?.verificationStatus || 'pending',
        proofUrl: winner?.proofUrl || null,
        paymentStatus: winner?.paymentStatus || 'pending'
      };
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching winnings' });
  }
};