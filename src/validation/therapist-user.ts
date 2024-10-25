import { z } from "zod";
// import { passwordSchema } from "./admin-user";

export const therapistSignupSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phoneNumber: z.string().min(1),
}).strict({
    message: "Bad payload present in the data"
})

export const therapistLoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
}).strict({
    message: "Bad payload present in the data"
})

const baseOnboardingApplicationSchema = z.object({
    licensureType: z.enum([
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
    ]),
    profilePic: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    gender: z.enum(["Male", "Female", "Other"]),
    dob: z.date(),
    state: z.string(),
    zipCode: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().nullable(),
    howLongAtPresentAddress: z.string(),
    currentEmploymentStatus: z.enum([
        "Employed",
        "Self-Employed",
        "Unemployed",
        "Student",
    ]),
    currentOrPreviousEmployerName: z.string(),
    city: z.string(),
    rolePosition: z.string(),
    rateOfPay: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    reasonForLeaving: z.string(),
    supervisorName: z.string(),
    jobDescription: z.string(),
    currentResume: z.string(),
    highestEducationCompleted: z.enum([
        "None",
        "High School/ GED",
        "College",
        "Graduate School",
        "Advanced Degree/ Professional School",
    ]),
    schoolName: z.string(),
    location: z.string(),
    majorDegree: z.string(),
    licenseOrCertification: z.string(),
    skills: z.string(),
    employmentDesired: z.string(),
    currentAvailability: z.any(),
    felonyOrMisdemeanor: z.string(),
    ifFelonyOrMisdemeanor: z.string().optional(),
    livedInNorthCarolina: z.boolean(),
    ifNotLivedInNorthCarolina: z.string().optional(),
    validDriverLicense: z.boolean(),
    reliableTransportation: z.boolean(),
    legalRightToWorkInUS: z.boolean(),
    reasonableAccommodation: z.boolean(),
    driverLicenseOrStateId: z.string().optional(),
    stateOfIssue: z.string().optional(),
    expirationDate: z.date().optional(),
    professionalReferences: z.array(z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string().email(),
        companyPosition: z.string(),
    })),
    howAreQualifiedForPosition: z.string(),
    additionalInformation: z.string(),
    consentAgreement: z.boolean(),
    consentFirstName: z.string(),
    consentLastName: z.string(),
    consentDate: z.date(),
    consentSignature: z.string(),
    superVisionAgreement: z.string(),
    againConsentAgreement: z.boolean(),
    againConsentFirstName: z.string(),
    againConsentLastName: z.string(),
    againConsentDate: z.date(),
    againConsentSignature: z.string(),
    backgroundCheckCompleted: z.boolean().default(false),
    status: z.string()
}).strict({
    message: "Bad payload present in the data"
});

export const onboardingApplicationSchema = baseOnboardingApplicationSchema;

export const updateTherapistSchema = baseOnboardingApplicationSchema.extend({
    status: z.string()
}).partial()

export const userOTPVeificationSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    password: z.string(),
}).strict({
    message: "Bad payload present in the data"
})