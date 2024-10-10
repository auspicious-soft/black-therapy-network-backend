import mongoose from "mongoose"

const clientSchema = new mongoose.Schema({
    role: {
        type: String,
        default: 'client',
        required: true
    },
    serviceSubscribed: {
        type: String,
        enum: ['me', 'us', 'teen'],
        // required: true
    },
    insuranceCoverage: {
        type: String,
        enum: ['yes', 'no', 'through EAP'],
        // required: true
    },
    insuranceCompany: {
        type: {
            memberOrSubscriberId: String,
            firstName: String,
            lastName: String,
            dateOfBirth: Date,
            insuranceCompanyName: String
        },
        _id: false 
    },
    organisationName: {
        type: String,
    },
    organisationEmail: {
        type: String,
        unique: false
    },
    reasonForLookingHelp: {
        type: String,
        // required: true
    },
    rateSleepingHabits: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        // required: true
    },
    rateCurrentPhysicalHealth: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        // required: true
    },
    howYouKnewUs: {
        type: String,
        // required: true
    },
    gender: {
        type: String,
        // required: true
    },
    mainIssueBrief: {
        type: String,
        // required: true
    },
    firstName: {
        type: String,
        requried: true
    },
    lastName: {
        type: String,
        requried: true
    },
    dob: {
        type: Date,
        // required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    state: {
        type: String,
        // required: true
    },
    city: {
        type: String,
        // required: true
    },
    zipCode: {
        type: String,
        // required: true
    },
    addressLine1: {
        type: String,
        // reqired: true
    },
     addressLine2: {
        type: String,
        // required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    
});

export const clientModel = mongoose.model("clients", clientSchema)