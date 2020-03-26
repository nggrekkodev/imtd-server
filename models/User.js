const crypto = require('crypto'); // built-in node module

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please tell us your name !']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // Only works on User.create() and User.save()
      // check if password and passwordConfirm are the same
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same !'
    }
  }
  // passwordChangedAt: Date,
  // passwordResetToken: String,
  // passwordResetExpires: Date,
  // active: {
  //   type: Boolean,
  //   default: true,
  //   select: false
  // }
});

// Check if candidatePassword is the user's password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
//   // if this field doesn't exist then the password has never changed
//   if (this.passwordChangedAt) {
//     // parse to compare the same date format, millisec/1000=sec in base 10
//     const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
//     return JWTTimeStamp < changedTimeStamp;
//   }
//   // Not changed : JWTstamp >= changedPassword
//   return false;
// };

// userSchema.methods.createPasswordResetToken = function() {
//   // Token that will be sent
//   const resetToken = crypto.randomBytes(32).toString('hex');

//   // Encrypted token that is stored in DB
//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // expires in 10 minutes
//   console.log({ resetToken }, this.passwordResetToken);
//   return resetToken;
// };

// Use a regular expression to use this middleware with queries starting with "find"
// userSchema.pre(/^find/, function(next) {
//   // this.find({ active: false}); // doesn't show users without active field even if they 	are active

//   // "this" points to the current query
//   // this.find({ active: { $ne: false } }); // display also users without active field

//   next();
// });

// userSchema.pre('save', function(next) {
//   // if password is not modified or the document is new, run next middleware
//   if (!this.isModified('password') || this.isNew) return next();

//   // remove 1 sec to make sure that the token timestamp is greater than (created after) passwordChangedAt because providing a token can sometimes take time. Make sure that the token is created after the passwordChangedAt timestamp
//   // Saving in DB can take much time than creating a jwt
//   this.passwordChangedAt = Date.now() - 1000; // remove 1 sec
//   next();
// });

// Middleware to hash the password
userSchema.pre('save', async function(next) {
  // if password has not been modified, end and call next middleware
  if (!this.isModified('password')) return next();

  // Hash the password with a cost of 12 - async function
  this.password = await bcrypt.hash(this.password, 12);

  // this field is no longer usefull once modified
  // mongo trick to remove a field in DB
  this.passwordConfirm = undefined;

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
