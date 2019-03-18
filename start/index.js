var control = require("./control");

exports.handler = (event, context, callback) => {
    if (event.headers.interactionType == undefined) {
        console.log('Error', ' InteractionType is not defined ');
        const errorInteractionType = `InteractionType is not defined: ${interactionType}`;
        callback(new Error(errorInteractionType));
    } else {
        var interactionType = event.headers.interactionType;
        console.log('EVENT', interactionType + ` : ${JSON.stringify(event)}`);
    }

    switch (interactionType) {
        case 'discoveryRequest':
            handleDiscoveryRequest(event, callback);
            break;
        case 'stateRefreshRequest':
            handlestateRefreshRequest(event, callback);
            break;
        case 'commandRequest':
            handlecommandRequest(event, callback);
            break;
        case 'Callback':
            handleCallback(event, callback);
            break;
        case 'grantCallbackAccess':
            handleGrantCallbackAccess(event, callback);
            break;
        case 'accessTokenRequest':
            handleAccessTokenRequest(event, callback);
            break;
        case 'refreshAccessTokens':
            handleRefreshAccesstoken(event, callback);
            break;
        default:
            {
                const errorMsg = `No supported InteractionType: ${interactionType}`;
                console.log('ERROR', errorMsg);
                calback(new Error(errorMsg));
            }
    }
};


function handleDiscoveryRequest(event, endOfDiscovery) {
    if(event.authentication.token.trim() == undefined) {
        console.log('ERROR', 'ACCESSTOKEN : ' + event);
        const errorMessage1 = `Access token is not defined: ${event.headers.authentication}`;
        endOfDiscovery(errorMessage1, errorMessage1);
    } else {
        const AccessToken = event.authentication.token.trim();
        control.getUserId(AccessToken, gotUserId);
    }

    function gotUserId(err, userId) {
        if(err) {
            console.log("error", 'USER ID: '+ err);
            endOfDiscovery(err, error);
        } else {
            if(userId != undefined && userId) {
                var uniqueId = "us-east-1:"+userId;
                console.log('Data UNIQ User ID : ', uniqueId);
                control.getDevicesFromTable(uniqueId, event, gotUserDevices);
            } else {
                const errorUserId = `USER ID is undefined : ${userId}`;
                console.log('ERROR', userId);
                endOfDiscovery(errorUserId, errorUserId);
            }
        }
    }

    function gotUserDevices(err, deviceData) {
        if(err) {
            console.log("Error", err);
            endOfDiscovery(err, err);
        } else {
            // console.log("device Data :", deviceData);
            endOfDiscovery(null, deviceData);
        }
    }
}

function handlestateRefreshRequest(event, endOfReport) {
    // console.log("handlesateRefreshRequest :",JSON.stringify(event));
    if(event.authentication.token.trim() == undefined) {
        console.log("ERROR", 'ACCESSTOKEN : ' + event);
        const errorMsg1 = `Access token is not defined: ${event.authentication.token}`;
        endOfReport(null, errorMsg1);
    } else {
        const AccessToken = event.authentication.token.trim();
        control.getUserId(AccessToken, gotUserId);
    }
    function gotUserId(err, userId) {
        if(err) {
            console.log("error", 'USER ID: '+ err);
            endOfReport(null, error);
        } else {
            if(userId != undefined && userId) {
                var uniqueId ="us-east-1:" + userId;
                console.log('DATA', 'UNIQ USER ID : ' + uniqueId);
                // console.log("devices :",JSON.stringify(control.getDevicesFromTable(unique, requestId)));
                control.getRefreshDevicesFromTable(uniqueId, gotUserDevices);
                // console.log("gotUserDevices :", JSON.stringify(gotUserDevices));
            } else {
                const errorUserId = `USER ID is undefined : ${userId}`;
                console.log('ERROR', userId);
                endOfReport(errorUserId, errorUserId);
            }

        }
    }

    function gotUserDevices(err, response) {
        if(err) {
            console.log("ERROR",err);
            endOfReport(err,err)
        } else {
            // console.log("Data :", JSON.stringify(response));
            var device = [];
            var thing = [];
            var index = [];
            var name = [];
            var responseData = [];
            for(var i =0;i<response.length-1;i++) {
                device.push(Object.keys(response[i + 1].thing)[0]),
                thing.push(Object.values(response[i + 1].thing)[0].thing),
                index.push(response[i+1].index),
                name.push(response[i+1].name),
                responseData.push(response[i+1].data)
            }
            // console.log("userdata : ", responseData,device,thing,name,index)
            control.getReportState(event,responseData,device,thing,name,index,gotReportState);
        }
    }

    function gotReportState(err, response) {
        console.log('ReportState','Response : ' + JSON.stringify(response));
        endOfReport(null, response);
    }
}

function handlecommandRequest(event, endOfControl) {
    var uniqueUserId;
    if(event.authentication.token.trim() == undefined) {
        console.log("ERROR",'ACCESSTOKEN : ' + event);
        const errorMsg1 = `Access token is not defined: ${event.authentication}`;
        endOfControl(null, errorMsg1);
    } else {
        const userAccessToken = event.authentication.token.trim();
        console.log("DATA",'Access Token : ' + userAccessToken);
        uniqueUserId = event.devices[0].deviceCookie.userId;
        control.validateUser(event.devices[0].deviceCookie, uniqueUserId, userValidation);
    }

    function userValidation(err,response) {
        if(response.err == 0) {
            console.log("response :", JSON.stringify(response));
            control.controlDevices(event, gotControlShadow);
        } else {
            console.log('ERROR', 'USER VALIDATION : ' + JSON.stringify(response), 'Error is :',err);
            endOfControl(null,response);
        }
    }
    function gotControlShadow(err, response) {
        console.log('Control', 'Response : ' + JSON.stringify(response));
        endOfControl(null, response);
    }
}