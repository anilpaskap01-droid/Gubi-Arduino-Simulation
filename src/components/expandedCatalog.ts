import type {ComponentDefinition,Pin} from '../types';

// These are illustrative devices/breakouts with interface-level wiring. Package
// ICs expose numbered leads. No unimplemented part is advertised as simulated.
export type ModelFamily = 'board'|'axial'|'disc'|'capacitor'|'coil'|'crystal'|'transistor'|'led'|'dip'|'qfp'|'lcd'|'oled'|'tft'|'epaper'|'round-screen'|'seven-segment'|'matrix'|'ring'|'strip'|'bar'|'environment'|'inertial'|'optical'|'gas'|'probe'|'ultrasonic'|'radar'|'loadcell'|'flow'|'current'|'servo'|'motor'|'stepper'|'solenoid'|'fan'|'pump'|'driver'|'radio'|'gps'|'ethernet'|'storage'|'camera'|'converter'|'battery'|'solar'|'relay'|'fuse'|'button'|'switch'|'keypad'|'encoder'|'joystick'|'touch'|'header'|'terminal'|'jst'|'usb'|'jack'|'dsub'|'breadboard'|'perfboard'|'shield'|'speaker'|'microphone'|'amplifier'|'instrument';
export interface CatalogModel {family:ModelFamily;label:string;color:string;count:number;rows:number;cols:number;variant:string}
export const expandedModels:Record<string,CatalogModel>={};
export const expandedCatalog:ComponentDefinition[]=[];
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const numbered=(count:number)=>Array.from({length:count},(_,i)=>String(i+1));
const io=(count:number)=>['VCC','GND',...Array.from({length:count},(_,i)=>`IO${i+1}`)];
const I2C=['VCC','GND','SDA','SCL'];
const SPI=['VCC','GND','SCK','MOSI','MISO','CS'];
const UART=['VCC','GND','TX','RX'];
const ANALOG=['VCC','GND','OUT'];
const colors=['#306b61','#375f86','#785c89','#3e716f','#84564d','#665f91'];
function add(category:string,family:ModelFamily,names:string[],pinNames:string[]|((name:string)=>string[]),options:Partial<CatalogModel>={},tags:string[]=[]){
 names.forEach((name,index)=>{
  const id=slug(name),names=typeof pinNames==='function'?pinNames(name):pinNames;
  const pins:Pin[]=names.map(id=>({id,type:id==='GND'?'ground':['VCC','VIN','VOUT','3V3','5V','BAT+'].includes(id)?'power':family==='dip'||['axial','disc','capacitor','coil','crystal','header','terminal','jst','jack','dsub','breadboard','perfboard','fuse','transistor'].includes(family)?'passive':/^(OUT|A[0-9]|AIN|AO)/.test(id)?'analog':'digital'}));
  const model={family,label:name,color:colors[index%colors.length],count:Math.max(2,pins.length),rows:2,cols:16,variant:'',...options};
  if(family==='ring')model.count=Number(name.match(/\d+$/)?.[0]||16);
  if(family==='lcd'){const size=name.match(/(\d+)x(\d+)/);if(size){model.cols=Number(size[1]);model.rows=Number(size[2]);}}
  if(family==='matrix'){const size=name.match(/(\d+)x(\d+)/);if(size){model.cols=Number(size[1]);model.rows=Number(size[2]);}}
  if(family==='dip'||family==='qfp'||family==='header'||family==='terminal'||family==='jst')model.count=pins.length;
  expandedModels[id]=model;
  expandedCatalog.push({id,name,category,description:`${name} — ${family.replaceAll('-',' ')} model; ${tags.join(', ')||category.toLowerCase()}`,pins,visual:family==='board'?'board':'module',defaultProperties:{},simulationHandler:'none',interactiveControls:[],documentation:`${name}: original SVG model and editable wiring. Experimental: device behavior is not emulated. ${family==='dip'||family==='qfp'?'Numbered terminals represent package leads; consult the datasheet for their functions.':'Pins represent a simplified device/breakout interface, not a manufacturer-specific physical pinout.'}`,supportLevel:'Experimental',tags:[category,family,...tags],...(family==='board'?{pinLayout:'balanced' as const}:{})});
 });
}

