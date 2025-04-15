const { sequelize } = require('../config/db');
const migration = require('../migrations/20240320_reset_product_sequence');

async function resetSequence() {
    try {
        await migration.up(null, null);
        console.log('Product sequence has been reset successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting product sequence:', error);
        process.exit(1);
    }
}

resetSequence(); 