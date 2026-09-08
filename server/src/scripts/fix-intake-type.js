const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hmk-mobile';

async function fix() {
  await mongoose.connect(MONGODB_URI);
  const MSP = mongoose.model('ManagedSellingPhone', new mongoose.Schema({}, { strict: false }));
  const docs = await MSP.find({});
  for (const doc of docs) {
    if (!doc.get('intakeType')) {
      const type = doc.get('sellRequestId') || doc.get('sellRequest') ? 'imported_from_sell' : 'direct_walkin';
      doc.set('intakeType', type);
      await doc.save();
      console.log(`Updated ${doc.get('managedId')} with intakeType: ${type}`);
    }
  }
  console.log('Finished updating existing records.');
  process.exit();
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