// Development boards: illustrative headers, not an invented emulated CPU.
add('Boards','board',['Arduino Uno R4 Minima','Arduino Uno R4 WiFi','Arduino Nano Every','Arduino Nano 33 IoT','Arduino Nano 33 BLE','Arduino Nano RP2040 Connect','Arduino Nano ESP32','Arduino Due','Arduino MKR Zero','Arduino MKR WiFi 1010'],io(20),{variant:'arduino'},['microcontroller','development']);
add('Boards','board',['ESP32-S2 DevKit','ESP32-C6 DevKit','ESP32-H2 DevKit','ESP32-CAM','ESP32 WROOM breakout','ESP32 WROVER kit','Wemos D1 mini','Wemos D1 R32'],io(18),{variant:'wireless'},['wifi','esp','wireless']);
add('Boards','board',['Raspberry Pi Pico 2','Raspberry Pi Pico 2 W','STM32 Blue Pill','STM32 Black Pill','Teensy 4.0','Teensy 4.1','Seeed XIAO RP2040','Seeed XIAO ESP32C3','Adafruit Feather RP2040','Adafruit Feather ESP32-S3','Adafruit QT Py RP2040','BBC microbit V2'],io(16),{variant:'compact'},['microcontroller','usb']);

add('Basic','axial',['Schottky diode','Zener diode','Fast recovery diode','Germanium diode','Rectifier diode 1N4007','Signal diode 1N4148'],['A','K'],{variant:'diode'},['passive','rectifier']);
add('Basic','axial',['Metal film resistor','Carbon film resistor','Wirewound resistor','Power resistor','Precision resistor','Zero ohm link'],['1','2'],{variant:'resistor'},['passive','resistance']);
add('Basic','capacitor',['Tantalum capacitor','Film capacitor','Polyester capacitor','Supercapacitor','Variable capacitor','Trimmer capacitor'],['1','2'],{},['passive','capacitance']);
add('Basic','disc',['Ceramic capacitor','Varistor','NTC thermistor','PTC thermistor','Polyfuse'],['1','2'],{},['passive']);
add('Basic','coil',['Axial inductor','Radial inductor','Toroidal inductor','Air core coil','Ferrite bead','Common mode choke'],name=>numbered(name==='Common mode choke'?4:2),{},['passive','inductance']);
add('Basic','crystal',['Quartz crystal 16MHz','Watch crystal 32kHz','Ceramic resonator','Crystal oscillator module'],name=>numbered(name==='Crystal oscillator module'?4:name==='Ceramic resonator'?3:2),{},['clock','frequency']);
add('Basic','transistor',['NPN transistor 2N2222','NPN transistor BC547','PNP transistor BC557','PNP transistor 2N3906'],['B','C','E'],{variant:'to92'},['bjt','semiconductor']);
add('Basic','transistor',['N-channel MOSFET IRF520','Logic MOSFET IRLZ44N','P-channel MOSFET IRF9540'],['G','D','S'],{variant:'to220'},['fet','semiconductor']);
add('Basic','transistor',['Triac BT136','SCR thyristor','Darlington TIP120','Voltage regulator TO220'],['1','2','3'],{variant:'to220'},['semiconductor','power']);
add('Basic','led',['Infrared LED','Ultraviolet LED','Bi-color LED','High power LED','SMD LED 0805','SMD RGB LED'],name=>numbered(name==='SMD RGB LED'?4:name==='Bi-color LED'?3:2),{},['light','diode']);

