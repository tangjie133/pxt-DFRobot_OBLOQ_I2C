/** 
 * @file pxt-DFRobot_Maqueenplus/maqueenplus.ts
 * @brief DFRobot's OBLOQ_I2C makecode library.
 * @n [Get the module here]()
 * @n A WIFI-IoT module that can be easily used on IFTTT ThingSpeak  EasyIoT.
 * 
 * @copyright    [DFRobot](http://www.dfrobot.com), 2016
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](jie.tang@dfrobot.com)
 * @date  2020-06-03
 */


const OBLOQ_MQTT_EASY_IOT_SERVER_CHINA = "iot.dfrobot.com.cn"
const OBLOQ_MQTT_EASY_IOT_SERVER_EN = "iot.dfrobot.com"
const microIoT_WEBHOOKS_URL = "maker.ifttt.com"
const OBLOQ_MQTT_EASY_IOT_SERVER_TK = "api.thingspeak.com"

//% weight=10 color=#e7660b icon="\uf1eb" block="WiFi_IoT_Module(I2C)"
namespace microIoT {
    let IIC_ADDRESS = 0x16
    let Topic0CallBack: Action = null;
    let Topic1CallBack: Action = null;
    let Topic2CallBack: Action = null;
    let Topic3CallBack: Action = null;
    let Topic4CallBack: Action = null;
    let Wifi_Status = 0x00

    let microIoT_WEBHOOKS_KEY = ""
    let microIoT_WEBHOOKS_EVENT = ""
    let microIoT_THINGSPEAK_KEY = ""

    let READ_STATUS = 0x00
    let SET_PARA = 0x01
    let RUN_COMMAND = 0x02

    /*set para*/
    let SETWIFI_NAME = 0x01
    let SETWIFI_PASSWORLD = 0x02
    let SETMQTT_SERVER = 0x03
    let SETMQTT_PORT = 0x04
    let SETMQTT_ID = 0x05
    let SETMQTT_PASSWORLD = 0x06
    let SETHTTP_IP = 0x07

    /*run command*/
    let CONNECT_WIFI = 0x02
    let CONNECT_MQTT = 0x05
    let SUB_TOPIC0 = 0x06
    let SUB_TOPIC1 = 0x07
    let SUB_TOPIC2 = 0x08
    let SUB_TOPIC3 = 0x09
    let SUB_TOPIC4 = 0x0A
    let PUB_TOPIC0 = 0x0B
    let PUB_TOPIC1 = 0x0C
    let PUB_TOPIC2 = 0x0D
    let PUB_TOPIC3 = 0x0E
    let PUB_TOPIC4 = 0x0F
    let GET_URL = 0x10
    let POST_URL = 0x11


    /*read para value*/
    let READ_PING = 0x01
    let READ_WIFISTATUS = 0x02
    let READ_IP = 0x03
    let READ_MQTTSTATUS = 0x04
    let READ_SUBSTATUS = 0x05
    let READ_TOPICDATA = 0x06
    let HTTP_REQUEST = 0x10
    let READ_VERSION = 0x12

    /*para status */
    let PING_OK = 0x01
    let WIFI_DISCONNECT = 0x00
    let WIFI_CONNECTING = 0x02
    let WIFI_CONNECTED = 0x03
    let MQTT_CONNECTED = 0x01
    let MQTT_CONNECTERR = 0x02
    let SUB_TOPIC_OK = 0x01
    let SUB_TOPIC_Ceiling = 0x02
   
    let microIoTStatus = ""
    let WIFI_NAME = ""
    let WIFI_PASSWORLD = ""
    let MQTT_SERVER = ""
    let MQTT_PORT = ""
    let MQTT_ID = ""
    let MQTT_PASSWORLD = ""
    let Topic_0 = ""
    let Topic_1 = ""
    let Topic_2 = ""
    let Topic_3 = ""
    let Topic_4 = ""
    let RECDATA = ""
    let HTTP_IP = ""
    let HTTP_PORT = ""
    let microIoT_IP = "0.0.0.0"
    let G_city = 0;

    export enum SERVERS {
        //% blockId=SERVERS_China block="EasyIOT_CN"
        China,
        //% blockId=SERVERS_English block="EasyIOT_EN"
        English,
        //% block="SIOT"
        SIOT
    }

    export enum TOPIC {
        topic_0 = 0,
        topic_1 = 1,
        topic_2 = 2,
        topic_3 = 3,
        topic_4 = 4
    }

    export class PacketMqtt {
        public message: string;
    }

    function microIoT_setPara(cmd: number, para: string): void {
        let buf = pins.createBuffer(para.length + 4);
        buf[0] = 0x1E
        buf[1] = SET_PARA
        buf[2] = cmd
        buf[3] = para.length
        for (let i = 0; i < para.length; i++)
            buf[i + 4] = para[i].charCodeAt(0)
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
    }

