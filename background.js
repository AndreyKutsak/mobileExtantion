// background.js

// Function to send a push notification
function sendNotification() {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Notification Title",
        message: "Notification Message"
    });
}

// Trigger the notification (this can be done based on events or user actions)

setInterval(() => {
    sendNotification();
}, 5000)