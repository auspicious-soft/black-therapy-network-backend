import { configDotenv } from "dotenv"

configDotenv()
export const httpStatusCode = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
}


export const detailsToAddOnSubscription = (planType: string, interval: string) => {
    if (planType === 'stayRooted' && interval === 'week') {
        return {
            videoCount: 1,
            chatAllowed: true
        }
    }
    else if (planType === 'glowUp') {
        if (interval === 'week') {
            return {
                videoCount: 2,
                chatAllowed: true
            }
        }
        else if (interval === 'month') {
            return {
                videoCount: 8,
                chatAllowed: true
            }
        }
    }
    else {
        return {
            videoCount: 0,
            chatAllowed: false
        }
    }

}

export const allowedOrigins = [
    'http://localhost:3000', // For local development
    , 'https://api.blacktherapy.net'  // Add your API domain
    , 'https://www.blacktherapy.net',
    'https://blacktherapy.net'
]

export const customerAppointmentsRoute = `${process.env.FRONTEND_URL}/customer/appointments`

export const SERVER_CONFIG = {
    CRON_SCHEDULE: '*/15 * * * *'
}