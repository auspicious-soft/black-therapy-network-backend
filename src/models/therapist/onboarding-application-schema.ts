import mongoose from "mongoose";

const onboardingApplicationSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "therapists",
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    companyProvidedEmail: {
        type: Boolean,
        required: true,
        default: false,
    },
    providerType: {
        type: String,
        required: true
    },
    licensedAndCertified: {
        type: Boolean,
        required: true,
        default: false
    },
    computerAndWifi: {
        type: Boolean,
        required: true,
        default: false
    },
    expInTeleHealthPlatform: {
        type: Boolean,
        required: true,
        default: false
    },
    anyDisciplinaryActionTaken: {
        type: Boolean,
        required: true,
        default: false
    },
    independentMalpracticeInsurance: {
        type: Boolean,
        required: true,
        default: false
    },
    insuranceCompanyName: {
        type: String,
        requierd: true,
    },
    claimedFilledInLast6Months: {
        type: Boolean,
        required: true,
        default: false
    },
    profilePic: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: [
            "Male",
            "Female",
            "Other",
        ],
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    addressLine1: {
        type: String,
        required: true
    },
    addressLine2: {
        type: String,
        default: null
    },
    licenseOrCertificationIssuedDate: {
        type: Date,
        required: true
    },
    licenseOrCertificationExpiryDate: {
        type: Date,
        required: true
    },
    PNPINumber: {
        type: String,
    },
    taxonomyCode: {
        type: String,
    },
    requireSupervision: {
        type: Boolean,
        required: true,
        default: false
    },
    licenceType: {
        type: String,
        required: true
    },
    licenceOrCertificationNumber: {
        type: Number,
        required: true
    },
    licenceOrCertificationState: {
        type: String,
        required: true
    },
    licensingBoardOrAgency: {
        type: String,
        required: true
    },
    validSupervisionAgreement: {
        type: Boolean,
        required: true,
    },
    licenseOrCertificationFile: {
        type: String,
        required: true
    },
    preferredCommunicationMethod: {
        type: String,
        enum: [
            "Video",
            "Audio",
            "Chat",
        ],
        required: true
    },
    preferredLanguage: {
        type: String,
        required: true
    },
    fluencyOtherThanEnglish: {
        type: Boolean,
        required: true,
        default: false
    },
    yearsOfExperience: {
        type: Number,
        required: true
    },
    helpingApproach: {
        type: String,
        required: true
    },
    clientele: {
        type: String,
        required: true,
        enum: ['Adults (24+)', 'Children (less than 12)', 'Teenagers (13-18)', 'Young adults (18-24)']
    },
    generalExpertise: {
        type: String,
        required: true
    },
    aboutYou: {
        type: String,
        required: true
    },
    availableStartTime: {
        type: String,
        required: true
    },
    availableEndTime: {
        type: String,
        required: true
    },
    daysOfTheWeek: {
        type: [String],
        enum: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        required: true
    },
    backgroundCheckCompleted: {
        type: Boolean,
        required: true,
        default: false
    }
},
    { timestamps: true }
)

export const onboardingApplicationModel = mongoose.model("onboardingApplications", onboardingApplicationSchema)