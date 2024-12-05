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
            default: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fid%2Filustrasi%2Ffoto-profil&psig=AOvVaw0PcC2IOouKKr6u3ssWcRBZ&ust=1733502756845000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKjSgJSHkYoDFQAAAAAdAAAAABAJ'
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
