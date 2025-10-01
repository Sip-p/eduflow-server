import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    paymentDone: {
        type: String,
        enum: ["true", "false"],
        required: true
    }
});

export default PaymentSchema;