import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    referenceId?: string;
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          referenceId: data.referenceId,
          isRead: false
        }
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId
        },
        data: {
          isRead: true
        }
      });

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Create a blockchain request notification for a sponsor
   */
  async createBlockchainRequestNotification(
    sponsorId: string,
    beneficiaryName: string,
    amount: number,
    blockchainRequestId: string
  ) {
    try {
      return await this.createNotification({
        userId: sponsorId,
        title: 'New Blockchain Bill Request',
        message: `${beneficiaryName} has requested ${amount} ETH for a bill payment`,
        type: 'info',
        referenceId: blockchainRequestId
      });
    } catch (error) {
      console.error('Error creating blockchain request notification:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 