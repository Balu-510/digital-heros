import User from '../user/user.model.js';
import Draw from '../draw/draw.model.js';

// GET /api/admin/analytics
export const getPlatformAnalytics = async (req, res) => {
  try {
    const activeUsersCount = await User.countDocuments({ 'subscription.status': 'active' });
    
    const currentPool = activeUsersCount * 5; 
    
    const draws = await Draw.find({ 'winners.verificationStatus': 'pending' });
    let pendingVerifications = 0;
    draws.forEach(draw => {
      pendingVerifications += draw.winners.filter(w => w.verificationStatus === 'pending').length;
    });

    res.status(200).json({
      activeUsers: activeUsersCount,
      currentPool: currentPool.toFixed(2),
      totalCharity: (activeUsersCount * 1.20).toFixed(2),
      pendingVerifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

// GET /api/admin/verifications
export const getPendingVerifications = async (req, res) => {
  try {
    const draws = await Draw.find({
      'winners.verificationStatus': 'pending',
      'winners.proofUrl': { $exists: true, $ne: null }
    }).populate('winners.user', 'email');

    const list = [];
    draws.forEach(draw => {
      draw.winners.forEach(w => {
        if (w.verificationStatus === 'pending' && w.proofUrl) {
          list.push({
            drawId: draw._id,
            userId: w.user?._id || w.user,
            userEmail: w.user?.email || 'Registered User',
            tier: w.tier,
            prizeAmount: w.prizeAmount,
            proofUrl: w.proofUrl
          });
        }
      });
    });

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending verifications' });
  }
};

// PUT /api/admin/verifications/:drawId
export const processVerification = async (req, res) => {
  try {
    const { drawId } = req.params;
    const { userId, action } = req.body;

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ message: 'Draw not found' });

    const winner = draw.winners.find(w => w.user.toString() === userId.toString());
    if (!winner) return res.status(404).json({ message: 'Winner entry not found' });

    winner.verificationStatus = action;
    if (action === 'approved') {
      winner.paymentStatus = 'paid';
    }
    await draw.save();

    res.status(200).json({ message: `Verification ${action} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error processing verification' });
  }
};