add('Display','lcd',['LCD 8x2','LCD 16x4','LCD 40x2','LCD 40x4'],numbered(16),{},['character','parallel']);
add('Display','oled',['OLED SH1106 128x64','OLED SSD1327 128x128','OLED SSD1331 color','OLED SH1107 64x128'],I2C,{},['screen','i2c']);
add('Display','tft',['TFT ST7735 1.8 inch','TFT ST7789 2.0 inch','TFT ILI9341 2.4 inch','TFT ILI9488 3.5 inch','TFT ST7796 4.0 inch'],[...SPI,'DC','RST','BL'],{},['screen','spi','color']);
add('Display','round-screen',['Round TFT GC9A01','Round OLED 128x128'],[...SPI,'DC','RST'],{},['screen','round']);
add('Display','epaper',['E-paper 1.54 inch','E-paper 2.13 inch','E-paper 2.9 inch','E-paper tri-color 4.2 inch'],[...SPI,'DC','RST','BUSY'],{},['screen','spi','eink']);
add('Display','seven-segment',['TM1637 4 digit','TM1638 8 digit','MAX7219 8 digit'],['VCC','GND','CLK','DATA','CS'],{count:8},['segment','numeric']);
add('Display','seven-segment',['14 segment alphanumeric','16 segment alphanumeric'],numbered(18),{count:2},['segment','character']);
add('Display','matrix',['MAX7219 matrix 4 in 1'],['VCC','GND','DIN','CLK','CS'],{cols:32,rows:8},['led','matrix','spi']);
add('Display','matrix',['LED matrix 16x16','LED matrix 32x8','RGB matrix HUB75 32x16','RGB matrix HUB75 64x32'],numbered(16),{cols:16,rows:16},['led','matrix','panel']);
add('Display','ring',['WS2812 ring 8','WS2812 ring 12','WS2812 ring 16','WS2812 ring 24','WS2812 ring 60'],['VCC','GND','DIN','DOUT'],{},['neopixel','addressable','rgb']);
add('Display','strip',['APA102 strip','SK6812 RGBW strip','WS2811 pixel string','RGB analog LED strip'],name=>name==='RGB analog LED strip'?['VCC','R','G','B']:name==='APA102 strip'?['VCC','GND','DATA','CLK']:['VCC','GND','DIN','DOUT'],{count:6},['led','addressable','rgb']);
add('Display','bar',['LED bar graph 10','LED bar graph 20','LED bar graph RGB'],numbered(20),{},['led','indicator']);
add('Display','tft',['Nextion 2.4 inch HMI','Nextion 3.2 inch HMI'],UART,{},['screen','uart','touch']);

add('Sensors','environment',['AHT10','AHT20','SHT20','SHT31','SHT40','HTU21D','Si7021','BME680','BME688','BMP388','BMP390','LPS22HB','MPL3115A2','HDC1080','TMP102','TMP117','MCP9808'],I2C,{},['temperature','humidity','pressure','i2c']);
add('Sensors','inertial',['ADXL345','ADXL335','LIS3DH','LSM6DS3','LSM6DSOX','MPU9250','ICM20948','BNO055','BNO085','BMI160','QMC5883L','HMC5883L','LIS3MDL','FXOS8700','GY521 IMU'],name=>name==='ADXL335'?['VCC','GND','OUT_X','OUT_Y','OUT_Z']:I2C,{},['motion','imu','accelerometer']);
add('Sensors','optical',['BH1750','TSL2561','TSL2591','VEML7700','VEML6075 UV','APDS9960 gesture','TCS34725 color','VCNL4040 proximity','MAX30102 pulse','MAX30100 pulse','VL53L0X distance','VL53L1X distance','VL6180X distance'],I2C,{},['light','optical','i2c']);
add('Sensors','optical',['TCS3200 color','IR reflective TCRT5000','IR slot interrupter','Photodiode module','Phototransistor module','Laser receiver','UV analog sensor','Pulse sensor analog'],['VCC','GND','OUT','CTRL'],{},['light','optical','analog']);
add('Sensors','gas',['MQ3 alcohol','MQ4 methane','MQ5 gas','MQ6 LPG','MQ7 carbon monoxide','MQ8 hydrogen','MQ9 combustible','MQ136 hydrogen sulfide','MQ137 ammonia','MQ138 VOC'],['VCC','GND','AO','DO'],{},['gas','analog']);
add('Sensors','environment',['SGP30 air quality','SGP40 VOC','CCS811 air quality','SCD30 CO2','SCD40 CO2','SCD41 CO2','ENS160 air quality'],I2C,{variant:'air'},['gas','air','i2c']);
add('Sensors','probe',['Water level sensor','Capacitive soil moisture probe','pH probe module','EC conductivity probe','Turbidity sensor','Water leak detector','Thermocouple MAX6675','Thermocouple MAX31855','PT100 MAX31865','Analog temperature LM35','Analog temperature TMP36'],name=>name.includes('MAX')?SPI:ANALOG,{},['probe','environment']);
add('Sensors','ultrasonic',['JSN-SR04T waterproof','US-100 ultrasonic','SRF05 ultrasonic','URM37 ultrasonic'],['VCC','GND','TRIG','ECHO'],{},['distance','sonar']);
add('Sensors','radar',['RCWL0516 microwave','LD2410 presence radar','LD2450 tracking radar','HB100 Doppler radar'],name=>name.startsWith('LD')?UART:ANALOG,{},['motion','presence','radar']);
add('Sensors','loadcell',['Load cell 1kg','Load cell 5kg','Load cell 20kg','HX711 load cell ADC','Force sensitive resistor','Flex sensor','Pressure transducer'],name=>name==='HX711 load cell ADC'?['VCC','GND','DT','SCK','E+','E-','A+','A-']:numbered(name.startsWith('Load cell')?4:2),{},['force','weight','pressure']);
add('Sensors','flow',['Water flow YF-S201','Water flow YF-S401','Anemometer','Reed rain gauge','Reed door sensor','Magnetic reed switch','Inductive proximity','Capacitive proximity'],ANALOG,{},['flow','magnetic','position']);
add('Sensors','current',['ACS712 current','ACS758 current','INA219 current','INA226 current','INA260 current','ZMPT101B voltage','Voltage divider module'],name=>name.startsWith('INA')?[...I2C,'IN+','IN-']:['VCC','GND','OUT','IN+','IN-'],{},['current','voltage','measurement']);
add('Sensors','environment',['DS3231 RTC','DS1307 RTC','PCF8523 RTC'],[...I2C,'SQW'],{variant:'rtc'},['clock','time','i2c']);

