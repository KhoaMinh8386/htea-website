const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
    getReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

// Public routes
router.get('/reviews', getReviews);
router.get('/reviews/:id', getReviewById);

// Protected routes (require authentication)
router.post('/reviews', auth, createReview);
router.put('/reviews/:id', auth, updateReview);
router.delete('/reviews/:id', auth, deleteReview);

module.exports = router; 