**React Native Encrypted Storage** <br />
React Native wrapper around SharedPreferences and Keychain to provide a secure alternative to Async Storage.

**Why ?** <br />
Async Storage is great but it lacks security. This is less than ideal when storing sensitive data such as access tokens, payment information and so on. This module aims to solve this problem by providing a wrapper around Android's EncryptedSharedPreferences and iOS' Keychain, complete with support for TypeScript.

**Version Requirements** <br />
Android API 21+ (5.0)
iOS 2.0 <br />
**Installation** <br />
**Via yarn** <br />
$ yarn add react-native-encrypted-storage <br />
**Via npm** <br />
$ npm install react-native-encrypted-storage <br />
**Linking** <br />
React Native 0.60+ <br />
Since version 0.60, React Native supports auto linking. This means no additional step is needed on your end. <br />

React Native <= 0.59 <br />
$ react-native link react-native-encrypted-storage <br />
Special note for iOS using cocoapods, run: <br />
$ npx pod-install <br />
**Usage** <br />
This module exposes four (4) native functions to store, retrieve, remove and clear values. They can be used like so: <br />
**Import** <br />
import EncryptedStorage from 'react-native-encrypted-storage'; <br />
**Storing a value** <br />
async function storeUserSession() { <br />
    try { <br />
        await EncryptedStorage.setItem(
            "user_session",
            JSON.stringify({
                age : 21,
                token : "ACCESS_TOKEN",
                username : "emeraldsanto",
                languages : ["fr", "en", "de"]
            })
        ); <br />
        // Congrats! You've just stored your user session!
    } catch (error) { <br />
        // There was an error on the native side <br />
    } <br />
} <br />
**Retrieving a value** <br />
async function retrieveUserSession() { <br />
    try {    <br />
        const session = await EncryptedStorage.getItem("user_session"); <br />
        if (session !== undefined) { <br />
            // Congrats! You've just retrieved your user session! <br />
        } <br />
    } catch (error) { <br />
        // There was an error on the native side <br />
    } <br />
} <br />
**Removing a value** <br />
async function removeUserSession() { <br />
    try { <br />
        await EncryptedStorage.removeItem("user_session"); <br />
        // Congrats! You've just removed your first value! <br />
    } catch (error) { <br />
        // There was an error on the native side <br />
    } <br />
} <br />
**Clearing all previously saved values** <br />
async function clearStorage() { <br />
    try { <br />
        await EncryptedStorage.clear(); <br />
        // Congrats! You've just cleared the device storage! <br />
    } catch (error) { <br />
        // There was an error on the native side <br />
    } <br />
} <br />
**Error handling** <br />
Take the removeItem example, an error can occur when trying to remove a value which does not exist, or for any other reason. This module forwards the native iOS Security framework error codes to help with debugging. <br />

async function removeUserSession() { <br />
    try { <br />
        await EncryptedStorage.removeItem("user_session"); <br />
    } catch (error) { <br />
        // There was an error on the native side <br />
        // You can find out more about this error by using the `error.code` property <br />
        console.log(error.code); // ex: -25300 (errSecItemNotFound) <br />
    } <br />
} <br />
**Note regarding _Keychain_ persistence** <br />
You'll notice that the iOS Keychain is not cleared when your app is uninstalled, this is the expected behaviour. However, if you do want to achieve a different behaviour, you can use the below snippet to clear the Keychain on the first launch of your app.

// AppDelegate.m

/**
 Deletes all Keychain items accessible by this app if this is the first time the user launches the app
 */
static void ClearKeychainIfNecessary() {
    // Checks wether or not this is the first time the app is run
    if ([[NSUserDefaults standardUserDefaults] boolForKey:@"HAS_RUN_BEFORE"] == NO) {
        // Set the appropriate value so we don't clear next time the app is launched
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"HAS_RUN_BEFORE"];

        NSArray *secItemClasses = @[
            (__bridge id)kSecClassGenericPassword,
            (__bridge id)kSecClassInternetPassword,
            (__bridge id)kSecClassCertificate,
            (__bridge id)kSecClassKey,
            (__bridge id)kSecClassIdentity
        ];

        // Maps through all Keychain classes and deletes all items that match
        for (id secItemClass in secItemClasses) {
            NSDictionary *spec = @{(__bridge id)kSecClass: secItemClass};
            SecItemDelete((__bridge CFDictionaryRef)spec);
        }
    }
}

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // Add this line to call the above function
    ClearKeychainIfNecessary();

    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"APP_NAME" initialProperties:nil];

    rootView.backgroundColor = [UIColor colorWithRed:1.0f green:1.0f blue:1.0f alpha:1];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;

    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];

    return YES;
}

// ...

@end <br />
**Limitations** <br />
There seems to be some confusion around the maximum size of items that can be stored, especially on iOS. According to this StackOverflow question, the actual Keychain limit is much lower than what it should theoretically be. This does not affect Android as the EncryptedSharedPreferences API relies on the phone's storage, via XML files.
