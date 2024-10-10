import { z } from "zod";

export const clientSignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phoneNumber: z.string().min(1),
    gender: z.string().min(1),
    dob: z.string(),
    state: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    serviceSubscribed: z.enum(['me', 'us', 'teen']),
    insuranceCoverage: z.enum(['yes', 'no', 'through EAP']),
    insuranceCompany: z.object({
        memberOrSubscriberId: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        dateOfBirth: z.string().optional(),
        insuranceCompanyName: z.string().optional(),
    }).optional(),
    organisationName: z.string().optional(),
    organisationEmail: z.string().email().optional(),
    reasonForLookingHelp: z.string().min(1),
    rateSleepingHabits: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
    rateCurrentPhysicalHealth: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
    howYouKnewUs: z.string().min(1),
    mainIssueBrief: z.string().min(1),
}).strict({
    message: "Bad payload present in the data"
});

export const passswordResetSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
}).refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current password"
})