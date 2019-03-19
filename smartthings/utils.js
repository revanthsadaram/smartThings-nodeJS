'use strict';


module.exports = {
    discoveryResponse: function(deviceId,loadName,Index,uiud,thing,userID) {

        if(Index < 3) {
            return {
                externalDeviceId: deviceId + "_" + loadName,
                deviceCookie: {
                    deviceName: deviceId,
                    thing: thing,
                    index: Index,
                    userId: userID,
                    uiud: uiud
                },
                friendlyName: loadName,
                manufacturerInfo: {
                    manufacturerName: "Wozart",
                    modelName: "Aura",
                    hwVersion: "v3 light Bulb",
                    swVersion: "1.0.0.0"
                },
                deviceContext: {
                    roomName: "Kitchen",
                    groups: ["Kitchen Lights", "House Bulbs"]
                },
                deviceHandlerType: "c2c-dimmer"
            }
        } else {
            return {
                externalDeviceId: deviceId + "_" + loadName,
                deviceCookie: {
                    deviceName: deviceId,
                    thing: thing,
                    index: Index,
                    userId: userID,
                    uiud: uiud
                },
                friendlyName: loadName,
                manufacturerInfo: {
                    manufacturerName: "Wozart",
                    modelName: "Aura",
                    hwVersion: "v3 light Bulb",
                    swVersion: "1.0.0.0"
                },
                deviceContext: {
                    roomName: "Kitchen",
                    groups: ["Kitchen Lights", "House Bulbs"]
                },
                deviceHandlerType: "c2c-switch"
            }
        }
    },
    reportStateForm: function (device,name, state, level) {
        var stateName;
        if (state == 1) {
            stateName = "ON";
        } else {
            stateName = "OFF";
        }
        if(stateName == "ON") {
            return {
                externalDeviceId: device + "_" + name,
                states: [
                    {
                        component: "main",
                        capability: "st.switch",
                        attribute: "switch",
                        value: stateName
                    },
                    {
                        component: "main",
                        capability: "st.switchLevel",
                        attribute: "level",
                        value: level
                    }
                ]
            }
        } else if(stateName == "OFF") {
            return {
                externalDeviceId: device + "_" + name,
                deviceCookie: {updatedcookie: "old or new value"},
                states: [
                    {
                        component: "main",
                        capability: "st.switch",
                        attribute: "switch",
                        value: stateName
                    },
                    {
                        component: "main",
                        capability: "st.switchLevel",
                        attribute: "level",
                        value: level
                    }
                ]
            }
        }
    },

    reportControlForm: function(event, state, type) {
        var stateName;
        if (type == 1) {
            if(state == 1) {
                stateName = "on";
            } else {
                stateName = "off";
            }
        }
        if(stateName == "off") {
            return {
                headers: {
                    schema: "st-schema",
                    version: "1.0",
                    interactionType: "commandResponse",
                    requestId: event.headers.requestId
                },
                deviceState: [
                    {
                        externalDeviceId: "partner",
                        deviceCookie: {
                            updatedcookie: "old or new value"
                        },
                        states: [
                            {
                                component: "main",
                                capability: "st.switch",
                                attribute: "switch",
                                value: stateName
                            }
                        ]
                    }
                ]
            }
        } else {
            return {
                headers: {
                    schema: "st-schema",
                    version: "1.0",
                    interactionType: "commandResponse",
                    requestId: event.headers.requestId
                },
                deviceState: [
                    {
                        externalDeviceId: "partner",
                        deviceCookie: {
                            updatedcookie: "old or new value"
                        },
                        states: [
                            {
                                component: "main",
                                capability: "st.swich",
                                attribute: "switch",
                                value: stateName
                            }
                        ]
                    }
                ]
            }
        }

    },
    reportBrightnessControl: function(event, value) {
        return {
            headers: {
                schema: "st-schema",
                version: "1.0",
                interactionType: "commandResponse",
                requestId: event.headers.requestId
            },
            deviceState: [
                {
                    externalDeviceId: "partner",
                    deviceCookie: {
                        updatedcookie: "old or new value"
                    },
                    states: [
                        {
                            component: "main",
                            capability: "st.switch",
                            attribute: "switch",
                            value: "on"
                        },
                        {
                            component: "main",
                            capability: "st.switchLevel",
                            attribute: "level",
                            value: value
                        }
                    ]
                }
            ]
        }

    }
}