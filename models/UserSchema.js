const mongoose = require('mongoose');

const USERS =   new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    student_number: {
      type: String,
      required: true,
    },
    address: {
        type: String,
        default: '',
    },
    city: {
        type: String,
    },
    province: {
        type: String,
    },
    postal_code: {
        type: String,
    },
    home_phone: {
        type: String,
    },
    cell_phone: {
        type: String,
    },
    emergency_contact: {
        type: String,
    },
    driving_lisence: {
        type: String,
    },
    gender: {
        type: String,
    },
    dob: {
        type: String,
    },
    issue_date: {
        type: String,
    },
    expiry_date: {
        type: String,
    },
    license_image: {
        type: String,
    },
    
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

module.exports = mongoose.model('users', USERS);
