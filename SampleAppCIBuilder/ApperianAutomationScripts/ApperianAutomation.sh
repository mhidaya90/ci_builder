#!/usr/bin/bash
            ###############################################################
            ## Script      :: Deploy to Apperian                         ##                                      ##
            ## Description :: deploy mobile apps(iOS/Android) versions   ##
            ##                to cgl mcoe, uat, prod apperian accounts   ##
            ## Author      :: Mobile Platform Team                       ##
            ## Version     :: 1.0.0                                      ##
            ## Date        :: 27/02/2023                                 ##
            ###############################################################

function deploy_app(){
apiToken=$1 ## Passed from VSTS as argument
appName=$2 ## Passed from VSTS as argument
buildVersion=$3 ## Passed from VSTS as an argument
appType=$4 # passed from VSTS as an argument
versionNotes=$5  ## Passed as an argument from VSTS release maanagement
appBrand="" ## The branding string passed from VSTS as argument, the custom metadata Branding value

IFS='_' read -ra appVersion <<< "$buildVersion"

applicationType=""
# Set the Application type
case $appType in 
    "apk")
        #applicationType="Android App (APK File)"
        applicationType="application/vnd.android.package-archive"
        ;;    
    "ipa")
        #applicationType="iOS App (IPA File)"
        applicationType="application/itunes+zip"
        ;;
    esac
    
echo
echo "==== Updating the application:" $appName " =============================="    
# Print / Display all the variables
echo "App Name: "$appName
echo "Application binary Path: "$BITRISE_DEPLOY_DIR
echo "Build Version: "$buildVersion
echo "App Version: "$appVersion
echo "App Type: "$appType
echo "Application Type description: "$applicationType
echo "Version Notes: "$versionNotes
echo "Branding: "$appBrand
    
echo
echo "==== Send the request to retrieve the list of apps ======================"
echo
## Update application - get the list of apps Published on the Store

## clean the Get app list results
rm -f apps.json

