const redis = require('../config/redis');
const { sendEmail } = require('../config/email');
const db = require('../models');
const moment = require('moment');

class NotificationService {
  constructor() {
    this.queueName = 'notifications';
    this.reminderQueueName = 'reminders';
  }

  // Add notification to Redis queue
  async addToQueue(notification) {
    try {
      await redis.lpush(this.queueName, JSON.stringify(notification));
      console.log('Notification added to queue:', notification.type);
    } catch (error) {
      console.error('Error adding notification to queue:', error);
    }
  }

  // Process notifications from queue
  async processNotifications() {
    try {
      while (true) {
        const notification = await redis.brpop(this.queueName, 1);
        if (notification) {
          const notificationData = JSON.parse(notification[1]);
          await this.sendNotification(notificationData);
        }
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  }

  // Send actual notification
  async sendNotification(notification) {
    try {
      switch (notification.type) {
        case 'activity_log_submitted':
          await this.sendActivityLogNotification(notification);
          break;
        case 'reminder_facilitator':
          await this.sendReminderToFacilitator(notification);
          break;
        case 'overdue_notification':
          await this.sendOverdueNotification(notification);
          break;
        default:
          console.log('Unknown notification type:', notification.type);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Send notification when facilitator submits activity log
  async sendActivityLogNotification(notification) {
    try {
      const { facilitatorId, courseOfferingId, weekNumber } = notification;
      
      const facilitator = await db.Facilitator.findByPk(facilitatorId);
      const courseOffering = await db.CourseOffering.findByPk(courseOfferingId, {
        include: [
          { model: db.Module, as: 'module' },
          { model: db.Class, as: 'class' }
        ]
      });

      if (facilitator && courseOffering) {
        const subject = 'Activity Log Submitted - Course Management Platform';
        const html = `
          <h2>Activity Log Submission Notification</h2>
          <p>Hello Manager,</p>
          <p>A facilitator has submitted their weekly activity log:</p>
          <ul>
            <li><strong>Facilitator:</strong> ${facilitator.name}</li>
            <li><strong>Email:</strong> ${facilitator.email}</li>
            <li><strong>Module:</strong> ${courseOffering.module.name}</li>
            <li><strong>Class:</strong> ${courseOffering.class.name}</li>
            <li><strong>Week:</strong> ${weekNumber}</li>
            <li><strong>Submission Time:</strong> ${moment().format('YYYY-MM-DD HH:mm:ss')}</li>
          </ul>
          <p>Please review the submission in the Course Management Platform.</p>
          <p>Best regards,<br>Course Management System</p>
        `;

        const result = await sendEmail('y.molumo@alustudent.com', subject, html);
        console.log('Activity log notification sent:', result);
      }
    } catch (error) {
      console.error('Error sending activity log notification:', error);
    }
  }

  // Send reminder to facilitator for missing logs
  async sendReminderToFacilitator(notification) {
    try {
      const { facilitatorId, courseOfferingId, weekNumber, deadline } = notification;
      
      const facilitator = await db.Facilitator.findByPk(facilitatorId);
      const courseOffering = await db.CourseOffering.findByPk(courseOfferingId, {
        include: [
          { model: db.Module, as: 'module' },
          { model: db.Class, as: 'class' }
        ]
      });

      if (facilitator && courseOffering) {
        const subject = 'Reminder: Weekly Activity Log Due - Course Management Platform';
        const html = `
          <h2>Weekly Activity Log Reminder</h2>
          <p>Hello ${facilitator.name},</p>
          <p>This is a friendly reminder that your weekly activity log is due:</p>
          <ul>
            <li><strong>Module:</strong> ${courseOffering.module.name}</li>
            <li><strong>Class:</strong> ${courseOffering.class.name}</li>
            <li><strong>Week:</strong> ${weekNumber}</li>
            <li><strong>Deadline:</strong> ${moment(deadline).format('YYYY-MM-DD HH:mm:ss')}</li>
          </ul>
          <p>Please submit your activity log as soon as possible to avoid any delays.</p>
          <p>If you have already submitted your log, please disregard this reminder.</p>
          <p>Best regards,<br>Course Management System</p>
        `;

        const result = await sendEmail(facilitator.email, subject, html);
        console.log('Reminder sent to facilitator:', result);
      }
    } catch (error) {
      console.error('Error sending reminder to facilitator:', error);
    }
  }

  // Send overdue notification to manager
  async sendOverdueNotification(notification) {
    try {
      const { facilitatorId, courseOfferingId, weekNumber, daysOverdue } = notification;
      
      const facilitator = await db.Facilitator.findByPk(facilitatorId);
      const courseOffering = await db.CourseOffering.findByPk(courseOfferingId, {
        include: [
          { model: db.Module, as: 'module' },
          { model: db.Class, as: 'class' }
        ]
      });

      if (facilitator && courseOffering) {
        const subject = 'URGENT: Overdue Activity Log - Course Management Platform';
        const html = `
          <h2>Overdue Activity Log Alert</h2>
          <p>Hello Manager,</p>
          <p>A facilitator has not submitted their weekly activity log and it is now overdue:</p>
          <ul>
            <li><strong>Facilitator:</strong> ${facilitator.name}</li>
            <li><strong>Email:</strong> ${facilitator.email}</li>
            <li><strong>Module:</strong> ${courseOffering.module.name}</li>
            <li><strong>Class:</strong> ${courseOffering.class.name}</li>
            <li><strong>Week:</strong> ${weekNumber}</li>
            <li><strong>Days Overdue:</strong> ${daysOverdue}</li>
          </ul>
          <p>Please follow up with the facilitator immediately.</p>
          <p>Best regards,<br>Course Management System</p>
        `;

        const result = await sendEmail('y.molumo@alustudent.com', subject, html);
        console.log('Overdue notification sent to manager:', result);
      }
    } catch (error) {
      console.error('Error sending overdue notification:', error);
    }
  }

  // Check for overdue logs and send notifications
  async checkOverdueLogs() {
    try {
      const currentDate = new Date();
      const weekDeadline = moment().subtract(7, 'days').toDate();

      // Find course offerings that should have activity logs
      const courseOfferings = await db.CourseOffering.findAll({
        where: { status: 'active' },
        include: [
          { model: db.Facilitator, as: 'facilitator' },
          { model: db.Module, as: 'module' },
          { model: db.Class, as: 'class' }
        ]
      });

      for (const offering of courseOfferings) {
        // Check for missing logs for the current week
        const currentWeek = moment().week();
        
        const existingLog = await db.ActivityTracker.findOne({
          where: {
            allocationId: offering.id,
            weekNumber: currentWeek
          }
        });

        if (!existingLog) {
          // Send reminder to facilitator
          await this.addToQueue({
            type: 'reminder_facilitator',
            facilitatorId: offering.facilitator.id,
            courseOfferingId: offering.id,
            weekNumber: currentWeek,
            deadline: moment().endOf('week').toDate()
          });

          // Check if it's overdue (more than 7 days)
          const daysSinceWeekStart = moment().diff(moment().startOf('week'), 'days');
          if (daysSinceWeekStart > 7) {
            await this.addToQueue({
              type: 'overdue_notification',
              facilitatorId: offering.facilitator.id,
              courseOfferingId: offering.id,
              weekNumber: currentWeek,
              daysOverdue: daysSinceWeekStart - 7
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking overdue logs:', error);
    }
  }

  // Start the notification processing
  startProcessing() {
    console.log('Starting notification processing...');
    this.processNotifications();
    
    // Check for overdue logs every hour
    setInterval(() => {
      this.checkOverdueLogs();
    }, 60 * 60 * 1000); // 1 hour
  }
}

module.exports = new NotificationService(); 