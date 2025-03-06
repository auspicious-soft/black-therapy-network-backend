import mongoose from "mongoose"

const clientSchema = new mongoose.Schema({
    role: {
        type: String,
        default: 'client',
        required: true
    },
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'therapists',
        default: null,
    },
    peerSupportIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "therapists",
        default: null
    },
    planType: {
        type: String,
        enum: ['glowUp', 'stayRooted'],
        required: false
    },
    planInterval: {
        type: String,
        enum: ['month', 'week'],
        required: false
    },
    planOrSubscriptionId: {
        type: String,
        required: false
    },
    stripeCustomerId: {
        type: String,
        required: false
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
        type: [String],
        // required: true
    },
    manageStress: {
        type: [String],
        // required: true
    },
    majorLifeChanges: {
        type: [String],
        // required: true
    },
    availableTimes: {
        type: [String],
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
    email: {
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
        type: String,
        default: 'Active Client'
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    profilePic: {
        type: String,
    },
    videoCount: {
        type: Number,
        default: 0
    },
    chatAllowed: {
        type: Boolean,
        default: false
    },
    video: {
        type: Boolean,
        default: true
    },
    message: {
        type: Boolean,
        default: true
    },
    workshop: {
        type: String
    },
    assignedDate: {
        type: Date,
        default: null
    },
    assignedTime: {
        type: String,
        default: null
    },
    communicationPreference: {
        type: String,
    },
    diagnosedWithMentalHealthCondition: {
        type: String,
    },
    diagnosedWithMentalHealthConditionYes : {
        type: String,
        required: false
    },
    historyOfSuicidalThoughts: {
        type: String,
    },
    liveWithOthers: {
        type: String,
    },
    relationshipStatus: {
        type: String,
    },
    seenTherapistBefore: {
        type: String,
    },
    therapyStyle: {
        type: String,
    },
    unlimitedMessaging: {
        type: String
    }
},
    { timestamps: true }
);



export const clientModel = mongoose.model("clients", clientSchema)