const { query } = require('../config/db');

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    const unreadResult = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    return res.json({
      success: true,
      notifications,
      unread_count: unreadResult[0]?.count || 0
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching notifications.' });
  }
}

async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('markAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating notification.' });
  }
}

async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;

    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating notifications.' });
  }
}

async function deleteNotification(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    console.error('deleteNotification error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting notification.' });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
