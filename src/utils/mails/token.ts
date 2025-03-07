import { passwordResetTokenModel } from "../../models/password-token-schema"
import { customAlphabet } from 'nanoid'
export const generatePasswordResetToken = async (email: string) => {

  const token = customAlphabet('1234567890', 6)()
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await passwordResetTokenModel.findOne({ email })
  if (existingToken) return await passwordResetTokenModel.findByIdAndDelete(existingToken._id)

  const newPasswordResetToken = new passwordResetTokenModel({
    email,
    token,
    expires
  })
  return newPasswordResetToken.save()
}

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await passwordResetTokenModel.findOne({ token });
    return passwordResetToken;
  } catch {
    return null;
  }
}