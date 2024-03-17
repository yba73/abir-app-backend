import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String, 
      
    
    },
    lastname: {
      type: String, 
     
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg',
    },
  },
  
  
  { timestamps: true } //Timestamp true means each user is going to have two extra info : time of creation and time of edit
);

const User = mongoose.model('User', userSchema);

export default User;
