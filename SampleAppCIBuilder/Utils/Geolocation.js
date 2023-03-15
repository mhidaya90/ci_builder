import RNLocation from 'react-native-location';
//import Geocoder from 'react-native-geocoding';
import GeoLocationModel from '../Model/GeoLocationModel';

    export async function getLocation(){
    let permission = await RNLocation.checkPermission({
      ios: 'whenInUse', // or 'always'
      android: {
        detail: 'coarse' // or 'fine'
      }
    });
  
    console.log("hidaya",permission)

    let location;
    if(!permission) {
      permission = await RNLocation.requestPermission({
        ios: "whenInUse",
        android: {
          detail: "coarse",
          rationale: {
            title: "We need to access your location",
            message: "We use your location to show where you are on the map",
            buttonPositive: "OK",
            buttonNegative: "Cancel"
          }
        }
      })
      console.log(permission)
      location = await RNLocation.getLatestLocation({timeout: 1000});
      GeoLocationModel.latitude = location.latitude;
      GeoLocationModel.longitude = location.longitude;
      GeoLocationModel.accuracy=location.accuracy;
      GeoLocationModel.altitude=location.altitude;
      GeoLocationModel.altitudeAccuracy =location.altitudeAccuracy
      GeoLocationModel.course=location.course;
      GeoLocationModel.courseAccuracy=location.courseAccuracy;
      GeoLocationModel.fromMockProvider=location.fromMockProvider;
      GeoLocationModel.speed=location.speed;
      GeoLocationModel.speedAccuracy=location.speedAccuracy;
      GeoLocationModel.timestamp=location.timestamp;
      console.log("Hidaya Model value is==>",GeoLocationModel.latitude);
      //return location;
      return GeoLocationModel;
    } else {
      location = await RNLocation.getLatestLocation({timeout: 1000});
      GeoLocationModel.latitude = location.latitude;
      GeoLocationModel.longitude = location.longitude;
      GeoLocationModel.accuracy=location.accuracy;
      GeoLocationModel.altitude=location.altitude;
      GeoLocationModel.altitudeAccuracy =location.altitudeAccuracy
      GeoLocationModel.course=location.course;
      GeoLocationModel.courseAccuracy=location.courseAccuracy;
      GeoLocationModel.fromMockProvider=location.fromMockProvider;
      GeoLocationModel.speed=location.speed;
      GeoLocationModel.speedAccuracy=location.speedAccuracy;
      GeoLocationModel.timestamp=location.timestamp;
      console.log("Hidaya Model value is==>",GeoLocationModel.latitude);
     // return location;
     return GeoLocationModel;
    }
  }