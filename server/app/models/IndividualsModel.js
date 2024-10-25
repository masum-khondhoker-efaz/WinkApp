import mongoose from 'mongoose';

const IndividualSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {  
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }    
);

const IndividualModel = mongoose.model('individuals', IndividualSchema);
export default IndividualModel;
