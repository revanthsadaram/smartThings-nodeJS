var AWS = require('aws-sdk');

const request = require('request');

AWS.config.update({
    region: 'us-east-1'
});
const config = {};
var dynamoDB = new AWS.DynamoDB({
    apiVersion: '2012-10-08'
});


module.exports = {

    callRequest: function(data, callback) {
        // console.log("request data :", data);
        request(data, function (err, res, body) {
            // console.log('DATA', 'BODY : ' + JSON.stringify(body));
            if(body == 'Unauthorized'){
                const err1 = 'Unauthorized';
                callback(err1, err1);
            }else{
                var json = JSON.parse(body);
                var userIdArray = json.sub.split("|");
                var userId = userIdArray[1];
                console.log('DATA', 'USER ID : ' + userId);
                callback(err, userId);
            }  
        });
    },

    callGetItem: function(params, callback) {
        dynamoDB.getItem(params, function(err, data) {
            if(err) {
                console.log('ERROR', 'Unable to get data from the  table. :' + params + ' ERR :' + err);
                callback(err,err);
            } else {
                callback(err, data);
            }
        });
    },

    getThingShadow: function (thing, callback) {
        config.IOT_BROKER_ENDPOINT = "a15bui8ebaqvjn.iot.us-east-1.amazonaws.com"; // also called the REST API endpoint
        config.IOT_BROKER_REGION = "us-east-1"; // eu-west-1 corresponds to the Ireland Region.  Use us-east-1 for the N. Virginia region
        config.IOT_THING_NAME = thing;
        AWS.config.region = config.IOT_BROKER_REGION;

        var iotData = new AWS.IotData({
            endpoint: config.IOT_BROKER_ENDPOINT
        });
        // console.log("iotData :", iotData);
        var paramsGet = {
            "thingName": config.IOT_THING_NAME /* required */
        };

        iotData.getThingShadow(paramsGet, function (err, data) {
            if (err) {
                // console.log("error form request :",err);
                callback(err,err);
            } else {
                // console.log("data form request :",JSON.stringify(data));
                callback(err,data);
            }
        });
    },
    
    putThingShadow: function (info, callback) {
        config.IOT_BROKER_ENDPOINT = "a15bui8ebaqvjn.iot.us-east-1.amazonaws.com"; // also called the REST API endpoint
        config.IOT_BROKER_REGION = "us-east-1"; // eu-west-1 corresponds to the Ireland Region.  Use us-east-1 for the N. Virginia region
        config.IOT_THING_NAME = info.thing;
        AWS.config.region = config.IOT_BROKER_REGION;

        var iotData = new AWS.IotData({
            endpoint: config.IOT_BROKER_ENDPOINT
        });

        var paramsUpdate = {
            thingName: config.IOT_THING_NAME,
            payload: JSON.stringify(info.data)
        };
        iotData.updateThingShadow(paramsUpdate, function (err, data) {
            if (err) {
                console.log(err);
                callback(err,err);
                // callback("not ok");
            } else {
                // console.log("puThing :", data);
                callback(err,data);
            }
        });
    }
}