import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            required: true,
        },
isRead: {
    type: Boolean,
    default: false,
},

company: {
    type: String,
    default: "",
},
        message: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Contact", contactSchema);