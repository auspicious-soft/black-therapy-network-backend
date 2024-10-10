import {z} from "zod";
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
    email: z.string().email(),
    companyProvidedEmail: z.boolean(),
    providerType: z.string().min(1),
    licensedAndCertified: z.boolean(),
    computerAndWifi: z.boolean(),
    expInTeleHealthPlatform: z.boolean(),
    anyDisciplinaryActionTaken: z.boolean(),
    independentMalpracticeInsurance: z.boolean(),
    insuranceCompanyName: z.string().min(1),
    claimedFilledInLast6Months: z.boolean(),
    profilePic: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phoneNumber: z.string().min(1),
    gender: z.string().min(1),
    dob: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().min(1),
    licenseOrCertificationIssuedDate: z.string().min(1),
    licenseOrCertificationExpiryDate: z.string().min(1),
    PNPINumber: z.string().min(1),
    taxonomyCode: z.string().min(1),
    requireSupervision: z.boolean(),
    licenceType: z.string().min(1),
    licenceOrCertificationNumber: z.number(),
    licenceOrCertificationState: z.string().min(1),
    licensingBoardOrAgency: z.string().min(1),
    validSupervisionAgreement: z.boolean(),
    licenseOrCertificationFile: z.string().min(1),
    preferredCommunicationMethod: z.string().min(1),
    preferredLanguage: z.string().min(1),
    fluencyOtherThanEnglish: z.boolean(),
    yearsOfExperience: z.number(),
    helpingApproach: z.string().min(1),
    clientele: z.string().min(1),
    generalExpertise: z.string().min(1),
    aboutYou: z.string().min(1),
    availableStartTime: z.string().min(1),
    availableEndTime: z.string().min(1),
    daysOfTheWeek: z.array(z.string().min(1)),
    backgroundCheckCompleted: z.boolean(),
}).strict({
    message: "Bad payload present in the data"
});

export const onboardingApplicationSchema = baseOnboardingApplicationSchema;

export const updateTherapistSchema = baseOnboardingApplicationSchema.partial()

export const userOTPVeificationSchema = z.object({
    email : z.string().email(),
    otp: z.string().length(6),
    password: z.string(),
}).strict({
    message: "Bad payload present in the data"
})