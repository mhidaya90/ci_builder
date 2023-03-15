import EncryptedStorage from 'react-native-encrypted-storage';

//Storing a value in Encrypted Storage
export async function storeDeviceToken(Identifier,Value) {
    try {
	console.log('Hidaya Input Value is---->',Value);
        await EncryptedStorage.setItem(
            Identifier,
            Value
        );
	return 'SUCCESS';
    } catch (error) {
	console.log('Encrypted Storage couldn\'t be accessed!', error);
    }
}

//Retrieveing a value in Encrypted Storage
export async function retrieveDeviceToken(Identifier) {
    try {   
        const deviceToken = await EncryptedStorage.getItem(Identifier);
    console.log("token calling form stargae class==",deviceToken);
        if (deviceToken !== undefined) {
           return deviceToken;
        }else{
           return 'No User Session Stored'
	}
    } catch (error) {
	console.log('Encrypted Storage couldn\'t be accessed!', error);
    }
}

//Removing a value in Encrypted Storage
export async function removeDeviceToken() {
    try {
        await EncryptedStorage.removeItem("token");
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
