import { Request, Response } from "express"
import { SortOrder } from "mongoose"
import stripe from "src/configF/stripe"
import { adminModel } from "src/models/admin/admin-schema"
import { AlertModel } from "src/models/admin/alerts-schema"
import { userModel } from "src/models/admin/user-schema"
import { clientModel } from "src/models/client/clients-schema"
import { serviceAssignmentModel } from "src/models/client/service-assignment-schema"
import { therapistModel } from "src/models/therapist/therapist-schema"
import { addAlertService } from "src/services/alerts/alerts-service"
import { PlanType } from "src/services/client/plans-service"

export const checkValidAdminRole = (req: Request, res: Response, next: any) => {
    const { role } = req.headers
    if (role !== 'admin') return res.status(403).json({ success: false, message: "Invalid role" })
    else return next()
}

interface Payload {
    description?: string;
    order?: string;
    orderColumn?: string;
}

export const queryBuilder = (payload: Payload, querySearchKeyInBackend = ['name']) => {
    let { description = '', order = '', orderColumn = '' } = payload;
    const query = description ? { $or: querySearchKeyInBackend.map(key => ({ [key]: { $regex: description, $options: 'i' } })) } : {}
    const sort: { [key: string]: SortOrder } = order && orderColumn ? { [orderColumn]: order === 'asc' ? 1 : -1 } : {};

    return { query, sort };
}

export const convertToBoolean = (value: string) => {
    if (value === 'true') return true
    else if (value === 'false') return false
    else return value
}

export const isEmailTaken = async (email: string): Promise<boolean> => {
    const models = [therapistModel, clientModel, adminModel, userModel];
    for (const model of models) {
        const user = await (model as any).findOne({ email: email.toLowerCase() });
        if (user) return true;
    }
    return false;
}

export const addAlertsOfExpiration = async () => {
    const today = new Date();
    const serviceAssignments = await serviceAssignmentModel.find();

    for (const serviceAssignment of serviceAssignments) {
        if (serviceAssignment.expirationDate) {
            const expirationDate = new Date(serviceAssignment.expirationDate);
            const expirationDateMinus30 = new Date(expirationDate);
            expirationDateMinus30.setDate(expirationDateMinus30.getDate() - 30);
            if (today >= expirationDateMinus30 && today <= expirationDate) {
                const alertExists = await AlertModel.findOne({
                    userId: serviceAssignment.clientId,
                    userType: 'clients',
                    message: 'This client\'s service agreement is about to expire',
                    date: expirationDate,
                    type: 'alert'
                });
                if (!alertExists) {
                    await addAlertService({
                        userId: serviceAssignment.clientId,
                        message: 'This client\'s service agreement is about to expire',
                        userType: 'clients',
                        date: expirationDate,
                        type: 'alert'
                    });
                }
            }
        }
        if (serviceAssignment.ccaCompletionDate) {
            const ccaCompletionDate = new Date(serviceAssignment.ccaCompletionDate);
            const ccaCompletionDateMinus30 = new Date(ccaCompletionDate);
            ccaCompletionDateMinus30.setDate(ccaCompletionDateMinus30.getDate() - 30);
            if (today >= ccaCompletionDateMinus30 && today <= ccaCompletionDate) {
                const alertExists = await AlertModel.findOne({
                    userId: serviceAssignment.clientId,
                    userType: 'clients',
                    message: 'This client\'s care plan is about to expire',
                    date: ccaCompletionDate,
                    type: 'alert'
                });
                if (!alertExists) {
                    await addAlertService({
                        userId: serviceAssignment.clientId,
                        message: 'This client\'s care plan is about to expire',
                        userType: 'clients',
                        date: ccaCompletionDate,
                        type: 'alert'
                    });
                }
            }
        }
        if (serviceAssignment.pcpCompletionDate) {
            const pcpCompletionDate = new Date(serviceAssignment.pcpCompletionDate);
            const pcpCompletionDateMinus30 = new Date(pcpCompletionDate);
            pcpCompletionDateMinus30.setDate(pcpCompletionDateMinus30.getDate() - 30);
            if (today >= pcpCompletionDateMinus30 && today <= pcpCompletionDate) {
                const alertExists = await AlertModel.findOne({
                    userId: serviceAssignment.clientId,
                    userType: 'clients',
                    message: 'This client\'s personal care plan is about to expire',
                    date: pcpCompletionDate,
                    type: 'alert'
                });
                if (!alertExists) {
                    await addAlertService({
                        userId: serviceAssignment.clientId,
                        message: 'This client\'s personal care plan is about to expire',
                        userType: 'clients',
                        date: pcpCompletionDate,
                        type: 'alert'
                    });
                }
            }
        }
        if (serviceAssignment.reviewedDate) {
            const reviewedDate = new Date(serviceAssignment.reviewedDate)
            if (today >= reviewedDate) {
                const alertExists = await AlertModel.findOne({
                    userId: serviceAssignment.clientId,
                    userType: 'clients',
                    message: 'This client\'s service agreement needs to be reviewed',
                    date: reviewedDate,
                    type: 'alert'
                })
                if (!alertExists) {
                    await addAlertService({
                        userId: serviceAssignment.clientId,
                        message: 'This client\'s service agreement needs to be reviewed',
                        userType: 'clients',
                        date: reviewedDate,
                        type: 'alert'
                    })
                }
            }
        }
    }
};

export const isPlanType = (value: string): value is PlanType => {
    return value === 'stayRooted' || value === 'glowUp';
}

export const getAmountFromPriceId = async (priceId: string): Promise<number | null> => {
    try {
        // Fetch the price details from Stripe
        const price = await stripe.prices.retrieve(priceId);

        // Ensure the price object contains the unit_amount
        if (!price.unit_amount) {
            console.error(`Price ID ${priceId} does not have a unit_amount`);
            return null;
        }

        return price.unit_amount // Amount is in cents
    } catch (error: any) {
        console.error(`Error retrieving price details for ${priceId}:`, error.message);
        return null;
    }
}

export const getLocalDateTime = () => {
    const now = new Date()
    const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const localTime = `${localNow.getUTCHours().toString().padStart(2, '0')}:${localNow.getUTCMinutes().toString().padStart(2, '0')}`
    return {
        localNow,
        localTime
    }
}

export const nonMilitaryTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${parseInt(hours) % 12 || 12}:${minutes} ${parseInt(hours) >= 12 ? 'PM' : 'AM'}`;
}