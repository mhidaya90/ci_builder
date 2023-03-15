import SecureStore from 'expo-secure-store';
import Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';

//SecureStore = require('expo-secure-store');
//Keychain = require('react-native-keychain');
//EncryptedStorage = require('react-native-encrypted-storage');

//Storing a value to Expo Secure Store
export async function setItem(key, value) {
	try{
	   return await SecureStore.setItemAsync(key, value);
	}catch (error){
	  console.log();
	}
}

//Retrieveing a value from Expo Secure Store
export async function getItem(key) {
	try{
  	   let result = await SecureStore.getItemAsync(key);
  	   if (result) {
    		return result;
  	   } else {
    		console.log('No values stored under that key.');
  	   }
	}catch (error){
		console.log(error);
	}
}

//Storing a value to Keychain
export async function setCredentials(key,value) {
    try {
	return await Keychain.setGenericPassword(key ,value);
    } catch (err) {
        console.log('status:Could not save credentials,' + err);
    }
}

//Retrieveing a value from Keychain
export async function getCredentials() {
    try {
	const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return credentials.password;
    } else {
      alert("No credentials stored");
    }
    }catch (error) {
    console.log('Keychain couldn\'t be accessed!', error);
  }
}

//Removing a value from Keychain
export async function removeCredentials() {
    try {
	return await Keychain.resetGenericPassword();
    }catch (error) {
    console.log('Keychain couldn\'t be accessed!', error);
  }
}

//Storing a value in Encrypted Storage
export async function storeUserSession(inputValue) {
    try {
	console.log('Hidaya Input Value is---->',inputValue);
        await EncryptedStorage.setItem(
            "user_session",
            JSON.stringify(inputValue)
        );
	return 'SUCCESS';
    } catch (error) {
	console.log('Encrypted Storage couldn\'t be accessed!', error);
    }
}

//Retrieveing a value in Encrypted Storage
export async function retrieveUserSession() {
    try {   
        const session = await EncryptedStorage.getItem("user_session");
    
        if (session !== undefined) {
           return session;
        }else{
           return 'No User Session Stored'
	}
    } catch (error) {
	console.log('Encrypted Storage couldn\'t be accessed!', error);
    }
}

//Removing a value in Encrypted Storage
export async function removeUserSession() {
    try {
        await EncryptedStorage.removeItem("user_session");
	return 'SUCCESS';
    } catch (error) {
	console.log('Encrypted Storage couldn\'t be accessed!', error);
    }
}

//Clearing a value in Encrypted Storage
export async function clearStorage() {
    try {
        await EncryptedStorage.clear();
    } catch (error) {
        console.log('Encrypted Storage couldn\'t be accessed!', error);
    }
}
