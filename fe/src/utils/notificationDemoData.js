// Demo notification data for testing the enhanced UI
export const generateDemoNotifications = () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 1,
      title: "Order #12345 has been approved",
      message: "Your stationery order request has been approved by the admin. The requested items have been allocated and are ready for collection from the stationery room.",
      type: "order",
      priority: "high",
      read: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      metadata: {
        "Order ID": "#12345",
        "Total Items": "15",
        "Department": "IT Department",
        "Status": "Ready for collection"
      }
    },
    {
      id: 2,
      title: "System maintenance scheduled",
      message: "The stationery management system will undergo scheduled maintenance this weekend from 2:00 AM to 6:00 AM. During this time, the system will be temporarily unavailable.",
      type: "system",
      priority: "medium",
      read: false,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      metadata: {
        "Maintenance Window": "Saturday 2:00 AM - 6:00 AM",
        "Expected Downtime": "4 hours",
        "Affected Services": "All system features"
      }
    },
    {
      id: 3,
      title: "Monthly usage report reminder",
      message: "This is a friendly reminder to submit your monthly stationery usage report by the end of this week. The report helps us optimize inventory management.",
      type: "system",
      priority: "medium",
      read: false,
      createdAt: yesterday.toISOString(),
      metadata: {
        "Due Date": "End of this week",
        "Report Type": "Monthly usage report",
        "Department": "All departments"
      }
    },
    {
      id: 4,
      title: "Order #12346 has been submitted",
      message: "Your stationery order request has been submitted successfully and is pending admin approval. You will be notified once the order is processed.",
      type: "order",
      priority: "normal",
      read: true,
      createdAt: yesterday.toISOString(),
      readAt: new Date(yesterday.getTime() + 1 * 60 * 60 * 1000).toISOString(),
      metadata: {
        "Order ID": "#12346",
        "Total Items": "8",
        "Department": "HR Department",
        "Status": "Pending approval"
      }
    },
    {
      id: 5,
      title: "System backup completed",
      message: "The scheduled system backup has been completed successfully. All data has been securely backed up and verified.",
      type: "system",
      priority: "low",
      read: true,
      createdAt: lastWeek.toISOString(),
      readAt: new Date(lastWeek.getTime() + 1 * 60 * 60 * 1000).toISOString(),
      metadata: {
        "Backup Date": "Last week",
        "Status": "Completed successfully",
        "Data Verified": "Yes"
      }
    }
  ];
};

// Function to add demo notifications to existing notifications
export const addDemoNotifications = (existingNotifications = []) => {
  const demoNotifications = generateDemoNotifications();
  
  // Only add demo notifications if there are fewer than 3 existing notifications
  if (existingNotifications.length < 3) {
    return [...demoNotifications, ...existingNotifications];
  }
  
  return existingNotifications;
};