    function microIoT_runCommand(cmd: number): void {
        let buf = pins.createBuffer(3);
        buf[0] = 0x1E
        buf[1] = RUN_COMMAND
        buf[2] = cmd
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
    }

    function microIoT_readStatus(para: number): number {
        let buf = pins.createBuffer(3);
        buf[0] = 0x1E
        buf[1] = READ_STATUS
        buf[2] = para
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        let recbuf = pins.createBuffer(2)
        recbuf = pins.i2cReadBuffer(IIC_ADDRESS, 2, false)
        return recbuf[1]
    }

    function microIoT_readValue(para: number): string {
        let buf = pins.createBuffer(3);
        let paraValue = 0x00
        let tempLen = 0x00
        let dataValue = ""
        buf[0] = 0x1E
        buf[1] = READ_STATUS
        buf[2] = para
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        microIoT_CheckStatus("READ_IP");
        return RECDATA
    }

    function microIoT_ParaRunCommand(cmd: number, data: string): void {
        let buf = pins.createBuffer(data.length + 4)
        buf[0] = 0x1E
        buf[1] = RUN_COMMAND
        buf[2] = cmd
        buf[3] = data.length
        for (let i = 0; i < data.length; i++)
            buf[i + 4] = data[i].charCodeAt(0)
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);

    }
    function microIoT_CheckStatus(cmd: string): void {
        while (true) {
            if (microIoTStatus == cmd) {
                serial.writeString("OKOK\r\n");
                return;
            }
            basic.pause(50);
        }
    }

    /**
    * WiFi configuration
    * @param SSID to SSID ,eg: "yourSSID"
    * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
    */

    //% weight=100
    //% blockId=OBLOQ-I2C_WIFI block="Wi-Fi configure name: %SSID password: %PASSWORD start connection"
    export function microIoT_WIFI(SSID: string, PASSWORD: string): void {
        microIoT_setPara(SETWIFI_NAME, SSID)
        microIoT_setPara(SETWIFI_PASSWORLD, PASSWORD)
        microIoT_runCommand(CONNECT_WIFI)
        microIoT_CheckStatus("WiFiConnected");
        Wifi_Status = WIFI_CONNECTED
    }

    /**
     * Access to EasyIOT_CN, SIOT, EasyIOT_EN by configuring this module
     * @param SSID to SSID ,eg: "yourSSID"
     * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
     * @param IOT_ID to IOT_ID ,eg: "yourIotId"
     * @param IOT_PWD to IOT_PWD ,eg: "yourIotPwd"
     * @param IOT_TOPIC to IOT_TOPIC ,eg: "yourIotTopic"
     * @param IP to IP ,eg: "192.168."
    */

    //% weight=90
    //% blockExternalInputs=1
    //% blockId=OBLOQ-I2C_MQTT block="MQTT configure|IOT_ID(user): %IOT_ID|IOT_PWD(password): %IOT_PWD|Topic(default topic_0): %IOT_TOPIC|server: %SERVERS||IP: %IP"
    export function microIoT_MQTT(/*SSID: string, PASSWORD: string,*/
        IOT_ID: string, IOT_PWD: string,
        IOT_TOPIC: string,servers: SERVERS, IP?: string):
        void {
        if (servers == SERVERS.China) {
            microIoT_setPara(SETMQTT_SERVER, OBLOQ_MQTT_EASY_IOT_SERVER_CHINA)
        } else if (servers == SERVERS.English) {
            microIoT_setPara(SETMQTT_SERVER, OBLOQ_MQTT_EASY_IOT_SERVER_EN)
        } 
        else{microIoT_setPara(SETMQTT_SERVER, IP)}
        microIoT_setPara(SETMQTT_PORT, "1883")//1883
        microIoT_setPara(SETMQTT_ID, IOT_ID)
        microIoT_setPara(SETMQTT_PASSWORLD, IOT_PWD)
        serial.writeString("wifi conneced ok\r\n");
        microIoT_runCommand(CONNECT_MQTT);
        microIoT_CheckStatus("MQTTConnected");
        serial.writeString("mqtt connected\r\n");
      
        Topic_0 = IOT_TOPIC
        microIoT_ParaRunCommand(SUB_TOPIC0, IOT_TOPIC);
        microIoT_CheckStatus("SubTopicOK");
        serial.writeString("sub topic ok\r\n");

    }
    
    /**
     * Add an MQTT subscription
     * @param IOT_TOPIC ,eg: "yourIotTopic"
     */

    //% weight=70
    //% blockId=microIoT_add_topic
    //% block="subscribe to additional %top : %IOT_TOPIC"
    //% top.fieldEditor="gridpicker" top.fieldOptions.columns=2
    export function microIoT_add_topic(top: TOPIC, IOT_TOPIC: string): void {
        microIoT_ParaRunCommand((top + 0x06), IOT_TOPIC);
        microIoT_CheckStatus("SubTopicOK");
    }

    /**
     * MQTT sends information to the corresponding subscription
     * @param Mess to Mess ,eg: "message"
     */


    //% weight=80
    //% blockId=OBLOQ-I2C_SendMessage block="send message %string to %TOPIC"
    export function microIoT_SendMessage(Mess: string, Topic: TOPIC): void {
        let topic = 0
        switch (Topic) {
            case TOPIC.topic_0:
                topic = PUB_TOPIC0
                break;
            case TOPIC.topic_1:
                topic = PUB_TOPIC1
                break;
            case TOPIC.topic_2:
                topic = PUB_TOPIC2
                break;
            case TOPIC.topic_3:
                topic = PUB_TOPIC3
                break;
            case TOPIC.topic_4:
                topic = PUB_TOPIC4
                break;
            default:
                break;

        }
        microIoT_ParaRunCommand(topic, Mess)

    }

    function microIoT_callback(top: TOPIC, a: Action): void {
        switch (top) {
            case TOPIC.topic_0:
                Topic0CallBack = a;
                break;
            case TOPIC.topic_1:
                Topic1CallBack = a;
                break;
            case TOPIC.topic_2:
                Topic2CallBack = a;
                break;
            case TOPIC.topic_3:
                Topic3CallBack = a;
                break;
            case TOPIC.topic_4:
                Topic4CallBack = a;
                break;
            default:
                break;
        }
    }
    /**
     * MQTT processes the subscription when receiving message
     */
    //% weight=60
    //% blockId=obloq_mqtt_callback_user_more block="on received %top "
    //% top.fieldEditor="gridpicker" top.fieldOptions.columns=2
    export function microIoT_MQTT_Event(top: TOPIC, cb: (message: string) => void) {
        microIoT_callback(top, () => {
            const packet = new PacketMqtt()
            packet.message = RECDATA
            cb(packet.message)
        });
    }


    /**
    * IFTTT configuration
    * @param EVENT to EVENT ,eg: "yourEvent"
    * @param KEY to KEY ,eg: "yourKey"
    */
    //% weight=50
    //% receive.fieldEditor="gridpicker" receive.fieldOptions.columns=3
    //% send.fieldEditor="gridpicker" send.fieldOptions.columns=3
    //% blockId=OBLOQ-I2C_http_IFTTT
    //% block="IFTTT configure event: %EVENT key: %KEY"
    export function microIoT_http_IFTTT(EVENT: string, KEY: string): void {
        microIoT_WEBHOOKS_EVENT = EVENT
        microIoT_WEBHOOKS_KEY = KEY
    }


    function microIoT_http_wait_request(time: number): string {
        if (time < 100) {
            time = 100
        }
        let timwout = time / 100
        let _timeout = 0
        while (true) {
            basic.pause(100)
            if (microIoTStatus == "HTTP_REQUEST") {
                microIoTStatus = "";
                return RECDATA
            } else if (microIoTStatus == "HTTP_REQUESTFailed") {
                microIoTStatus = "";
                return "requestFailed"
            }
            _timeout += 1
            if (_timeout > timwout) {
                return "timeOut"
            }
        }
    }
    /**
     * ThingSpeak configuration
     * @param KEY to KEY ,eg: "yourKey"
     */
    //% weight=31
    //% receive.fieldEditor="gridpicker" receive.fieldOptions.columns=3
    //% send.fieldEditor="gridpicker" send.fieldOptions.columns=3
    //% blockId=OBLOQ_microIoT_ThingSpeak_configura
    //% block="ThingSpeak configure key: %KEY"
    export function microIoT_ThingSpeak_configura(KEY: string): void {
        microIoT_THINGSPEAK_KEY = KEY
    }

    /**
     * ThingSpeak sent data
     * @param field1 ,eg: 2020
     */

    //% weight=30
    //% blockId=naturalScience_microIoT_http_TK_GET
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=inline
    //% block="ThingSpeak send value1: %field1 || value2: %field2 value3: %field3 value4: %field4 value5: %field5 value6: %field6 value7: %field7" 
    export function microIoT_http_TK_GET(field1: string, field2?: string, field3?: string, field4?: string, field5?: string, field6?: string, field7?: string): void {
        microIoT_setPara(SETHTTP_IP, OBLOQ_MQTT_EASY_IOT_SERVER_TK)
        let tempStr = ""
        tempStr = "update?api_key=" + microIoT_THINGSPEAK_KEY + "&field1=" + field1 + "&field2=" + field2 + "&field3=" + field3 + "&field4=" + field4 + "&field5=" + field5 + "&field6=" + field6 + "&field7=" + field7 + "\r"
        microIoT_ParaRunCommand(GET_URL, tempStr);
    }

    /**
     * IFTTT send data
     * time(ms): private long maxWait
     * @param value1 ,eg: "Hi"
     * @param value2 ,eg: "DFRobot"
     * @param value3 ,eg: "2020"
    */

    //% weight=40
    //% blockId=OBLOQ-I2C_http_post
    //% block="IFTTT send value1: %value1 value2: %value2 value3: %value3"
    export function microIoT_http_post(value1: string, value2: string, value3: string): void {
        microIoT_setPara(SETHTTP_IP, microIoT_WEBHOOKS_URL)
        let tempStr = ""
        tempStr = "trigger/" + microIoT_WEBHOOKS_EVENT + "/with/key/" + microIoT_WEBHOOKS_KEY + ",{\"value1\":\"" + value1 + "\",\"value2\":\"" + value2 + "\",\"value3\":\"" + value3 + "\" }" + "\r"
        microIoT_ParaRunCommand(POST_URL, tempStr)
    }

    function microIoT_GetData(len: number): void {
        RECDATA = ""
        let tempbuf = pins.createBuffer(1)
        tempbuf[0] = 0x22
        pins.i2cWriteBuffer(IIC_ADDRESS, tempbuf);
        let tempRecbuf = pins.createBuffer(len)
        tempRecbuf = pins.i2cReadBuffer(IIC_ADDRESS, len, false)
        for (let i = 0; i < len; i++) {
            RECDATA += String.fromCharCode(tempRecbuf[i])
        }
    }

    function microIoT_InquireStatus(): void {
        let buf = pins.createBuffer(3)
        let tempId = 0
        let tempStatus = 0
        buf[0] = 0x1E
        buf[1] = READ_STATUS
        buf[2] = 0x06
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        let recbuf = pins.createBuffer(2)
        recbuf = pins.i2cReadBuffer(IIC_ADDRESS, 2, false)
        tempId = recbuf[0]
        tempStatus = recbuf[1]
        switch (tempId) {
            case READ_PING:
                if (tempStatus == PING_OK) {
                    microIoTStatus = "PingOK"
                } else {
                    microIoTStatus = "PingERR"
                }
                break;
            case READ_WIFISTATUS:
                if (tempStatus == WIFI_CONNECTING) {
                    microIoTStatus = "WiFiConnecting"
                } else if (tempStatus == WIFI_CONNECTED) {
                    microIoTStatus = "WiFiConnected"
                } else if (tempStatus == WIFI_DISCONNECT) {
                    microIoTStatus = "WiFiDisconnect"
                } else {
                }
                break;
            case READ_MQTTSTATUS:
                if (tempStatus == MQTT_CONNECTED) {
                    microIoTStatus = "MQTTConnected"
                } else if (tempStatus == MQTT_CONNECTERR) {
                    microIoTStatus = "MQTTConnectERR"
                }
                break;
            case READ_SUBSTATUS:
                if (tempStatus == SUB_TOPIC_OK) {
                    microIoTStatus = "SubTopicOK"
                } else if (tempStatus == SUB_TOPIC_Ceiling) {
                    microIoTStatus = "SubTopicCeiling"
                } else {
                    microIoTStatus = "SubTopicERR"
                }
                break;
            case READ_IP:
                microIoTStatus = "READ_IP"
                microIoT_GetData(tempStatus)
                microIoT_IP = RECDATA
                break;
            case SUB_TOPIC0:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic0CallBack != null) {
                    Topic0CallBack();
                }
                break;
            case SUB_TOPIC1:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic1CallBack != null) {
                    Topic1CallBack();
                }
                break;
            case SUB_TOPIC2:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic2CallBack != null) {
                    Topic2CallBack();
                }
                break;
            case SUB_TOPIC3:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic3CallBack != null) {
                    Topic3CallBack();
                }
                break;
            case SUB_TOPIC4:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic4CallBack != null) {
                    Topic4CallBack();
                }
                break;
            case HTTP_REQUEST:
                microIoTStatus = "HTTP_REQUEST"
                microIoT_GetData(tempStatus)
                break;
            case READ_VERSION:
                microIoTStatus = "READ_VERSION"
                microIoT_GetData(tempStatus)
                break;
            default:
                break;
        }
        basic.pause(200);
    }
    basic.forever(function () {
        microIoT_InquireStatus();
    })


}