add('Motors','servo',['MG90S metal servo','MG996R servo','DS3218 servo','Continuous rotation servo','Micro linear servo'],['VCC','GND','PWM'],{},['actuator','pwm']);
add('Motors','motor',['N20 gearmotor','TT geared motor','DC gearmotor encoder','Coreless motor','Brushless motor','Vibration coin motor'],name=>name.includes('encoder')?['M+','M-','VCC','GND','ENC_A','ENC_B']:name==='Brushless motor'?['U','V','W']:['M+','M-'],{},['actuator','dc']);
add('Motors','stepper',['NEMA17 stepper','NEMA23 stepper','Bipolar stepper','Unipolar stepper'],['A+','A-','B+','B-'],{},['actuator','stepper']);
add('Motors','solenoid',['Push pull solenoid','Solenoid valve','Linear actuator','Electromagnet'],['1','2'],{},['actuator','magnetic']);
add('Motors','fan',['Cooling fan 2 wire','PWM fan 4 wire','Blower fan'],['VCC','GND','TACH','PWM'],{},['fan','air']);
add('Motors','pump',['Mini water pump','Peristaltic pump','Air pump'],['VCC','GND'],{},['fluid','actuator']);
add('Motors','driver',['A4988 stepper driver','DRV8825 stepper driver','TMC2208 stepper driver','TMC2209 stepper driver','TB6600 stepper driver'],['VMOT','GND','VCC','STEP','DIR','EN','A+','A-','B+','B-'],{},['driver','stepper']);
add('Motors','driver',['TB6612FNG dual driver','DRV8833 dual driver','BTS7960 high current driver','L9110S motor driver','PCA9685 servo driver','Brushless ESC','Motor driver shield'],['VCC','GND','VIN','IN1','IN2','PWM','OUT1','OUT2'],{},['driver','pwm','motor']);

add('Communication','radio',['LoRa SX1276','LoRa SX1278','LoRa SX1262','RFM69 radio','NRF24L01 PA LNA','CC1101 radio','Si4432 radio'],[...SPI,'IRQ'],{},['rf','radio','spi']);
add('Communication','radio',['HC12 serial radio','HM10 BLE','AT09 BLE','SIM800L GSM','SIM900 GSM','SIM7600 LTE','A7670 LTE','HC02 Bluetooth','Zigbee XBee','E32 LoRa UART'],UART,{variant:'uart'},['wireless','uart']);
add('Communication','gps',['GPS NEO7M','GPS NEO8M','GPS ATGM336H','GPS L86'],[...UART,'PPS'],{},['navigation','uart']);
add('Communication','ethernet',['W5100 Ethernet','W5500 Ethernet','ENC28J60 Ethernet','Ethernet shield'],SPI,{},['network','spi','rj45']);
add('Communication','driver',['MCP2515 CAN','SN65HVD230 CAN','MAX485 RS485','RS232 MAX3232','I2C level shifter','SPI level shifter','USB TTL CH340','USB TTL CP2102','USB TTL FT232'],['VCC','GND','TX','RX','A','B'],{},['bus','adapter']);
add('Communication','radio',['PN532 NFC','RDM6300 RFID','RF 433MHz transmitter','RF 433MHz receiver','Infrared transceiver'],['VCC','GND','DATA','CLK'],{},['rfid','nfc','infrared']);
add('Communication','camera',['OV7670 camera','OV2640 camera','ArduCAM mini camera'],[...SPI,'SDA','SCL'],{},['image','camera']);

