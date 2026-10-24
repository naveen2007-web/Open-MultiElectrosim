// Each catalog entry declares its model fidelity. Catalog presence is not a claim of silicon emulation.
const P=(id,x,y,label=id)=>({id,x,y,label});
const two=[P('1',-48,0),P('2',48,0)];
const tri=[P('B',-48,0),P('C',24,-40),P('E',24,40)];
const gate=[P('A',-48,-16),P('B',-48,16),P('Y',48,0)];
export const CATEGORIES=['All components','Favorites','Sources','Passives','Semiconductors','Logic & ICs','Microcontrollers','Sensors','Instruments','Connectors'];
export const catalog=[];
function add(id,name,category,kind,values={},pins=two,more={}){catalog.push({id,name,category,kind,values,pins,model:'behavioral',description:'Idealized educational model. Check model notes before using results.',...more});}
add('resistor','Resistor','Passives','resistor',{resistance:1000},{...two});
// Normalize pins below, allowing concise shared geometry.
catalog[0].pins=two;
add('resistor-film','Metal film resistor','Passives','resistor',{resistance:1000,tolerance:1});
add('resistor-carbon','Carbon film resistor','Passives','resistor',{resistance:4700,tolerance:5});
add('resistor-power','Power resistor','Passives','resistor',{resistance:10,rating:5});
add('rheostat','Variable resistor / rheostat','Passives','resistor',{resistance:10000});
add('pot','Potentiometer','Passives','pot',{resistance:10000,position:0.5},[...two,P('W',0,40)]);
for(const [id,name,c,polar] of [['capacitor','Ceramic capacitor',1e-6,false],['electrolytic','Electrolytic capacitor',100e-6,true],['tantalum','Tantalum capacitor',10e-6,true],['film-cap','Film capacitor',1e-6,false],['variable-cap','Variable capacitor',1e-9,false],['supercap','Supercapacitor',0.1,true],['bipolar-cap','Bipolar electrolytic capacitor',47e-6,false]])add(id,name,'Passives','capacitor',{capacitance:c,initial:0},two,{polarized:polar});
for(const [id,name,l] of [['inductor','Inductor',0.01],['air-inductor','Air core inductor',1e-3],['ferrite-inductor','Ferrite core inductor',0.01],['variable-inductor','Variable inductor',0.1]])add(id,name,'Passives','inductor',{inductance:l,seriesResistance:0.1});
add('ground','Ground / reference','Sources','ground',{},[P('GND',0,0)]);
add('dc','DC voltage source','Sources','voltage',{voltage:5});
add('battery','Battery','Sources','voltage',{voltage:9});
add('sine','Sine generator','Sources','sine',{amplitude:5,frequency:100,offset:0,phase:0});
add('square','Square generator','Sources','square',{amplitude:5,frequency:100,duty:0.5,offset:0});
add('triangle','Triangle generator','Sources','triangle',{amplitude:5,frequency:100,offset:0});
add('current','DC current source','Sources','current',{current:0.001});
add('switch','SPST switch','Passives','switch',{closed:1,onResistance:0.01});
add('pushbutton','Push button','Passives','switch',{closed:0,onResistance:0.01});
add('spdt','SPDT switch','Passives','spdt',{position:0},[P('COM',-48,0),P('A',48,-20),P('B',48,20)]);
add('fuse','Fuse (resistive model)','Passives','resistor',{resistance:0.05,rating:1});
add('lamp','Incandescent lamp (fixed R)','Passives','resistor',{resistance:100});
for(const [id,name,drop] of [['diode','Silicon diode (1N4148 model)',0.7],['rectifier','Rectifier diode (1N4007 model)',0.7],['schottky','Schottky diode',0.3]])add(id,name,'Semiconductors','diode',{drop,onResistance:2});
for(const [id,name,drop,color] of [['led','LED · red',1.8,'#ff5d6e'],['led-green','LED · green',2.1,'#66ef98'],['led-blue','LED · blue',3,'#6ab4ff'],['led-white','LED · white',3,'#ffffff'],['led-yellow','LED · amber',2,'#ffd66a']])add(id,name,'Semiconductors','led',{drop,onResistance:10},two,{color});
add('zener','Zener diode','Semiconductors','zener',{drop:0.7,zenerVoltage:5.1,onResistance:3});
add('npn','NPN transistor · generic / 2N2222','Semiconductors','npn',{beta:100,threshold:0.65},tri);
add('pnp','PNP transistor · generic / BC557','Semiconductors','pnp',{beta:100,threshold:0.65},tri);
add('nmos','N-channel MOSFET','Semiconductors','nmos',{threshold:2,conductance:0.02},[P('G',-48,0),P('D',24,-40),P('S',24,40)]);
add('pmos','P-channel MOSFET','Semiconductors','pmos',{threshold:2,conductance:0.02},[P('G',-48,0),P('D',24,-40),P('S',24,40)]);
for(const name of ['Op-amp (idealized)','LM358 (behavioral)','LM741 (behavioral)','TL072 (behavioral)'])add(name.split(' ')[0].toLowerCase(),name,'Semiconductors','opamp',{gain:100000,low:0,high:12},[P('+',-48,18),P('-',-48,-18),P('OUT',48,0)],{description:'Finite-gain voltage-controlled source with configurable rail limits. Supply pins, bandwidth and input common-mode limits are not modeled.'});
add('comparator','Comparator · LM393 behavioral','Semiconductors','comparator',{low:0,high:5},[P('+',-48,18),P('-',-48,-18),P('OUT',48,0)]);
add('relay','Relay · SPDT','Semiconductors','relay',{coilResistance:100,pickupVoltage:3,onResistance:0.05},[P('C+',-48,-30),P('C-',-48,30),P('COM',48,0),P('NO',48,-40),P('NC',48,40)]);
for(const name of ['AND','OR','NAND','NOR','XOR','XNOR','NOT','BUFFER'])add(name.toLowerCase(),name+' gate','Logic & ICs',name.toLowerCase(),{high:5,threshold:2.5},name==='NOT'||name==='BUFFER'?[P('A',-48,0),P('Y',48,0)]:gate,{description:'Ideal combinational logic, solved to a fixed point in each timestep. Oscillating loops are reported.'});
add('logic-input','Logic input / toggle','Logic & ICs','logic-input',{state:0,high:5},[P('Q',48,0)]);
add('clock','Digital clock','Logic & ICs','clock',{frequency:10,high:5,duty:0.5},[P('Q',48,0)]);
add('dff','D flip-flop · 74HC74 behavioral','Logic & ICs','dff',{high:5},[P('D',-48,-20),P('CLK',-48,20),P('Q',48,-20),P('NQ',48,20)]);
add('counter','4-bit counter · 74HC393 behavioral','Logic & ICs','counter',{high:5},[P('CLK',-48,-20),P('RST',-48,20),...Array.from({length:4},(_,i)=>P('Q'+i,48,-30+i*20))]);
add('mux','2:1 multiplexer · behavioral','Logic & ICs','mux',{high:5},[P('A',-48,-25),P('B',-48,0),P('S',-48,25),P('Y',48,0)]);
add('timer555','NE555 timer (threshold model)','Logic & ICs','timer555',{high:5},[P('TRIG',-48,-30),P('THR',-48,0),P('RESET',-48,30),P('OUT',48,-20),P('DIS',48,20)],{description:'Trigger/threshold latch with reset and discharge switch, using configurable high supply. No physical supply pins; thresholds are 1/3 and 2/3 of high.'});
function board(id,name,gpios,analog=[],voltage=3.3,model='gpio-vm'){
 const left=['VCC','GND',...gpios.slice(0,Math.ceil(gpios.length/2))];const right=[...gpios.slice(Math.ceil(gpios.length/2)),...analog];
 const h=Math.max(left.length,right.length)*16;
 add(id,name,'Microcontrollers','mcu',{high:voltage},[...left.map((n,i)=>P(n,-72,-h/2+16*i+8)),...right.map((n,i)=>P(n,72,-h/2+16*i+8))],{model,boardHeight:h+24,gpios,analog,description:model==='gpio-vm'?'Logical GPIO symbol; runs the documented Arduino-style subset interpreter. Not a CPU, radio, or peripheral emulator. Logical pin positions are not a physical board pinout.':'Layout-only board. Full Linux / RP-series CPU emulation is not included.'});
}
board('uno','Arduino Uno R3',Array.from({length:14},(_,i)=>'D'+i),Array.from({length:6},(_,i)=>'A'+i),5);
board('nano','Arduino Nano',Array.from({length:14},(_,i)=>'D'+i),Array.from({length:8},(_,i)=>'A'+i),5);
board('mega','Arduino Mega 2560',Array.from({length:54},(_,i)=>'D'+i),Array.from({length:16},(_,i)=>'A'+i),5);
board('leonardo','Arduino Leonardo',Array.from({length:14},(_,i)=>'D'+i),Array.from({length:6},(_,i)=>'A'+i),5);
board('uno-r4','Arduino Uno R4 (GPIO subset)',Array.from({length:14},(_,i)=>'D'+i),Array.from({length:6},(_,i)=>'A'+i),5);
board('esp32','ESP32 DevKit (logical GPIO)',[0,2,4,5,12,13,14,15,16,17,18,19,21,22,23,25,26,27,32,33,34,35,36,39].map(x=>'GPIO'+x));
board('esp32-c3','ESP32-C3 (logical GPIO)',Array.from({length:22},(_,i)=>'GPIO'+i));
board('esp32-s3','ESP32-S3 (logical GPIO)',[...Array.from({length:22},(_,i)=>i),...Array.from({length:22},(_,i)=>i+26)].map(x=>'GPIO'+x));
board('esp32-s2','ESP32-S2 (logical GPIO)',[...Array.from({length:22},(_,i)=>i),...Array.from({length:21},(_,i)=>i+26)].map(x=>'GPIO'+x));
board('esp32-c6','ESP32-C6 (logical GPIO)',Array.from({length:31},(_,i)=>'GPIO'+i));
board('esp32-h2','ESP32-H2 (logical GPIO)',Array.from({length:28},(_,i)=>'GPIO'+i));
board('esp8266','ESP8266 NodeMCU (logical GPIO)',[0,1,2,3,4,5,9,10,12,13,14,15,16].map(x=>'GPIO'+x),['A0']);
board('pico','Raspberry Pi Pico (GPIO subset)',Array.from({length:29},(_,i)=>'GPIO'+i));
board('pico-w','Raspberry Pi Pico W (GPIO subset)',Array.from({length:29},(_,i)=>'GPIO'+i));
for(const [id,name] of [['pi-zero','Raspberry Pi Zero / Zero 2 W'],['pi3','Raspberry Pi 3'],['pi4','Raspberry Pi 4'],['pi5','Raspberry Pi 5']])board(id,name,Array.from({length:28},(_,i)=>'GPIO'+i),[],3.3,'layout-only');
add('ldr','LDR / photoresistor','Sensors','ldr',{lux:100,resistanceAt10Lux:10000,gamma:0.7});
add('ntc','NTC thermistor','Sensors','ntc',{temperature:25,r25:10000,beta:3950});
add('ptc','PTC thermistor (linear)','Sensors','ptc',{temperature:25,r25:1000,alpha:0.00385});
add('lm35','LM35 temperature sensor','Sensors','lm35',{temperature:25},[P('VCC',-48,-20),P('GND',-48,20),P('OUT',48,0)]);
add('tmp36','TMP36 temperature sensor','Sensors','tmp36',{temperature:25},[P('VCC',-48,-20),P('GND',-48,20),P('OUT',48,0)]);
add('hcsr04','HC-SR04 ultrasonic sensor','Sensors','ultrasonic',{distance:100},[P('VCC',-48,-20),P('GND',-48,20),P('TRIG',48,-20),P('ECHO',48,20)],{description:'Behavioral trigger/echo timing: >=10 microsecond trigger, distance round trip at 343 m/s. No acoustic reflections or temperature compensation.'});
for(const [id,name] of [['pir','PIR motion sensor'],['hall','Digital Hall sensor'],['ir','IR obstacle sensor'],['reed','Reed switch module'],['tilt','Tilt sensor']])add(id,name,'Sensors','digital-sensor',{active:0,high:3.3},[P('VCC',-48,-20),P('GND',-48,20),P('OUT',48,0)],{description:'Ideal digital detection input, controlled by active. Does not simulate the underlying optics, motion field or magnetic field.'});
for(const [id,name,iface] of [['dht11','DHT11 temperature / humidity','single-wire'],['dht22','DHT22 temperature / humidity','single-wire'],['bme280','BME280 pressure / humidity','I2C'],['bmp280','BMP280 pressure sensor','I2C'],['mpu6050','MPU6050 accelerometer / gyroscope','I2C'],['ina219','INA219 current / power monitor','I2C'],['max30102','MAX30102 optical sensor','I2C'],['ds18b20','DS18B20 thermometer','1-Wire'],['mq2','MQ-2 gas sensor','analog calibrated'],['ph','pH sensor module','analog calibrated'],['loadcell','HX711 load cell interface','clock/data'],['gps','GPS receiver','UART'],['oled','SH1106 / SSD1306 OLED','I2C'],['lcd','16 × 2 LCD','parallel']])add(id,name,id==='oled'||id==='lcd'?'Connectors':'Sensors','module',{},[P('VCC',-48,-24),P('GND',-48,24),P('DATA',48,-24),P('CLK',48,24)],{model:'layout-only',description:`${iface} module placeholder for wiring and PCB planning. Its protocol and output are not simulated.`});
add('voltmeter','Voltmeter / voltage probe','Instruments','voltmeter',{},two);
add('ammeter','Ammeter','Instruments','ammeter',{},two);
add('scope','Oscilloscope probe (CH input / GND)','Instruments','scope',{},two);
add('logic-probe','Logic analyzer probe','Instruments','scope',{},two);
add('testpoint','Test point','Connectors','testpoint',{},[P('TP',0,0)]);
for(const [id,name,count] of [['header2','2-pin header',2],['header4','4-pin header',4],['header8','8-pin header',8],['screw','Screw terminal · 2 pin',2]])add(id,name,'Connectors','connector',{},Array.from({length:count},(_,i)=>P(String(i+1),0,(i-(count-1)/2)*20)),{model:'passive'});
export const byId=Object.fromEntries(catalog.map(c=>[c.id,c]));
export function newId(){if(globalThis.crypto?.randomUUID)return crypto.randomUUID();const bytes=new Uint8Array(16);if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(bytes);else for(let i=0;i<16;i++)bytes[i]=Math.floor(Math.random()*256);return [...bytes].map(v=>v.toString(16).padStart(2,'0')).join('');}
export function makePart(type,x,y,id){const c=byId[type];return {id:id||newId(),type,x,y,rotation:0,ref:'',values:{...c.values},firmware:c.kind==='mcu'?'void setup() {\n  pinMode(2, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(2, HIGH);\n  delay(500);\n  digitalWrite(2, LOW);\n  delay(500);\n}':'',footprint:{x,y,rotation:0}};}
export function pinsOf(part){return byId[part.type].pins.map(p=>{const a=(part.rotation||0)*Math.PI/180;return {...p,x:part.x+p.x*Math.cos(a)-p.y*Math.sin(a),y:part.y+p.x*Math.sin(a)+p.y*Math.cos(a)}});}
export function pinKey(part,pin){return `${typeof part==='string'?part:part.id}:${typeof pin==='string'?pin:pin.id}`;}
export const VALUE_LABELS={resistance:'Resistance (Ω)',capacitance:'Capacitance (F)',inductance:'Inductance (H)',voltage:'Voltage (V)',current:'Current (A)',frequency:'Frequency (Hz)',amplitude:'Amplitude (V)',offset:'Offset (V)',phase:'Phase (°)',initial:'Initial voltage (V)',high:'Logic / upper rail (V)',low:'Lower rail (V)',threshold:'Threshold (V)',drop:'Forward drop (V)',onResistance:'On resistance (Ω)',seriesResistance:'Series resistance (Ω)',position:'Wiper / throw (0–1)',closed:'Closed (0 or 1)',state:'State (0 or 1)',active:'Detection (0 or 1)',duty:'Duty (0–1)',temperature:'Temperature (°C)',lux:'Illuminance (lux)',distance:'Distance (cm)',beta:'Beta',r25:'Resistance at 25 °C (Ω)',pickupVoltage:'Coil pickup voltage (V)',coilResistance:'Coil resistance (Ω)',gain:'Open-loop gain',zenerVoltage:'Breakdown voltage (V)',conductance:'MOS factor (A/V²)',alpha:'Temperature coefficient (1/°C)',rating:'Rating (display only)',tolerance:'Tolerance % (display only)',resistanceAt10Lux:'Resistance at 10 lux (Ω)',gamma:'Light exponent'};
export function engineering(n,unit=''){if(!Number.isFinite(n))return '—';if(n===0)return '0 '+unit;const a=Math.abs(n);for(const [m,p]of [[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p']])if(a>=m||m===1e-12)return `${Number((n/m).toPrecision(3)).toString()} ${p}${unit}`;return '0 '+unit;}
export function parseValue(s){const m=String(s).trim().match(/^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)\s*([pnuµmkMG]?)(?:\s*(?:ohm|Ω|F|H|V|A|Hz))?$/i);if(!m)return NaN;const map={p:1e-12,n:1e-9,u:1e-6,'µ':1e-6,m:1e-3,k:1e3,M:1e6,G:1e9};return Number(m[1])*(map[m[2]]||1);}
