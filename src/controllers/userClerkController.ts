import { Request, Response } from 'express'
import { clerkClient } from '../index'
import Course from '../models/courseModel'

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params
  const userData = req.body
  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        userType: userData.publicMetadata.userType,
        settings: userData.publicMetadata.settings,
      },
    })
    res.status(200).json({
      message: 'User updated successfully',
      data: user,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Internal server error', error })
  }
}
