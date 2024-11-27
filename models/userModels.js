const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        nama: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: (value) => {
                    return /^[a-zA-Z0-9._%+-]+@gmail.com$/.test(value);
                },
                message: 'Please enter a valid @gmail.com email address'
            }
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'admin'],  
            default: 'user'
        },
        image: {
            type: String,
            default: '/images/default/default-profile.jpg'
        },
        telp: {
            type: Number,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const user = mongoose.model('User', userSchema);
module.exports = user;
