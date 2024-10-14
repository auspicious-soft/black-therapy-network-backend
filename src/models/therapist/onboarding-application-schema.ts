import mongoose from "mongoose";

const onboardingApplicationSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "therapists",
        required: true,
    },
    // companyProvidedEmail: {
    //     type: Boolean,
    //     required: true,
    //     default: false,
    // },
    // providerType: {
    //     type: String,
    //     required: true
    // },
    // licensedAndCertified: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    // computerAndWifi: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    // expInTeleHealthPlatform: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    // anyDisciplinaryActionTaken: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    // independentMalpracticeInsurance: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    // insuranceCompanyName: {
    //     type: String,
    //     requierd: true,
    // },
    // claimedFilledInLast6Months: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    licensureType: {
        type: String,
        required: true,
        enum: [
            'Licensed Clinical Social Workers (LCSW)',
            'Licensed Clinical Social Work Associate (LCSW-A)',
            'Licensed Professional Counselor (LPC)',
            'Licensed Professional Counselor Associate (LPC-A)',
            'Licensed Professional Counselor Supervisor (LPCS)',
            'Licensed Clinical Mental Health Counselor Associate (LCMHC-A)',
            'Licensed Clinical Mental Health Counselor (LCMHC)',
            'Licensed Clinical Mental Health Counselor Supervisor (LCMHCS)',
            'Licensed Marriage and Family Therapist Associate (LMFT-A)',
            'Licensed Marriage and Family Therapist (LMFT)',
            'Licensed Clinical Addiction Specialist (LCAS)',
            'Licensed Clinical Addiction Specialist Associate (LCAS-A)'
        ]
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
    howLongAtPresentAddress: {
        type: String,
        required: true
    },
    currentEmploymentStatus: {
        type: String,
        required: true,
        enum: [
            "Employed",
            "Self-Employed",
            "Unemployed",
            "Student",
        ]
    },
    currentOrPreviousEmployerName: {
        type: String,
        required: true
    },
    cityState: {
        type: String,
        required: true
    },
    rolePosition: {
        type: String,
        required: true
    },
    rateOfPay: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reasonForLeaving: {
        type: String,
        required: true
    },
    supervisorName: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    currentResume: {
        type: String,
        required: true,
    },
    highestEducationCompleted: {
        type: String,
        required: true,
        enum: [
            "None",
            "High School/ GED",
            "College",
            "Graduate School",
            "Advanced Degree/ Professional School",
        ]
    },
    schoolName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    majorDegree: {
        type: String,
        required: true
    },
    licenseOrCertification: {
        type: String,
        required: true
    },
    skills: {
        type: String,
        required: true
    },
    employmentDesired: {
        type: String,
        required: true
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
        type: [
            {
                name: String,
                phone: String,
                email: String,
                companyPosition: String,
            }
        ],
    },
    howAreQualifiedForPosition: {
        type: String,
        required: true
    },
    additionalInformation: {
        type: String,
        required: true
    },
    consentAgreement: {
        type: Boolean,
        required: true
    },
    consentFirstName: {
        type: String,
        required: true
    },
    consentLastName: {
        type: String,
        required: true
    },
    consentDate: {
        type: Date,
        required: true
    },
    consentSignature: {
        type: String,
        required: true,
    },
    //   const saveSignature = async () => {
    //     const signature = sigCanvas.current.toDataURL('image/png');
    //     const blob = await (await fetch(signature)).blob();
    //     const formData = new FormData();
    //     formData.append('signature', blob);

    //     try {
    //       await axios.post('/api/save-signature', formData, {
    //         headers: {
    //           'Content-Type': 'multipart/form-data',
    //         },
    //       });
    //       alert('Signature saved successfully!');
    //     } catch (error) {
    //       console.error('Error saving signature:', error);
    //     }
    //   };
    superVisionAgreement: {
        type: String,
        required: true
    },
    againConsentAgreement: {
        type: Boolean,
        required: true
    },
    againConsentFirstName: {
        type: String,
        required: true
    },
    againConsentLastName: {
        type: String,
        required: true
    },
    againConsentDate: {
        type: Date,
        required: true
    },
    againConsentSignature: {
        type: String,
        required: true
    },
    // licenseOrCertificationIssuedDate: {
    //     type: Date,
    //     required: true
    // },
    // licenseOrCertificationExpiryDate: {
    //     type: Date,
    //     required: true
    // },
    // PNPINumber: {
    //     type: String,
    // },
    // taxonomyCode: {
    //     type: String,
    // },
    // requireSupervision: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    // licenceOrCertificationNumber: {
    //     type: Number,
    //     required: true
    // },
    // licenceOrCertificationState: {
    //     type: String,
    //     required: true
    // },
    // licensingBoardOrAgency: {
    //     type: String,
    //     required: true
    // },
    // validSupervisionAgreement: {
    //     type: Boolean,
    //     required: true,
    // },
    // licenseOrCertificationFile: {
    //     type: String,
    //     required: true
    // },
    // preferredCommunicationMethod: {
    //     type: String,
    //     enum: [
    //         "Video",
    //         "Audio",
    //         "Chat",
    //     ],
    //     required: true
    // },
    // preferredLanguage: {
    //     type: String,
    //     required: true
    // },
    // fluencyOtherThanEnglish: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    // yearsOfExperience: {
    //     type: Number,
    //     required: true
    // },
    // helpingApproach: {
    //     type: String,
    //     required: true
    // },
    // clientele: {
    //     type: String,
    //     required: true,
    //     enum: ['Adults (24+)', 'Children (less than 12)', 'Teenagers (13-18)', 'Young adults (18-24)']
    // },
    // generalExpertise: {
    //     type: String,
    //     required: true
    // },
    // aboutYou: {
    //     type: String,
    //     required: true
    // },
    // availableStartTime: {
    //     type: String,
    //     required: true
    // },
    // availableEndTime: {
    //     type: String,
    //     required: true
    // },
    // daysOfTheWeek: {
    //     type: [String],
    //     enum: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    //     required: true
    // },
    backgroundCheckCompleted: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        type: String,
        default: ''
    }
},
    { timestamps: true }
)

export const onboardingApplicationModel = mongoose.model("onboardingApplications", onboardingApplicationSchema)