add('Power','converter',['LM2596 buck converter','MP1584 buck converter','XL4015 buck converter','MT3608 boost converter','XL6009 boost converter','Buck boost converter','AMS1117 regulator','7805 regulator module','LM317 adjustable regulator','TPS63020 buck boost'],['VIN','GND','VOUT'],{},['voltage','regulator']);
add('Power','converter',['TP4056 charger','TP5100 charger','CN3065 solar charger','LiPo charger module','18650 BMS 1S','18650 BMS 2S','18650 BMS 3S','USB power bank module','Ideal diode module','Power distribution module'],['VIN','GND','BAT+','BAT-','VOUT'],{variant:'charge'},['battery','charging']);
add('Power','battery',['Coin cell CR2032','18650 cell','18650 holder','LiPo battery','Li-ion battery pack','AAA battery holder','2 AA battery holder','4 AA battery holder'],['+','-'],{},['battery','cell']);
add('Power','solar',['Mini solar panel','Solar panel 6V','Solar panel 12V'],['+','-'],{},['solar','energy']);
add('Power','relay',['Relay 2 channel','Relay 4 channel','Relay 8 channel','Solid state relay','Latching relay module'],name=>{const count=name.includes('8 channel')?8:name.includes('4 channel')?4:name.includes('2 channel')?2:1;return ['VCC','GND',...Array.from({length:count},(_,i)=>`IN${i+1}`),...Array.from({length:count},(_,i)=>[`COM${i+1}`,`NO${i+1}`,`NC${i+1}`]).flat()];}, {},['relay','switch']);
add('Power','fuse',['Glass fuse','Blade fuse','Fuse holder','DC circuit breaker'],['1','2'],{},['protection','fuse']);
add('Power','transistor',['MOSFET switch module','Dual MOSFET module','High side switch module'],['VCC','GND','IN','OUT'],{variant:'module'},['switch','power']);

// Numbered leads intentionally avoid fake chip functions/pinouts.
add('IC','dip',['74HC00 NAND','74HC02 NOR','74HC04 inverter','74HC08 AND','74HC14 Schmitt','74HC32 OR','74HC86 XOR','74HC74 flip flop','CD4011 NAND','CD4093 Schmitt'],numbered(14),{count:14},['logic','dip']);
add('IC','dip',['74HC138 decoder','74HC157 multiplexer','74HC164 shift register','74HC4051 analog mux','74HC4067 analog mux','CD4017 counter','CD4026 display counter','CD4040 counter','CD4511 segment driver'],name=>numbered(name.startsWith('74HC164')?14:name.startsWith('74HC4067')?24:16),{},['logic','counter','dip']);
add('IC','dip',['LM358 op amp','LM386 audio amp','LM393 comparator','TL072 op amp','NE5532 op amp','MCP6002 op amp','PC817 optocoupler','4N35 optocoupler','AT24C32 EEPROM','AT24C256 EEPROM'],name=>numbered(name.startsWith('PC817')?4:name.startsWith('4N35')?6:8),{count:8},['analog','dip']);
add('IC','dip',['ULN2803 transistor array','ULN2004 transistor array','L293 motor IC','MCP23017 IO expander','MCP23S17 IO expander','MCP3008 ADC','MCP3208 ADC','ATmega328P DIP','ATmega168 DIP','ATtiny84 DIP'],name=>numbered(name.startsWith('ATmega')?28:name.startsWith('ATtiny')?14:name.startsWith('ULN2803')?18: name.startsWith('MCP23')?28:16),{},['interface','dip']);
add('IC','qfp',['ATmega2560 chip','STM32F103C8 chip','RP2040 chip','ESP32 chip'],name=>numbered(name.startsWith('ATmega')?100:name.startsWith('RP2040')?56:48),{},['mcu','package']);
add('IC','environment',['ADS1115 ADC module','ADS1015 ADC module','MCP4725 DAC module','MCP4728 DAC module','PCF8591 ADC DAC','MCP23008 expander','TCA9548A I2C mux','PCA9555 IO expander'],[...I2C,'A0','A1','A2','A3'],{},['adc','dac','i2c','breakout']);

