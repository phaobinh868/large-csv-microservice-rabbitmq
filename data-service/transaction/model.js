import mongoose from 'mongoose';
const Schema = mongoose.Schema

const TransactionSchema = new Schema({
    date: { type: Date },
    token: { type: String },
    amount: { type: Number },
    balance: { type: Number }
}
    , { timestamps: false }
);

export default mongoose.model('Transaction', TransactionSchema);