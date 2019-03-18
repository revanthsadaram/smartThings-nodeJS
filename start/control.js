var requests = require("./request");
var utils = require("./utils");

module.exports = {
    getUserId: (accessToken, callback) => {
        let request = {
            method: "GET",
            url: "https://wozart.auth0.com/userinfo/",
            headers: {
                authorization: "Bearer " + accessToken
            }
        };
        // console.log("request :", request);
        requests.callRequest(request, function (err, userID) {
            // console.log(userID);
            callback(err, userID);
        });
    },

    getDevicesFromTable: function (ID, event, callback) {
        var rulesTable = "wozartaura-mobilehub-1863763842-Rules";
        var rulesparam = {
            TableName: rulesTable,
            Key: {
                userId: { S: ID }
            },
            ProjectionExpression: "Devices,Loads"
        };

        requests.callGetItem(rulesparam, function (err, data) {
            if (err) {
                console.log("error getting devices(control) :".JSON.stringify(err));
                callback(err, err);
            } else {
                if (Object.keys(data).length != 0) {
                    var rulesDevicesData = data.Item.Devices.L;
                    var rulesLoadsData = data.Item.Loads.L;

                    var devicesList = [];
                    var devicesData = [];
                    for (var devices in rulesDevicesData) {
                        var device = rulesDevicesData[devices].M.id.S;
                        if (devicesList.length == 0 || devicesList.indexOf(device) == -1) {
                            devicesList.push(device);

                            var pushData = {
                                thing: rulesDevicesData[devices].M.thing.S,
                                uiud: rulesDevicesData[devices].M.uiud.S,
                                home: rulesDevicesData[devices].M.home.S,
                                room: rulesDevicesData[devices].M.room.S
                            }
                            devicesData.push(pushData);
                        }
                    }
                    var utilsResponse = []
                    for (var loadsList in rulesLoadsData) {
                        var loads = rulesLoadsData[loadsList].L;
                        for (var load in loads) {
                            if (loads[load].M.type.S == "load") {
                                if (devicesList.indexOf(loads[load].M.device.S) != -1) {
                                    var name = loads[load].M.name.S;
                                    var loadDevice = loads[load].M.device.S;
                                    // console.log("loadDevice :", loadDevice);
                                    var thing = devicesData[loadsList].thing;
                                    var index = loads[load].M.index.S;
                                    var uiud = devicesData[loadsList].uiud;
                                    var userId = ID;

                                    var lightDetails = utils.discoveryResponse(loadDevice, name, index, uiud, thing, userId);
                                    utilsResponse.push(lightDetails);
                                }
                            }
                        }
                    }
                    console.log("Device Data Processed");
                    const Response = {
                        headers: {
                            schema: "st-schema",
                            version: "1.0",
                            interactionType: "discoveryResponse",
                            requestId: event.headers.requestId
                        },
                        devices: utilsResponse
                    };
                    console.log("Final :" + JSON.stringify(Response));
                    callback(err, Response);
                }
            }
        })
    },
    getRefreshDevicesFromTable: function (Id, userDevices) {
        var params = {
            Key: {
                userId: { S: Id }
            },
            TableName: "wozartaura-mobilehub-1863763842-Rules",
            ProjectionExpression: "Devices,Loads"
        };
        requests.callGetItem(params, function (err, data) {
            if (err) {
                console.log("ERROR", err);
                userDevices(err, 1, err);
            } else if (Object.keys(data).length != 0) {
                var refreshDevices = data.Item.Devices.L;
                console.log("refreshDevices : ", refreshDevices);
                var refreshLoads = data.Item.Loads.L;
                var refDevices;
                var dataDevice = [];
                var thing = {};
                var loadData = [];
                for (var i in refreshDevices) {
                    refDevices = refreshDevices[i].M
                    var deviceData = refreshDevices[i].M.id.S
                    if (dataDevice.length == 0 || dataDevice.indexOf(deviceData) == -1) {
                        dataDevice.push(deviceData);
                        var pushData = {
                            thing: refreshDevices[i].M.thing.S
                        }
                        thing[dataDevice] = pushData;
                    }
                }
                for (var j in refreshLoads) {
                    var listOfLoads = refreshLoads[j].L;
                    for (var k in listOfLoads) {
                        if (listOfLoads[k].M.type.S == "load" && dataDevice.indexOf(listOfLoads[k].M.device.S) != -1) {
                            loadData[k] = {
                                index: listOfLoads[k].M.index.S,
                                name: listOfLoads[k].M.name.S,
                                thing: thing,
                                data: refDevices
                            }
                        }
                    }
                }
                // console.log("loadData :",loadData)
                userDevices(null, loadData);
            }
        })
    },

    getReportState: function (event, refDevice, Device, Thing, Name, Index, gotReportState) {
        var count = 0;
        var outFlag = 0;
        var updateShadowData;
        var time = new Date();
        var seconds = (time.getTime() / 1000) | 0;
        updateShadowData = {
            state: {
                desired: {
                    led: seconds
                }
            }
        };
        // console.log("led:seconds :", updateShadowData.state.desired);
        var info;
        for (var list = 0; list < Thing.length; list++) {
            var info = {
                data: updateShadowData,
                thing: Thing[list]
            };
        }
        // console.log("info :", JSON.stringify(info));
        requests.putThingShadow(info, function (err, data) {
            if (err) {
                console.log("ERROR", "Updating shadow data :", JSON.stringify(err));
            } else {
                // console.log("data :",JSON.stringify(data));
                requests.getThingShadow(info.thing, function (err, data) {
                    // var jsonReportResponse;
                    var Reports = [];
                    for (var i = 0; i < refDevice.length; i++) {
                        // console.log("Device : ",refDevice[i].id.S);
                        // console.log("Device[i] : ", Device[i]);
                        if (refDevice[i].id.S == Device[i]) {
                            var payload = JSON.parse(data.payload);
                            switch (Index[i]) {
                                case "0":
                                    var reportState0 = utils.reportStateForm(Device[i], Name[i], payload.state.reported.state.s0, payload.state.reported.dim.d0);
                                    Reports.push(reportState0);
                                    break;
                                case "1":
                                    var reportState1 = utils.reportStateForm(Device[i], Name[i], payload.state.reported.state.s1, payload.state.reported.dim.d1);
                                    Reports.push(reportState1);
                                    break;
                                case "2":
                                    var reportState2 = utils.reportStateForm(Device[i], Name[i], payload.state.reported.state.s2, payload.state.reported.dim.d2);
                                    Reports.push(reportState2);
                                    break;
                                case "3":
                                    var reportState3 = utils.reportStateForm(Device[i], Name[i], payload.state.reported.state.s3, payload.state.reported.dim.d3);
                                    Reports.push(reportState3);
                                    break;
                            }
                        }
                    }
                    const jsonReportResponse = {
                        headers: {
                            schema: "st-schema",
                            version: "1.0",
                            interactionType: "stateRefreshResponse",
                            requestId: event.headers.requestId
                        },
                        deviceState: Reports
                    }
                    gotReportState(err, jsonReportResponse);
                })
            }
        });
    },

    validateUser: function (cookie, userId, callback) {
        var newtable = "wozartaura-mobilehub-1863763842-Rules";
        var requestrules = {
            TableName: newtable,
            Key: {
                userId: { S: userId }
            },
            ProjectionExpression: "Devices"
        };
        // console.log("request for device is :", JSON.stringify(requestrules));
        requests.callGetItem(requestrules, function (err, data) {
            if (err) {
                console.log("Error getting devices for user");
                callback(err, err);
            } else {
                console.log("Successfully got device data :", JSON.stringify(data));
                if (data.Item.Devices != "undefined") {
                    var deviceCheck = data.Item.Devices.L;
                    var matchFlag = 0;
                    var uiudFlag = 0;
                    var responded;
                    for (var dis in deviceCheck) {
                        var deviceGot = deviceCheck[dis].M.id.S;
                        var uiudGot = deviceCheck[dis].M.uiud.S;
                        if (uiudGot == "undefined") {
                            uiudFlag = 1;
                            responded = {
                                err: "UIUD not found"
                            };
                            callback(err, responded);
                            break;
                        }
                        if (deviceGot == cookie.deviceName && uiudGot == cookie.uiud) {
                            matchFlag = 1;
                            break;
                        }
                    }
                    if (matchFlag == 1) {
                        responded = {
                            err: 0
                        };
                        callback(err, responded);
                    } else {
                        if (uiudFlag == 0) {
                            responded = {
                                err: "UIUD not matched"
                            };
                            callback(err, responded);
                        }
                    }
                } else {
                    var deviceerr = "No devices for user";
                    callback(deviceerr, deviceerr);
                }
            }
        });
    },
    controlDevices: function (event, deviceControlled) {
        var outFlag = 0;
        var value;
        var type;
        var stateJson;
        var levelJson;
        var time = new Date();
        var seconds = (time.getTime() / 1000) | 0;
        var updateShadowData;
        switch (event.devices[0].commands[0].command) {
            case "on":
                type = 1;
                value = 1;
                break;
            case "off":
                type = 1;
                value = 0;
                break;
            case "setLevel":
                value = event.devices[0].commands[0].arguments[0]
                type = 2;
                break;
        }
        if (type == 1) {
            switch (event.devices[0].deviceCookie.index) {
                case "0":
                    stateJson = {
                        s0: value
                    }
                    break;
                case "1":
                    stateJson = {
                        s1: value
                    };
                    break;
                case "2":
                    stateJson = {
                        s2: value
                    };
                    break;
                case "3":
                    stateJson = {
                        s3: value
                    };
                    break;
            }
            updateShadowData = {
                state: {
                    desired: {
                        led: seconds,
                        state: stateJson
                    }
                }
            };
            console.log("updateshadowData : ", JSON.stringify(updateShadowData));
        } else {
            switch (event.devices[0].deviceCookie.index) {
                case "0":
                    if (value == 0) {
                        stateJson = {
                            s0: 0
                        };
                    } else {
                        stateJson = {
                            s0: 1
                        };
                        levelJson = {
                            d0: value
                        };
                    }
                    break;
                case "1":
                    if (value == 0) {
                        stateJson = {
                            s1: 0
                        };
                    } else {
                        stateJson = {
                            s1: 1
                        };
                        levelJson = {
                            d1: value
                        };
                    }
                    break;
                case "2":
                    if (value == 0) {
                        stateJson = {
                            s2: 0
                        };
                    } else {
                        stateJson = {
                            s2: 1
                        };
                        levelJson = {
                            d2: value
                        };
                    }
                    break;
                case "3":
                    levelJson = {
                        d3: value
                    };
                    break;
            }
            if (value == 0) {
                updateShadowData = {
                    state: {
                        desired: {
                            led: seconds,
                            state: stateJson
                        }
                    }
                }
            } else {
                updateShadowData = {
                    state: {
                        desired: {
                            led: seconds,
                            dim: levelJson,
                            state: stateJson
                        }
                    }
                }
            }
        }
        // console.log("updateShadowData :", JSON.stringify(updateShadowData));
        var info = {
            data: updateShadowData,
            thing: event.devices[0].deviceCookie.thing
        };
        // console.log("level :", levelJson);
        requests.putThingShadow(info, function (err, data) {
            if (err) {
            } else {
                var count = 0;
                var i = 0;

                function myLoop() {
                    setTimeout(function () {
                        var info = {
                            thing: event.devices[0].deviceCookie.thing
                        };
                        requests.getThingShadow(info.thing, function (err, data) {
                            var data = JSON.parse(data.payload);
                            if (err) {
                                if (count == 5) {
                                    var error = "Error getting Thing Data";
                                    deviceControlled(error, error);
                                }
                                i++;
                                if (i < 6 && outFlag == 0) {
                                    myLoop();
                                }
                                count++;
                            } else {
                                var string = require("string");
                                var nodeNumber = event.devices[0].deviceCookie.index;
                                var nodeCheck;
                                if (type == 1) {
                                    nodeNumber = string(nodeNumber).ensureLeft("s").s;
                                    var nodeCheck = data.state.reported.state[nodeNumber];
                                    var ledStatus = data.state.reported.led;
                                    if (nodeCheck == stateJson[nodeNumber]) {
                                        outFlag = 1;
                                        console.log("unequal");
                                        deviceControlled(null, utils.reportControlForm(event, value, type));
                                        i++;
                                        if (i < 6 && outFlag == 0) {
                                            myLoop();
                                        }
                                    } else {
                                        if (count == 5) {
                                            var error = "Unable to control state";
                                            deviceControlled(error, error);
                                        }
                                        i++;
                                        if (i < 6 && outFlag == 0) {
                                            myLoop();
                                        }
                                        count++;
                                    }
                                } else {
                                    nodeNumber = string(nodeNumber).ensureLeft("d").s;
                                    // console.log("dim :", JSON.stringify(data.state.reported));
                                    var nodeCheck = data.state.reported.dim[nodeNumber];
                                    var ledStatus = data.state.reported.led;
                                    if (nodeCheck == levelJson[nodeNumber]) {
                                        outFlag = 1;
                                        console.log("equal");
                                        deviceControlled(null, utils.reportBrightnessControl(event, levelJson[nodeNumber]));
                                        i++;
                                        if (i < 6 && outFlag == 0) {
                                            myLoop();
                                        }
                                    } else {
                                        if (count == 5) {
                                            var error = "Unable to control level";
                                            deviceControlled(error, error);
                                        }
                                        i++;
                                        if (i < 6 && outFlag == 0) {
                                            myLoop();
                                        }
                                        count++;
                                    }
                                }
                            }
                        });
                    }, 500);
                }
                myLoop();
            }
        })
    }
};