add('Input','button',['Tactile switch 6mm','Tactile switch 12mm','Arcade button','Illuminated push button','Emergency stop button','Foot pedal switch','Limit microswitch'],['COM','NO','NC'],{},['button','contact']);
add('Input','switch',['SPDT switch','DPDT switch','Rocker switch','Rotary selector','DIP switch 4 way','DIP switch 8 way'],name=>numbered(name.includes('8 way')?16:name.includes('4 way')?8:name==='DPDT switch'?6:3),{},['switch','contact']);
add('Input','keypad',['Keypad 3x4','Keypad 4x3','Keypad 1x4','Capacitive keypad 4x4','Button matrix 4x4'],['R1','R2','R3','R4','C1','C2','C3','C4'],{},['keyboard','matrix','button']);
add('Input','encoder',['EC11 rotary encoder','KY040 encoder module','Optical encoder','I2C rotary encoder'],name=>name.startsWith('I2C')?I2C:['VCC','GND','A','B','SW'],{},['rotary','position']);
add('Input','joystick',['PS2 joystick module','Thumb joystick','Analog joystick 3 axis'],name=>['VCC','GND','X','Y',...(name.includes('3 axis')?['Z']:[]),'SW'],{},['analog','control']);
add('Input','touch',['TTP223 touch button','MPR121 touch controller','Touch slider','Resistive touch panel','Capacitive touch panel'],['VCC','GND','SDA','SCL','IRQ'],{},['touch','interface']);

add('Connectors','header',['Male header 2 pin','Male header 4 pin','Male header 8 pin','Male header 16 pin','Female header 6 pin','Female header 10 pin','IC socket DIP8','IC socket DIP16','IC socket DIP28','IDC ribbon 10 pin','IDC ribbon 20 pin'],name=>numbered(Number(name.match(/(?:DIP)?(\d+)/)?.[1]||8)),{},['connector','header']);
add('Connectors','terminal',['Screw terminal 2 pin','Screw terminal 3 pin','Screw terminal 4 pin','Screw terminal 6 pin','Spring terminal','Wago style lever connector'],name=>numbered(Number(name.match(/\d+/)?.[0]||3)),{},['connector','terminal']);
add('Connectors','jst',['JST PH 2 pin','JST XH 3 pin','JST SH 4 pin','Grove connector','STEMMA QT connector','Qwiic connector'],name=>numbered(Number(name.match(/\d+/)?.[0]||4)),{},['connector','cable']);
add('Connectors','usb',['USB A connector','USB B connector','Micro USB connector','USB C breakout'],['VBUS','GND','D+','D-'],{},['connector','usb']);
add('Connectors','jack',['DC barrel jack','Audio jack 3.5mm','BNC connector','SMA antenna connector','Banana socket'],numbered(3),{},['connector','socket']);
add('Connectors','dsub',['DB9 connector','DB15 connector','RJ11 breakout','RJ45 breakout'],name=>numbered(name.startsWith('DB15')?15:name.startsWith('DB9')?9:name.startsWith('RJ11')?6:8),{},['connector','interface']);

add('Prototyping','breadboard',['Breadboard half','Breadboard 170 point','Breadboard 400 point','Breadboard 830 point'],numbered(20),{},['prototype','solderless']);
add('Prototyping','perfboard',['Perfboard square','Perfboard strip','Double sided protoboard','Solderable breadboard','Copper stripboard'],numbered(16),{},['prototype','solder']);
add('Prototyping','shield',['Uno prototyping shield','Nano terminal adapter','Mega screw shield','Sensor shield','ESP32 terminal adapter'],io(20),{},['prototype','adapter']);

add('Audio','speaker',['Mini speaker 8 ohm','Mylar speaker','Piezo disc transducer','Passive buzzer module','Active buzzer module'],['+','-'],{},['sound','speaker']);
add('Audio','microphone',['Electret microphone module','MAX4466 microphone','MAX9814 microphone','INMP441 I2S microphone','SPH0645 I2S microphone'],name=>name.includes('I2S')?['VCC','GND','BCLK','WS','DATA']:ANALOG,{},['sound','input']);
add('Audio','amplifier',['PAM8403 stereo amplifier','PAM8610 amplifier','TPA3116 amplifier','MAX98357 I2S amplifier','DFPlayer Mini','VS1053 MP3 module','ISD1820 recorder','PCM5102 I2S DAC'],['VCC','GND','IN_L','IN_R','OUT_L','OUT_R'],{},['sound','audio']);

add('Storage','storage',['MicroSD card module','SD card module','SPI flash W25Q32','SPI flash W25Q64','SPI flash W25Q128'],SPI,{},['memory','spi','storage']);
add('Storage','storage',['I2C FRAM module','I2C EEPROM module','DS1990 iButton reader'],I2C,{},['memory','storage']);
add('Instruments','instrument',['Digital multimeter','Logic analyzer 8 channel','Mini oscilloscope','USB power meter','Frequency counter','Function generator module'],['VCC','GND','CH1','CH2'],{},['measurement','test','instrument']);
