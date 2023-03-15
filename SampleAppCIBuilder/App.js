import React, { useState, useEffect } from 'react';
import { Alert, Text, View, StyleSheet, TextInput, Button } from 'react-native';
import * as Utils from './components/Utils.js';

export default function App() {
  
async function saveSession(){
	try{
		const jsonData = '{age : 28,token : "ACCESS_TOKEN",username : "cargillUser",languages : ["fr", "en", "de"]}';
		let output = await Utils.storeUserSession(jsonData);
		console.log(output);
	}catch(error) {
		console.log(error);
	}
}
async function getSession(){
	try{
		const value = await Utils.retrieveUserSession();
		console.log(value);
	}catch(error) {
		console.log(error);
	}
}
async function removeSession(){
	try{
		const value = await Utils.removeUserSession();
		if(value == 'SUCCESS'){
			console.log('Successfully removed User session')
		}
	}catch(error) {
		console.log(error);
	}
}

return (
    <View style={styles.container}>
	<Text style={{ fontWeight: 'bold', color: 'green', fontSize: 16 }}>Secure Storage for Storing tokens and Session Details</Text>
	<View style={styles.parent}>
		<Button 
		title="Save User Session"
	        onPress={() => {saveSession();}}
		/>
	       <Button
		title="Retrieve User Session"
	        onPress={() => {getSession();}}
      		/>
		<Button
		title="Removing User Session"
        	onPress={() => {removeSession();}}
      		/>
	</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  parent: {
    flex: 0.3,
    flexDirection: "column",
    justifyContent: "space-around",
  },
});