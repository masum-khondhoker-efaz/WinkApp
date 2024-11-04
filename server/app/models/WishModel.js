import mongoose from 'mongoose';


const WishSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
  versionKey: false,
}
);

module.exports = mongoose.model('Wish', WishSchema);