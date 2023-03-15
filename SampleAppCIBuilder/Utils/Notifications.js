import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';
import * as storage from './Storage.js'

class Notifications {
  constructor() {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        // console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        //    // process the notification
        if(notification.action === "ReplyInput"){
          console.log("Notification reply message is===>", notification.reply_text);// this will contain the inline reply text. 
          alert("notification response received, Implement your post response actions here..!!!");
        }else{
        alert("notification clicked, Implement your post click actions here..!!!");
        }
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      onAction:function(notification){
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);
        if(notification.action === "ReplyInput"){
          console.log("Notification reply message is===>", notification.reply_text)// this will contain the inline reply text. 
        }
      },
      popInitialNotification: true,
      requestPermissions: true,
      requestPermissions: Platform.OS === 'ios',
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: false,
        sound: false,
      },
    });

    // PushNotification.createChannel(
    //   {
    //     channelId: 'Notifications', // (required)
    //     channelName: 'Task Reminder Notifications', // (required)
    //     channelDescription: 'Reminder for any tasks',
    //   },
    //   () => {},
    // );
    PushNotification.createChannel(
      {
        channelId: 'Notifications', // (required)
        channelName: 'Task Reminder Notifications', // (required)
        channelDescription: 'Reminder for any tasks',
      },
      (created) => {
        console.log(`createChannel returned '${created}'`);
      },
    );
    PushNotification.getScheduledLocalNotifications(rn => {
      console.log('SN --- ', rn);
    });

    messaging().onMessage(async(remoteMessage)=>{
      PushNotification.localNotification({
        channelId: true,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        vibrate: true,
        smallIcon: remoteMessage.notification.android.imageUrl,
      });
    });
  }

  schduleNotification(JsonObject) {
    console.log("data====>",JsonObject.date);
    PushNotification.localNotificationSchedule({
      channelId: JsonObject.channelId,
      title: JsonObject.title,
      message: JsonObject.message,
      date: JsonObject.date,
    });
  }
  //Actions Notifications
  actionNotification(JsonObject){
    console.log("data====>",JsonObject.date);
  PushNotification.localNotificationSchedule({
    channelId: JsonObject.channelId,
    title: JsonObject.title,
    message: JsonObject.message,
    date: JsonObject.date, // in 60 secs
    actions: ["ReplyInput"],
    reply_placeholder_text: "Write your response...", // (required)
    reply_button_text: "Reply", // (required)
  }); 
}
  //get FCM Token
  checkToken= async()=>{
    console.log("token api called");
    const fcmToken = await messaging().getToken();
    if(fcmToken){
      await storage.storeDeviceToken("deviceIdentifier",fcmToken);
      return fcmToken;
    }
   }
  //Subscribe to topics
  subscribeTopic = async (topic) => {
    messaging()
      .subscribeToTopic(topic)
      .then(() => {console.log("Subscribed to topic:", topic);
      alert("Successfully Subscribed to topics");})
      .catch((e) => {
        console.log(e);
      });
  };

}

export default new Notifications();