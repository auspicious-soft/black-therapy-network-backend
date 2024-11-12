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

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
}).strict({
    message: "Bad payload present in the data"
})


const baseOnboardingApplicationSchema = z.object({
    // providerType: z.string(),
    licenceType: z.string(),
    // profilePic: z.string().default(""),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    dob: z.string(),
    state: z.string(),
    zipCode: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().nullable(),
    city: z.string(),
    country: z.string(),
    salaryDesired: z.string(),
    howLongAtPresentAddress: z.string().optional(),
    currentEmploymentStatus: z.enum(["Employed", "Self-Employed", "Unemployed", "Student"]).optional(),
    employmentCityState: z.string().optional(),
    weeklyHours: z.string(),
    currentOrPreviousEmployerName: z.string().optional(),
    rolePosition: z.string().optional(),
    rateOfPay: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    reasonForLeaving: z.string().optional(),
    supervisorName: z.string().optional(),
    jobDescription: z.string().optional(),
    currentResume: z.string().optional(),
    employmentDesired: z.string().optional(),
    highestEducationCompleted: z.enum(["None", "High School/ GED", "College", "Graduate School", "Advanced Degree/ Professional School"]).optional(),
    schoolName: z.string().optional(),
    location: z.string().optional(),
    majorDegree: z.string().optional(),
    licenseOrCertification: z.string().optional(),
    skills: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    currentAvailability: z.array(z.string()),
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
    expirationDate: z.string().optional(),
    professionalReferences: z.array(z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string().email(),
        companyPosition: z.string(),
    })).optional(),
    howAreQualifiedForPosition: z.string().optional(),
    additionalInformation: z.string().optional(),
    consentAgreement: z.boolean().optional(),
    consentFirstName: z.string().optional(),
    consentLastName: z.string().optional(),
    consentDate: z.string().optional(),
    consentSignature: z.string().optional(),
    superVisionAgreement: z.string().optional(),
    againConsentAgreement: z.boolean().optional(),
    againConsentFirstName: z.string().optional(),
    againConsentLastName: z.string().optional(),
    againConsentDate: z.string().optional(),
    againConsentSignature: z.string().optional(),
    status: z.enum([
        "Terminated", 
        "Suspended", 
        "Active", 
        "Welcome Letter", 
        "Doesn't Meet Qualifications",
        "Applicant Reviewed",
        "Interview Pending",
        "Interview Completed",
        "Incomplete Application",
        "Withdrawn",
        "Follow-Up",
        "Offer Sent",
        "Background Check Pending",
        "Credential Pending",
        "Offer Accepted",
        "Leave of Absence",
        "Vacation",
        "Probationary", 
        "Pending Termination",
    ]).optional(),
    preferredCommunicationMethod: z.string().optional()
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