response=$(curl --silent -w '%{http_code}' -X GET https://na01ws.apperian.com/v2/applications --header "X-TOKEN: "$apiToken -o apps.json)
#echo $response

if [ "$response" == "200" ] && [ -s apps.json ]
then
    if [ "$(jq '. | has("error")' apps.json)" == "true" ]
    then
        echo "Could not get the Applications details - Error returned from server - Aborting"
        echo "Error Code:"$(jq .error.code apps.json)
        echo "Error Message:"$(jq .error.message apps.json)
        exit 1
    else
        echo
        echo "Successfuly received the response from EASE with the Application details"
        ## retrieve the App ID for the required application to be updated
        
        if [ "$appBrand" == "" ]
        then
            appID=$(cat apps.json | jq -r ".applications[] | select(.version.app_name == \"$appName\") | select(.version.install_file.mime == \"$applicationType\") | .id")
        else
            appID=$(cat apps.json | jq -r ".applications[] | select(.version.app_name == \"$appName\") | select(.version.install_file.mime == \"$applicationType\") | select(.version.custom_metadata.Branding ==\"$appBrand\") | .id")
        fi
        credentialID=$(cat apps.json | jq -r ".applications[] | select(.id == \"$appID\")| .version.install_file.sign_credentials_id" )
        echo "AppID:"$appID
        echo "credentialID:"$credentialID
        echo
    fi
else
    echo "Could not get the Appliction details from the server - Error returned from server - Aborting"
    echo
    exit 1
fi

## Send the update request and retrieve the uploadURL and the TransactionID
#clear the response
rm -f response.json 
echo "==== Send the Update request to retrieve the file upload URL and the TransactionID ====="
response=$(curl --silent -w '%{http_code}' -H "Content-Type: application/js" -X POST -d '{"id": 1, "apiVersion": "1.0", "method": "com.apperian.eas.apps.update", "params": {"appID": '\"$appID\"', "token": '\"$apiToken\"'}, "jsonrpc": "2.0"}' https://easesvc.apperian.com/ease.interface.php -o response.json)
#echo $response

if [ "$response" == "200" ] && [ -s response.json ]
then
    if [ "$(jq '. | has("error")' response.json)" == "true" ]
    then
        echo "Could not get the TransacgionID and the upload URL - No Response from server - Aborting"
        echo "Error Code:"$(jq -r .error.code response.json)
        echo "Error Message:"$(jq -r .error.message response.json)
        echo "Error Details:"$(jq -r .error.data.detailedMessage response.json)
        exit 1
    else
        echo
        echo "Successfully completed the update request and received the upload URL and the TransactionID"
        #The transactionID
        transactionID=$(cat response.json | jq -r .result.transactionID)
        echo "TransactionID:"$transactionID
    
        #The fileUploadURL
        fileUploadURL=$(cat response.json | jq -r .result.fileUploadURL)
        echo "fileUploadURL:"$fileUploadURL
        echo
    fi
else
    echo "Could not get the TransacgionID and the upload URL - No Response from server - Aborting"
    echo
    exit 1
fi

##Look for the IPA/APK file
filenames=`ls $BITRISE_DEPLOY_DIR/*.$appType`
if [ "$filenames" == "" ]
then echo "No files found - Aborting"
exit 1
fi
count=0
for eachfile in $filenames
do
   #echo $eachfile
   count=$((count++))
   if [ "$count" -ge 1 ]
   then echo "Redundant IPA/APK files in the path - Aborting..."
   exit 1
   else
   filePath=$eachfile
   fi
done

echo "==== Upload the binary file  ============================"
rm -f response.json
curl --progress-bar --form "LUuploadFile=@"$filePath $fileUploadURL | tee /dev/null -o response.json
echo "==== Upload completed ==================================="

if [ "$response" == "200" ] && [ -s response.json ]
then
    if [ "$(jq '. | has("error")' response.json)" == "true" ]
    then
        echo "The upload failed - Could not get the fileID -Aborting"
        echo "Error Code:"$(jq .error.code response.json)
        echo "Error Message:"$(jq .error.message response.json)
        exit 1
    else
        echo
        echo "Successfully uploaded the App bianry (APK/IPA) file and received the fileID"
        #The fileID
        fileID=$(cat response.json | jq -r .fileID)
        echo "fileID:"$fileID
        echo
    fi
else
    echo "The upload failed - Could not get the fileID -Aborting"
    echo
    exit 1
fi

echo "==== Publish the App =================================="

#clear the response
rm -f response.json
echo "Send the Publish app request"
response=$(curl --silent -w '%{http_code}' -H "Content-Type: application/js" -X POST -d '{"id": 1, "apiVersion": "1.0", "method": "com.apperian.eas.apps.publish", "params": {"EASEmetadata" :  { "name" : '\""$appName"\"', "version" : '\"$appVersion\"', "versionNotes" : '\""$versionNotes"\"'}, "files" :  { "application" : '\"$fileID\"'}, "token" : '\"$apiToken\"', "transactionID" : '\"$transactionID\"'}, "jsonrpc": "2.0"}' https://easesvc.apperian.com/ease.interface.php -o response.json)
#echo $response

if [ "$response" == "200" ] && [ -s response.json ]
then
    if [ "$(jq '. | has("error")' response.json)" == "true" ]
    then
        echo "Publishing the app failed - Aborting"
        echo "Error Code:"$(jq .error.code response.json)
        echo "Error Message:"$(jq .error.message response.json)
        exit 1
    else
        echo
        echo "Successfully published the app to EASE"
        #The ApplicationID
        applicationID=$(cat response.json | jq -r .result.appID)
        echo "applicationID:"$applicationID
        echo
    fi
else
    echo "Publishing the app failed - Aborting"
    echo
    exit 1
fi
echo "==== Sucessfully Published the app ========================="

echo “=====Applying Policy to the app===========================”
echo
rm -f response.json

response=$(curl --silent -w '%{http_code}' -H "Content-Type: application/json" -X POST https://na01ws.apperian.com/v2/applications/$appID/policies --header "X-TOKEN: "$apiToken -d '{"configurations":[{"policy_id": "com.apperian.app-usage"},{"policy_id": "com.apperian.collect-crash-reports"},{"policy_id": "com.apperian.self-update"},{"policy_id": "com.apperian.data-wipe"},{"policy_id": "com.apperian.jailbreak-and-root-protection"}]}' -o response.json)
echo $response
echo $(cat response.json)
if [ "$response" == "200" ] || [ "$response" == "202" ]
then
        echo "Applying Policies .... "
        #Status
        status="APPLYING POLICIES"
        echo "Applying Policy Status:"$status
        echo
        while [ "$status" == "APPLYING POLICIES" ]
        do
            echo "Policy Status:"$status
            echo "Wait for Policies to be applied......"
            sleep 15
            rm -f signing.json
            response=$(curl --silent -w '%{http_code}' -X GET https://na01ws.apperian.com/v2/applications/$appID/policies/ --header "X-TOKEN: "$apiToken -o policy.json)

            #echo $response
            status=$(cat policy.json | jq -r .status.description)
        done    
        echo "Application is :"$status
else
    echo "Policy Applied Failed - Aborting"
    echo
    exit 1
fi

echo "============Policy Applied Successfully===================="

echo "========== Sign the  app ==================================="
echo
rm -f response.json
response=$(curl --silent -w '%{http_code}' -X PUT https://na01ws.apperian.com/v1/applications/$appID/credentials/$credentialID  --header "Content-Type: application/json" --header "X-TOKEN: "$apiToken -o response.json)
echo $response
echo $(cat response.json)

if [ "$response" == "200" ] && [ -s response.json ]
then
    if [ "$(jq '. | has("error")' response.json)" == "true" ]
    then
        echo "App Signing Failed - Aborting"
        echo "Error Code:"$(jq .error.code response.json)
        echo "Error Message:"$(jq .error.message response.json)
        exit 1
    else
        echo
        echo "Signing in progress .... "
        #Status
        status=$(cat response.json | jq -r .signing_status)
        echo "Signing Status:"$status
        echo
        while [ "$status" == "in_progress" ]
        do
            echo "Signing Status:"$status
            echo "Wait for application to be signed......"
            sleep 15
            rm -f signing.json
            response=$(curl --silent -w '%{http_code}' -X GET https://na01ws.apperian.com/v2/applications/$appID --header "X-TOKEN: "$apiToken -o signing.json)
            #echo $response
            status=$(cat signing.json | jq -r .application.version.signing_status)
        done    
        echo "Application is :"$status
    fi
else
    echo "App Signing Failed - Aborting"
    echo
    exit 1
fi

echo "==== Enable the iOS app ===================================="
echo
#clear the response
rm -f response.json
echo "Enable the App"
response=$(curl --silent -w '%{http_code}' -X PUT https://na01ws.apperian.com/v1/applications/$appID --data '{"enabled": true}' --header "Content-Type: application/json" --header "X-TOKEN: "$apiToken -o response.json)
#echo $response

if [ "$response" == "200" ] && [ -s response.json ]
then
    if [ "$(jq '. | has("error")' response.json)" == "true" ]
    then
        echo "Failed to enable app - Aborting"
        echo "Error Code:"$(jq .error.code response.json)
        echo "Error Message:"$(jq .error.message response.json)
        exit 1
    else
        #status
        status=$(cat response.json | jq -r .update_application_result)
        if [ $status == "true" ]
        then
            echo
            echo "The App is enabled succesfully"
            echo "Status:"$status
            echo
        else
            echo "Failed to enable app - Aborting"
            echo 
            exit 1
        fi
    fi
else
    echo "Failed to enable app - Aborting"
    echo
    exit 1
fi

## clean the temp files
rm -f apps.json
rm -f credentials.json
rm -f signing.json
rm -f response.json
rm -rf policy.json

echo "==== The application:" $appName" successfully published and enabled ====="
echo

}


deploy_app "<Apperian token configure in secrets>" "<Application Name>" "<version>" "apk/ipa" "<version notes>"
