**Why we need a Keychain?**
By default, React-Native does not come bundled with any method of storing secure data.

Keep in mind not to store sensitive data or Keys in your app codebase. Anything included in the codebase could be accessed in plain text by inspecting the app bundle.

But, there are two separate existing solutions for Android and iOS, which are,

_iOS Keychain service_
_Android Secure Shared Preferences_
To use these two services, either you can write a bridge by yourself or more quickly you can use libraries. There are three standard libraries developers use, which are _react-native-keychain_, _react-native-secure-storage_, and _react-native-sensitive-info_

**Installing packages**
npm i react-native-keychain

If you are using React-Native version 0.59 or less, run the following command, it will link your library with React-Native.

react-native link react-native-keychain

**Save credentials**
async function setCredentials(key,value) {
    try {
	return await Keychain.setGenericPassword(key ,value);

     // Congrats! You've just stored your credentials!
    } catch (err) {
        console.log('status:Could not save credentials,' + err);
    }
}

**Retrieve Credentials**
async function getCredentials() {
    try {
	const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return credentials;
    } 
    }catch (error) {
    console.log('Keychain couldn\'t be accessed!', error);
  }
}

**Remove credentials**
async function getCredentials() {
    try {
	return await Keychain.resetGenericPassword();
    }catch (error) {
    console.log('Keychain couldn\'t be accessed!', error);
  }
}


**Understanding the risks with Keychain**
However, there is one common pitfall in the React-Native Keychain when it comes to Android development.
Shared Preferences are not 100% secure. It is safe for storing your data but not recommended for storing key-value pairs.
Shared Preferences are stored in a file, and if the developer roots the phone and manages to mount its file system, anyone can read the preferences. Using Conceal is the standard answer. It handles the encryption and decryption of what is stored on rooted devices, But still, data will not be 100% secret because the key is present locally.

Furthermore, The SharedPrefsBackedKeyChain is used in data encryption. The method is storing 256-bit encryption keys in the SharedPreferences on the device. The issue is the encryption key and encrypted data are stored in the same place. However, encryption becomes pointless.
However, on newer devices, all the encryption keys are stored on the hardware level, not inside the app itself, which increased the protection.

**Benefits of using react-native-keychain**
One library to access both iOS Keychain and Android Keystore in React-Native apps.
There are many reasons why react-native-keychain is the most popular library. Let us look at some significant pros.

1.The device must be unlocked to access the Keychain.
2.The Keychain cannot be restored to a different device.
3.In never devices, the encryption keys are stored on the hardware level.

**Conclusion**
Based on my experience, using a react-native-keychain is the best option to store credentials in React-Native mobile apps. As I can see, the main advantage is that the usage of the existing iOS Keychain and Android shared preferences under the hood.