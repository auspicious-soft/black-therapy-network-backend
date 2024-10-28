import mongoose from "mongoose";

const onboardingApplicationSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "therapists",
        required: true,
    },
    providerType: {
        type: String,
        required: true
    },
    licenceType: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        required: true,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true,
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
        enum: ["Male", "Female", "Other"],
        required: false,
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
    city: {
        type: String,
        required: true
    },
    
    // Employment Fields - All set to required: false
    howLongAtPresentAddress: {
        type: String,
        required: false
    },
    currentEmploymentStatus: {
        type: String,
        required: false,
        enum: ["Employed", "Self-Employed", "Unemployed", "Student"]
    },
    currentOrPreviousEmployerName: {
        type: String,
        required: false
    },
    rolePosition: {
        type: String,
        required: false
    },
    rateOfPay: {
        type: String,
        required: false
    },
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
    reasonForLeaving: {
        type: String,
        required: false
    },
    supervisorName: {
        type: String,
        required: false
    },
    jobDescription: {
        type: String,
        required: false
    },
    currentResume: {
        type: String,
        required: false
    },
    employmentDesired: {
        type: String,
        required: false
    },

    // Education Fields - All set to required: false
    highestEducationCompleted: {
        type: String,
        required: false,
        enum: [
            "None",
            "High School/ GED",
            "College",
            "Graduate School",
            "Advanced Degree/ Professional School"
        ]
    },
    schoolName: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    majorDegree: {
        type: String,
        required: false
    },
    licenseOrCertification: {
        type: String,
        required: false
    },
    skills: {
        type: String,
        required: false
    },

    currentAvailability: {},
    felonyOrMisdemeanor: {
        type: String,
        required: true,
    },
    ifFelonyOrMisdemeanor: {
        type: String,
    },
    livedInNorthCarolina: {
        type: Boolean,
        required: true
    },
    ifNotLivedInNorthCarolina: {
        type: String,
    },
    validDriverLicense: {
        type: Boolean,
        required: true
    },
    reliableTransportation: {
        type: Boolean,
        required: true
    },
    legalRightToWorkInUS: {
        type: Boolean,
        required: true
    },
    reasonableAccommodation: {
        type: Boolean,
        required: true
    },
    driverLicenseOrStateId: {
        type: String,
    },
    stateOfIssue: {
        type: String,
    },
    expirationDate: {
        type: Date,
    },
    professionalReferences: {
        type: [{
            name: String,
            phone: String,
            email: String,
            companyPosition: String,
        }],
    },
    howAreQualifiedForPosition: {
        type: String,
        required: false
    },
    additionalInformation: {
        type: String,
        required: false
    },

    // Consent Fields - All set to required: false
    consentAgreement: {
        type: Boolean,
        required: false
    },
    consentFirstName: {
        type: String,
        required: false
    },
    consentLastName: {
        type: String,
        required: false
    },
    consentDate: {
        type: Date,
        required: false
    },
    consentSignature: {
        type: String,
        required: false,
    },
    superVisionAgreement: {
        type: String,
        required: false
    },
    againConsentAgreement: {
        type: Boolean,
        required: false
    },
    againConsentFirstName: {
        type: String,
        required: false
    },
    againConsentLastName: {
        type: String,
        required: false
    },
    againConsentDate: {
        type: Date,
        required: false
    },
    againConsentSignature: {
        type: String,
        required: false
    },
    
    backgroundCheckCompleted: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        type: String,
        default: ''
    },
    preferredCommunicationMethod: {
        type: String,
    }
}, { timestamps: true });

export const onboardingApplicationModel = mongoose.model("onboardingApplications", onboardingApplicationSchema);