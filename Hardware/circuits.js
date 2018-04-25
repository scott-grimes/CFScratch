//each toolbox inside contains the components required to build the desired chip
var thingsToBuild = ['NOT','AND','OR','XOR','MUX','DMUX','NOT16','AND16','OR16','MUX16','OR8WAY','MUX4WAY16','MUX8WAY16','DMUX4WAY','DMUX8WAY','HALFADDER','FULLADDER','ADD16','INC16','ALU','DFF','BIT','REGISTER','RAM8','RAM64','RAM512','RAM4K','RAM16K','PC'];
var toolboxes = {}; // the toolbox required for each component to be built
var devices = {}; //the setup required for each component to be built

var buildToolBoxes = function(){
    //GATES
    toolboxes.NOT = [{"type":"NAND"}];
    toolboxes.AND = [{"type":"NAND"},
                     {"type":"NOT"}];
    toolboxes.OR = [{"type":"NAND"},
                     {"type":"NOT"}];
    toolboxes.XOR = [{"type":"AND"},
                     {"type":"NOT"},
                     {"type":"OR"}];
    toolboxes.MUX = [{"type":"AND"},
                     {"type":"NOT"},
                     {"type":"OR"}];
    toolboxes.DMUX = [{"type":"AND"},
                     {"type":"NOT"}];

    //16bit problems require buses
    toolboxes.NOT16 = [{"type":"NOT"}]; 
    toolboxes.AND16 = [{"type":"AND"}];
    toolboxes.OR16 = [{"type":"OR"}]; 
    toolboxes.MUX16 = [{"type":"MUX"}]; 

    //multi-way gates
    toolboxes.OR8WAY = [{"type":"OR"}]; 
    toolboxes.MUX4WAY16 = [{"type":"MUX16"}]; 
    toolboxes.MUX8WAY16 = [{"type":"MUX4WAY16"},
                           {"type":"MUX16"},
                           {"type":"BusIn"},
                           {"type":"BusOut"}]; 
    toolboxes.DMUX4WAY = [{"type":"DMUX"}]; 
    toolboxes.DMUX8WAY = [{"type":"DMUX"},
                           {"type":"DMUX4WAY"}]; 




    // CHIPS
    toolboxes.HALFADDER = [{"type":"AND"},
                           {"type":"XOR"}]; 

    toolboxes.FULLADDER = [{"type":"HALFADDER"},
                           {"type":"OR"}]; 


    toolboxes.ADD16 = [{"type":"FULLADDER"}]; 

    toolboxes.INC16 = [{"type":"ADD16"}]; //todo NEEDS A TRUE GATE

    toolboxes.ALU = [{"type":"MUX16"},
                       {"type":"NOT16"},
                       {"type":"ADD16"},
                       {"type":"AND16"},
                       {"type":"OR"},
                       {"type":"OR8WAY"},
                       {"type":"NOT"},
                       {"type":"BusIn","numOutputs":16}]; 

    toolboxes.DFF = []; //todo this

    toolboxes.BIT = [{"type":"DFF"}];
    toolboxes.REGISTER = [{"type":"BIT"}];
    toolboxes.RAM8 = [{"type":"MUX8WAY16"},
                      {"type":"DMUX8WAY"},
                      {"type":"REGISTER"}];
    toolboxes.RAM64 = [{"type":"MUX8WAY16"},
                      {"type":"DMUX8WAY"},
                      {"type":"RAM8"}];
    toolboxes.RAM512 = [{"type":"MUX8WAY16"},
                      {"type":"DMUX8WAY"},
                      {"type":"RAM64"}];
    toolboxes.RAM4K = [{"type":"MUX8WAY16"},
                      {"type":"DMUX8WAY"},
                      {"type":"RAM512"}];
    toolboxes.RAM16K = [{"type":"MUX8WAY16"},
                      {"type":"DMUX8WAY"},
                      {"type":"RAM4K"}];
    toolboxes.PC = [{"type":"REGISTER"},
                      {"type":"INC16"},
                      {"type":"MUX16"}];
    toolboxes.DFF = [{"type":"NAND"},
                      {"type":"NOT"}];


    toolboxes.BIT = [{"type":"D-FF"},
                      {"type":"MUX"}];
}
buildToolBoxes()


// SETUP
var buildSingleBitDevices = function(){

}
buildSingleBitDevices();

devices.NOT = {"devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":100,"label":"IN","state":{"on":false}},
    {"type":"NAND","id":"dev1","x":150,"y":100,"label":"Nand"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev2","x":250,"y":100,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev1.out0"},
    {"from":"dev1.in0","to":"dev0.out0"},
    {"from":"dev1.in1","to":"dev0.out0"}
  ],
    "tests":{   "number":2,
                "toSet":["IN"],
                "toCheck":["OUT"],
                "IN":[0,1],
                "OUT":[1,0]}
};

devices.AND = {"devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"A","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":150,"label":"B","state":{"on":false}},
    {"type":"NAND","id":"dev2","x":150,"y":100,"label":"NAND"},
    {"type":"NOT","id":"dev3","x":250,"y":100,"label":"NOT"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev4","x":350,"y":100,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev2.in1","to":"dev1.out0"},
    {"from":"dev3.in0","to":"dev2.out0"},
    {"from":"dev4.in0","to":"dev3.out0"}
  ],
    "tests":{   "number":4,
                "toSet":["A","B"],
                "toCheck":["OUT"],
                "A":[0,1,0,1],
                "B":[0,0,1,1],
                "OUT":[0,0,0,1]}};

devices.OR = { "devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"A","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":150,"label":"B","state":{"on":false}},
    {"type":"NOT","id":"dev2","x":150,"y":50,"label":"NOT"},
    {"type":"NOT","id":"dev3","x":150,"y":150,"label":"NOT"},
    {"type":"NAND","id":"dev4","x":250,"y":100,"label":"NAND"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev5","x":350,"y":100,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev1.out0"},
    {"from":"dev4.in0","to":"dev2.out0"},
    {"from":"dev4.in1","to":"dev3.out0"},
    {"from":"dev5.in0","to":"dev4.out0"}
  ],
    "tests":{   "number":4,
                "toSet":["A","B"],
                "toCheck":["OUT"],
                "A":[0,1,0,1],
                "B":[0,0,1,1],
                "OUT":[0,1,1,1]}
};

devices.XOR = {
  "devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"A","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":150,"label":"B","state":{"on":false}},
    {"type":"NOT","id":"dev2","x":150,"y":0,"label":"NOT"},
    {"type":"NOT","id":"dev3","x":150,"y":200,"label":"NOT"},
    {"type":"AND","id":"dev4","x":250,"y":150,"label":"AND"},
    {"type":"AND","id":"dev5","x":250,"y":50,"label":"AND"},
    {"type":"OR","id":"dev6","x":350,"y":100,"label":"OR"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev7","x":450,"y":100,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev1.out0"},
    {"from":"dev4.in0","to":"dev0.out0"},
    {"from":"dev4.in1","to":"dev3.out0"},
    {"from":"dev5.in0","to":"dev2.out0"},
    {"from":"dev5.in1","to":"dev1.out0"},
    {"from":"dev6.in0","to":"dev5.out0"},
    {"from":"dev6.in1","to":"dev4.out0"},
    {"from":"dev7.in0","to":"dev6.out0"}
  ],
    "tests":{   "number":4,
                "toSet":["A","B"],
                "toCheck":["OUT"],
                "A":[0,1,0,1],
                "B":[0,0,1,1],
                "OUT":[0,1,1,0]}
};

devices.MUX = {"devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"A","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":150,"label":"B","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev2","x":50,"y":250,"label":"SEL","state":{"on":false}},
    {"type":"NOT","id":"dev3","x":150,"y":250,"label":"NOT"},
    {"type":"AND","id":"dev4","x":150,"y":150,"label":"AND"},
    {"type":"OR","id":"dev5","x":250,"y":150,"label":"OR"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev6","x":350,"y":150,"label":"OUT"},
    {"type":"AND","id":"dev7","x":200,"y":50,"label":"AND"}
  ],
  "connectors":[
    {"from":"dev3.in0","to":"dev2.out0"},
    {"from":"dev4.in0","to":"dev1.out0"},
    {"from":"dev4.in1","to":"dev2.out0"},
    {"from":"dev5.in0","to":"dev7.out0"},
    {"from":"dev5.in1","to":"dev4.out0"},
    {"from":"dev6.in0","to":"dev5.out0"},
    {"from":"dev7.in0","to":"dev0.out0"},
    {"from":"dev7.in1","to":"dev3.out0"}
  ],
    "tests":{   "number":8,
                "toSet":["A","B","SEL"],
                "toCheck":["OUT"],
                "A":[0,1,0,1,0,1,0,1],
                "B":[0,0,1,1,0,0,1,1],
                "SEL":[0,0,0,0,1,1,1,1],
                "OUT":[0,1,0,1,0,0,1,1]}
};

devices.DMUX = {
  "devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"IN","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":250,"label":"SEL","state":{"on":false}},
    {"type":"NOT","id":"dev2","x":150,"y":250,"label":"NOT"},
    {"type":"AND","id":"dev3","x":200,"y":50,"label":"AND"},
    {"type":"AND","id":"dev4","x":200,"y":150,"label":"AND"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev5","x":350,"y":100,"label":"A"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev6","x":350,"y":200,"label":"B"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev1.out0"},
    {"from":"dev3.in0","to":"dev0.out0"},
    {"from":"dev3.in1","to":"dev1.out0"},
    {"from":"dev4.in0","to":"dev0.out0"},
    {"from":"dev4.in1","to":"dev2.out0"},
    {"from":"dev5.in0","to":"dev4.out0"},
    {"from":"dev6.in0","to":"dev3.out0"}
  ],
    "tests":{   "number":4,
                "toSet":["IN","SEL"],
                "toCheck":["A","B"],
                "IN":[0,1,0,1],
                "SEL":[0,0,1,1],
                "A":[0,1,0,0],
                "B":[0,0,0,1]}
};

devices.NOT16 = {"devices":[
    {"type":"CUSTOMBUSIN","numOutputs":16, "immobile":true,"isBus":true,"value":0,"id":"dev0","x":616,"y":144,"label":"OUT"},
    {"type":"BusOut","numInputs":16,"immobile":true,"id":"dev1","x":520,"y":128,"label":"BusOut"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev2","x":48,"y":152,"label":"IN"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev3","x":144,"y":120,"label":"BusIn"},
    {"type":"NOT","id":"dev4","x":336,"y":0,"label":"NOT"},
    {"type":"NOT","id":"dev5","x":336,"y":56,"label":"NOT"},
    {"type":"NOT","id":"dev6","x":336,"y":100,"label":"NOT"},
    {"type":"NOT","id":"dev7","x":336,"y":150,"label":"NOT"},
    {"type":"NOT","id":"dev8","x":336,"y":206,"label":"NOT"},
    {"type":"NOT","id":"dev9","x":336,"y":250,"label":"NOT"},
    {"type":"NOT","id":"dev10","x":336,"y":300,"label":"NOT"},
    {"type":"NOT","id":"dev11","x":336,"y":350,"label":"NOT"},
    {"type":"NOT","id":"dev12","x":336,"y":400,"label":"NOT"},
    {"type":"NOT","id":"dev13","x":336,"y":450,"label":"NOT"},
    {"type":"NOT","id":"dev14","x":336,"y":500,"label":"NOT"},
    {"type":"NOT","id":"dev15","x":336,"y":550,"label":"NOT"},
    {"type":"NOT","id":"dev16","x":336,"y":600,"label":"NOT"},
    {"type":"NOT","id":"dev17","x":336,"y":650,"label":"NOT"},
    {"type":"NOT","id":"dev18","x":336,"y":700,"label":"NOT"},
    {"type":"NOT","id":"dev19","x":336,"y":750,"label":"NOT"}
  ],
    "connectors":[
    {"from":"dev0.in0","to":"dev1.out0"},
    {"from":"dev1.in0","to":"dev4.out0"},
    {"from":"dev1.in1","to":"dev5.out0"},
    {"from":"dev1.in2","to":"dev6.out0"},
    {"from":"dev1.in3","to":"dev7.out0"},
    {"from":"dev1.in4","to":"dev8.out0"},
    {"from":"dev1.in5","to":"dev9.out0"},
    {"from":"dev1.in6","to":"dev10.out0"},
    {"from":"dev1.in7","to":"dev11.out0"},
    {"from":"dev1.in8","to":"dev12.out0"},
    {"from":"dev1.in9","to":"dev13.out0"},
    {"from":"dev1.in10","to":"dev14.out0"},
    {"from":"dev1.in11","to":"dev15.out0"},
    {"from":"dev1.in12","to":"dev16.out0"},
    {"from":"dev1.in13","to":"dev17.out0"},
    {"from":"dev1.in14","to":"dev18.out0"},
    {"from":"dev1.in15","to":"dev19.out0"},
    {"from":"dev3.in0","to":"dev2.out0"},
    {"from":"dev4.in0","to":"dev3.out0"},
    {"from":"dev5.in0","to":"dev3.out1"},
    {"from":"dev6.in0","to":"dev3.out2"},
    {"from":"dev7.in0","to":"dev3.out3"},
    {"from":"dev8.in0","to":"dev3.out4"},
    {"from":"dev9.in0","to":"dev3.out5"},
    {"from":"dev10.in0","to":"dev3.out6"},
    {"from":"dev11.in0","to":"dev3.out7"},
    {"from":"dev12.in0","to":"dev3.out8"},
    {"from":"dev13.in0","to":"dev3.out9"},
    {"from":"dev14.in0","to":"dev3.out10"},
    {"from":"dev15.in0","to":"dev3.out11"},
    {"from":"dev16.in0","to":"dev3.out12"},
    {"from":"dev17.in0","to":"dev3.out13"},
    {"from":"dev18.in0","to":"dev3.out14"},
    {"from":"dev19.in0","to":"dev3.out15"}
  ],
    "tests":{   "number":4,
                "toSet":["IN"],
                "toCheck":["OUT"],
                "IN":[0,-1338,32767,21845],
                "OUT":[-1,1337,-32768,-21846]
                }
            };

devices.AND16 = {
   "devices":[
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev0","x":48,"y":48,"label":"A"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev1","x":48,"y":192,"label":"B"},
    {"type":"CUSTOMBUSIN","numOutputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev2","x":616,"y":144,"label":"OUT"},
    {"type":"BusOut","numInputs":16,"immobile":true,"id":"dev3","x":520,"y":128,"label":"BusOut"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev4","x":144,"y":24,"label":"BusIn"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev5","x":144,"y":176,"label":"BusIn"},
    {"type":"AND","id":"dev6","x":336,"y":0,"label":"AND"},
    {"type":"AND","id":"dev7","x":336,"y":50,"label":"AND"},
    {"type":"AND","id":"dev8","x":336,"y":100,"label":"AND"},
    {"type":"AND","id":"dev9","x":336,"y":150,"label":"AND"},
    {"type":"AND","id":"dev10","x":336,"y":200,"label":"AND"},
    {"type":"AND","id":"dev11","x":336,"y":250,"label":"AND"},
    {"type":"AND","id":"dev12","x":336,"y":300,"label":"AND"},
    {"type":"AND","id":"dev13","x":336,"y":350,"label":"AND"},
    {"type":"AND","id":"dev14","x":336,"y":400,"label":"AND"},
    {"type":"AND","id":"dev15","x":336,"y":450,"label":"AND"},
    {"type":"AND","id":"dev16","x":336,"y":200,"label":"AND"},
    {"type":"AND","id":"dev17","x":336,"y":250,"label":"AND"},
    {"type":"AND","id":"dev18","x":336,"y":300,"label":"AND"},
    {"type":"AND","id":"dev19","x":336,"y":350,"label":"AND"},
    {"type":"AND","id":"dev20","x":336,"y":400,"label":"AND"},
    {"type":"AND","id":"dev21","x":336,"y":450,"label":"AND"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev3.out0"},
    {"from":"dev3.in0","to":"dev6.out0"},
    {"from":"dev3.in1","to":"dev7.out0"},
    {"from":"dev3.in2","to":"dev8.out0"},
    {"from":"dev3.in3","to":"dev9.out0"},
    {"from":"dev3.in4","to":"dev10.out0"},
    {"from":"dev3.in5","to":"dev11.out0"},
    {"from":"dev3.in6","to":"dev12.out0"},
    {"from":"dev3.in7","to":"dev13.out0"},
    {"from":"dev3.in8","to":"dev14.out0"},
    {"from":"dev3.in9","to":"dev15.out0"},
    {"from":"dev3.in10","to":"dev16.out0"},
    {"from":"dev3.in11","to":"dev17.out0"},
    {"from":"dev3.in12","to":"dev18.out0"},
    {"from":"dev3.in13","to":"dev19.out0"},
    {"from":"dev3.in14","to":"dev20.out0"},
    {"from":"dev3.in15","to":"dev21.out0"},
    {"from":"dev4.in0","to":"dev0.out0"},
    {"from":"dev5.in0","to":"dev1.out0"},
    {"from":"dev6.in0","to":"dev4.out0"},
    {"from":"dev6.in1","to":"dev5.out0"},
    {"from":"dev7.in0","to":"dev4.out1"},
    {"from":"dev7.in1","to":"dev5.out1"},
    {"from":"dev8.in0","to":"dev4.out2"},
    {"from":"dev8.in1","to":"dev5.out2"},
    {"from":"dev9.in0","to":"dev4.out3"},
    {"from":"dev9.in1","to":"dev5.out3"},
    {"from":"dev10.in0","to":"dev4.out4"},
    {"from":"dev10.in1","to":"dev5.out4"},
    {"from":"dev11.in0","to":"dev4.out5"},
    {"from":"dev11.in1","to":"dev5.out5"},
    {"from":"dev12.in0","to":"dev4.out6"},
    {"from":"dev12.in1","to":"dev5.out6"},
    {"from":"dev13.in0","to":"dev4.out7"},
    {"from":"dev13.in1","to":"dev5.out7"},
    {"from":"dev14.in0","to":"dev4.out8"},
    {"from":"dev14.in1","to":"dev5.out8"},
    {"from":"dev15.in0","to":"dev4.out9"},
    {"from":"dev15.in1","to":"dev5.out9"},
    {"from":"dev16.in0","to":"dev4.out10"},
    {"from":"dev16.in1","to":"dev5.out10"},
    {"from":"dev17.in0","to":"dev4.out11"},
    {"from":"dev17.in1","to":"dev5.out11"},
    {"from":"dev18.in0","to":"dev4.out12"},
    {"from":"dev18.in1","to":"dev5.out12"},
    {"from":"dev19.in0","to":"dev4.out13"},
    {"from":"dev19.in1","to":"dev5.out13"},
    {"from":"dev20.in0","to":"dev4.out14"},
    {"from":"dev20.in1","to":"dev5.out14"},
    {"from":"dev21.in0","to":"dev4.out15"},
    {"from":"dev21.in1","to":"dev5.out15"}
  ],
    "tests":{   "number":4,
                "toSet":["A","B"],
                "toCheck":["OUT"],
                "A":[0,21845,65280,1337],
                "B":[-1,-1,65408,0],
                "OUT":[0,21845,-256,0]
                }
};


devices.OR16 = {
   "devices":[
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev0","x":48,"y":48,"label":"A"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev1","x":48,"y":192,"label":"B"},
    {"type":"CUSTOMBUSIN","numOutputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev2","x":616,"y":144,"label":"OUT"},
    {"type":"BusOut","numInputs":16,"immobile":true,"id":"dev3","x":520,"y":128,"label":"BusOut"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev4","x":144,"y":24,"label":"BusIn"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev5","x":144,"y":176,"label":"BusIn"},
    {"type":"OR","id":"dev6","x":336,"y":0,"label":"OR"},
    {"type":"OR","id":"dev7","x":336,"y":50,"label":"OR"},
    {"type":"OR","id":"dev8","x":336,"y":100,"label":"OR"},
    {"type":"OR","id":"dev9","x":336,"y":150,"label":"OR"},
    {"type":"OR","id":"dev10","x":336,"y":200,"label":"OR"},
    {"type":"OR","id":"dev11","x":336,"y":250,"label":"OR"},
    {"type":"OR","id":"dev12","x":336,"y":300,"label":"OR"},
    {"type":"OR","id":"dev13","x":336,"y":350,"label":"OR"},
    {"type":"OR","id":"dev14","x":336,"y":400,"label":"OR"},
    {"type":"OR","id":"dev15","x":336,"y":450,"label":"OR"},
    {"type":"OR","id":"dev16","x":336,"y":200,"label":"OR"},
    {"type":"OR","id":"dev17","x":336,"y":250,"label":"OR"},
    {"type":"OR","id":"dev18","x":336,"y":300,"label":"OR"},
    {"type":"OR","id":"dev19","x":336,"y":350,"label":"OR"},
    {"type":"OR","id":"dev20","x":336,"y":400,"label":"OR"},
    {"type":"OR","id":"dev21","x":336,"y":450,"label":"OR"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev3.out0"},
    {"from":"dev3.in0","to":"dev6.out0"},
    {"from":"dev3.in1","to":"dev7.out0"},
    {"from":"dev3.in2","to":"dev8.out0"},
    {"from":"dev3.in3","to":"dev9.out0"},
    {"from":"dev3.in4","to":"dev10.out0"},
    {"from":"dev3.in5","to":"dev11.out0"},
    {"from":"dev3.in6","to":"dev12.out0"},
    {"from":"dev3.in7","to":"dev13.out0"},
    {"from":"dev3.in8","to":"dev14.out0"},
    {"from":"dev3.in9","to":"dev15.out0"},
    {"from":"dev3.in10","to":"dev16.out0"},
    {"from":"dev3.in11","to":"dev17.out0"},
    {"from":"dev3.in12","to":"dev18.out0"},
    {"from":"dev3.in13","to":"dev19.out0"},
    {"from":"dev3.in14","to":"dev20.out0"},
    {"from":"dev3.in15","to":"dev21.out0"},
    {"from":"dev4.in0","to":"dev0.out0"},
    {"from":"dev5.in0","to":"dev1.out0"},
    {"from":"dev6.in0","to":"dev4.out0"},
    {"from":"dev6.in1","to":"dev5.out0"},
    {"from":"dev7.in0","to":"dev4.out1"},
    {"from":"dev7.in1","to":"dev5.out1"},
    {"from":"dev8.in0","to":"dev4.out2"},
    {"from":"dev8.in1","to":"dev5.out2"},
    {"from":"dev9.in0","to":"dev4.out3"},
    {"from":"dev9.in1","to":"dev5.out3"},
    {"from":"dev10.in0","to":"dev4.out4"},
    {"from":"dev10.in1","to":"dev5.out4"},
    {"from":"dev11.in0","to":"dev4.out5"},
    {"from":"dev11.in1","to":"dev5.out5"},
    {"from":"dev12.in0","to":"dev4.out6"},
    {"from":"dev12.in1","to":"dev5.out6"},
    {"from":"dev13.in0","to":"dev4.out7"},
    {"from":"dev13.in1","to":"dev5.out7"},
    {"from":"dev14.in0","to":"dev4.out8"},
    {"from":"dev14.in1","to":"dev5.out8"},
    {"from":"dev15.in0","to":"dev4.out9"},
    {"from":"dev15.in1","to":"dev5.out9"},
    {"from":"dev16.in0","to":"dev4.out10"},
    {"from":"dev16.in1","to":"dev5.out10"},
    {"from":"dev17.in0","to":"dev4.out11"},
    {"from":"dev17.in1","to":"dev5.out11"},
    {"from":"dev18.in0","to":"dev4.out12"},
    {"from":"dev18.in1","to":"dev5.out12"},
    {"from":"dev19.in0","to":"dev4.out13"},
    {"from":"dev19.in1","to":"dev5.out13"},
    {"from":"dev20.in0","to":"dev4.out14"},
    {"from":"dev20.in1","to":"dev5.out14"},
    {"from":"dev21.in0","to":"dev4.out15"},
    {"from":"dev21.in1","to":"dev5.out15"}
  ],
    "tests":{   "number":4,
                "toSet":["A","B"],
                "toCheck":["OUT"],
                "A":[0,43690,255,21845],
                "B":[-1,21845,32512,65280],
                "OUT":[-1,-1,32767,-171]
                }
};


devices.MUX16 = {
    "devices":[
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev0","x":48,"y":40,"label":"A"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev1","x":168,"y":16,"label":"BusIn"},
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"value":0,"id":"dev2","x":48,"y":232,"label":"B"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev3","x":168,"y":184,"label":"BusIn"},
    {"type":"CUSTOMBUSIN","numOutputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev4","x":650,"y":144,"label":"OUT"},
    {"type":"BusOut","numInputs":16,"immobile":true,"id":"dev5","x":536,"y":88,"label":"BusOut"},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev6","x":48,"y":328,"label":"SEL","state":{"on":false}},
    {"type":"MUX","id":"dev7","x":336,"y":0,"label":"MUX"},
    {"type":"MUX","id":"dev8","x":336,"y":100,"label":"MUX"},
    {"type":"MUX","id":"dev9","x":336,"y":200,"label":"MUX"},
    {"type":"MUX","id":"dev10","x":336,"y":300,"label":"MUX"},
    {"type":"MUX","id":"dev11","x":336,"y":400,"label":"MUX"},
    {"type":"MUX","id":"dev12","x":336,"y":500,"label":"MUX"},
    {"type":"MUX","id":"dev13","x":336,"y":600,"label":"MUX"},
    {"type":"MUX","id":"dev14","x":336,"y":700,"label":"MUX"},
    {"type":"MUX","id":"dev15","x":336,"y":800,"label":"MUX"},
    {"type":"MUX","id":"dev16","x":336,"y":900,"label":"MUX"},
    {"type":"MUX","id":"dev17","x":336,"y":1000,"label":"MUX"},
    {"type":"MUX","id":"dev18","x":336,"y":1100,"label":"MUX"},
    {"type":"MUX","id":"dev19","x":336,"y":1200,"label":"MUX"},
    {"type":"MUX","id":"dev20","x":336,"y":1300,"label":"MUX"},
    {"type":"MUX","id":"dev21","x":336,"y":1400,"label":"MUX"},
    {"type":"MUX","id":"dev22","x":336,"y":1500,"label":"MUX"}
   ],
    "connectors":[
    {"from":"dev1.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev2.out0"},
    {"from":"dev4.in0","to":"dev5.out0"},
    {"from":"dev5.in0","to":"dev7.out0"},
    {"from":"dev5.in1","to":"dev8.out0"},
    {"from":"dev5.in2","to":"dev9.out0"},
    {"from":"dev5.in3","to":"dev10.out0"},
    {"from":"dev5.in4","to":"dev11.out0"},
    {"from":"dev5.in5","to":"dev12.out0"},
    {"from":"dev5.in6","to":"dev13.out0"},
    {"from":"dev5.in7","to":"dev14.out0"},
    {"from":"dev5.in8","to":"dev15.out0"},
    {"from":"dev5.in9","to":"dev16.out0"},
    {"from":"dev5.in10","to":"dev17.out0"},
    {"from":"dev5.in11","to":"dev18.out0"},
    {"from":"dev5.in12","to":"dev19.out0"},
    {"from":"dev5.in13","to":"dev20.out0"},
    {"from":"dev5.in14","to":"dev21.out0"},
    {"from":"dev5.in15","to":"dev22.out0"},
    {"from":"dev7.in0","to":"dev1.out0"},
    {"from":"dev7.in1","to":"dev3.out0"},
    {"from":"dev7.in2","to":"dev6.out0"},
    {"from":"dev8.in0","to":"dev1.out1"},
    {"from":"dev8.in1","to":"dev3.out1"},
    {"from":"dev8.in2","to":"dev6.out0"},
    {"from":"dev9.in0","to":"dev1.out2"},
    {"from":"dev9.in1","to":"dev3.out2"},
    {"from":"dev9.in2","to":"dev6.out0"},
    {"from":"dev10.in0","to":"dev1.out3"},
    {"from":"dev10.in1","to":"dev3.out3"},
    {"from":"dev10.in2","to":"dev6.out0"},
    {"from":"dev11.in0","to":"dev1.out4"},
    {"from":"dev11.in1","to":"dev3.out4"},
    {"from":"dev11.in2","to":"dev6.out0"},
    {"from":"dev12.in0","to":"dev1.out5"},
    {"from":"dev12.in1","to":"dev3.out5"},
    {"from":"dev12.in2","to":"dev6.out0"},
    {"from":"dev13.in0","to":"dev1.out6"},
    {"from":"dev13.in1","to":"dev3.out6"},
    {"from":"dev13.in2","to":"dev6.out0"},
    {"from":"dev14.in0","to":"dev1.out7"},
    {"from":"dev14.in1","to":"dev3.out7"},
    {"from":"dev14.in2","to":"dev6.out0"},
    {"from":"dev15.in0","to":"dev1.out8"},
    {"from":"dev15.in1","to":"dev3.out8"},
    {"from":"dev15.in2","to":"dev6.out0"},
    {"from":"dev16.in0","to":"dev1.out9"},
    {"from":"dev16.in1","to":"dev3.out9"},
    {"from":"dev16.in2","to":"dev6.out0"},
    {"from":"dev17.in0","to":"dev1.out10"},
    {"from":"dev17.in1","to":"dev3.out10"},
    {"from":"dev17.in2","to":"dev6.out0"},
    {"from":"dev18.in0","to":"dev1.out11"},
    {"from":"dev18.in1","to":"dev3.out11"},
    {"from":"dev18.in2","to":"dev6.out0"},
    {"from":"dev19.in0","to":"dev1.out12"},
    {"from":"dev19.in1","to":"dev3.out12"},
    {"from":"dev19.in2","to":"dev6.out0"},
    {"from":"dev20.in0","to":"dev1.out13"},
    {"from":"dev20.in1","to":"dev3.out13"},
    {"from":"dev20.in2","to":"dev6.out0"},
    {"from":"dev21.in0","to":"dev1.out14"},
    {"from":"dev21.in1","to":"dev3.out14"},
    {"from":"dev21.in2","to":"dev6.out0"},
    {"from":"dev22.in0","to":"dev1.out15"},
    {"from":"dev22.in1","to":"dev3.out15"},
    {"from":"dev22.in2","to":"dev6.out0"}
    ],
    "tests":{   "number":4,
                "toSet":["A","B","SEL"],
                "toCheck":["OUT"],
                "A":[666,-1337,666,1337],
                "B":[-1,1,-1,1],
                "SEL":[0,1,1,0],
                "OUT":[666,1,-1,1337]
                }
};

devices.OR8WAY = {  "devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":0,"label":"A","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":50,"label":"B","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev2","x":50,"y":100,"label":"C","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev3","x":50,"y":150,"label":"D","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev4","x":50,"y":200,"label":"E","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev5","x":50,"y":250,"label":"F","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev6","x":50,"y":300,"label":"G","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev7","x":50,"y":350,"label":"H","state":{"on":false}},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev8","x":450,"y":170,"label":"OUT","state":{"on":false}},
    {"type":"OR","id":"dev9","x":136,"y":24,"label":"OR"},
    {"type":"OR","id":"dev10","x":136,"y":120,"label":"OR"},
    {"type":"OR","id":"dev11","x":136,"y":224,"label":"OR"},
    {"type":"OR","id":"dev12","x":136,"y":328,"label":"OR"},
    {"type":"OR","id":"dev13","x":232,"y":72,"label":"OR"},
    {"type":"OR","id":"dev14","x":232,"y":280,"label":"OR"},
    {"type":"OR","id":"dev15","x":328,"y":176,"label":"OR"}
  ],
  "connectors":[
    {"from":"dev8.in0","to":"dev15.out0"},
    {"from":"dev9.in0","to":"dev0.out0"},
    {"from":"dev9.in1","to":"dev1.out0"},
    {"from":"dev10.in0","to":"dev2.out0"},
    {"from":"dev10.in1","to":"dev3.out0"},
    {"from":"dev11.in0","to":"dev4.out0"},
    {"from":"dev11.in1","to":"dev5.out0"},
    {"from":"dev12.in0","to":"dev6.out0"},
    {"from":"dev12.in1","to":"dev7.out0"},
    {"from":"dev13.in0","to":"dev9.out0"},
    {"from":"dev13.in1","to":"dev10.out0"},
    {"from":"dev14.in0","to":"dev11.out0"},
    {"from":"dev14.in1","to":"dev12.out0"},
    {"from":"dev15.in0","to":"dev13.out0"},
    {"from":"dev15.in1","to":"dev14.out0"}
  ],
    "tests":{   "number":5,
                "toSet":["A","B","C","D","E","F","G","H"],
                "toCheck":["OUT"],
                "A":[0,1,0,0,0],
                "B":[0,0,1,0,1],
                "C":[0,0,0,1,1],
                "D":[0,0,1,0,1],
                "E":[0,0,0,0,1],
                "F":[0,0,1,1,1],
                "G":[0,0,0,1,1],
                "H":[0,0,1,0,1],
                "OUT":[0,1,1,1,1]
                }

};

devices.MUX4WAY16 = {
 "devices":[
    {"type":"MUX16","id":"dev0","x":256,"y":32,"label":"MUX16"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev1","x":40,"y":32,"label":"A"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev2","x":40,"y":96,"label":"B"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev3","x":40,"y":160,"label":"C"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev4","x":40,"y":224,"label":"D"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"numInputs":2,"immobile":true,"id":"dev5","x":40,"y":280,"label":"SEL"},
    {"type":"BusIn","immobile":true,"numOutputs":2,"id":"dev6","x":120,"y":280,"label":"BusIn"},
    {"type":"CUSTOMBUSIN","numOutputs":16,"immobile":true,"id":"dev7","x":480,"y":176,"label":"OUT"},
    {"type":"MUX16","id":"dev8","x":360,"y":112,"label":"MUX16"},
    {"type":"MUX16","id":"dev9","x":240,"y":272,"label":"MUX16"}
  ],
  "connectors":[
    {"from":"dev0.in0","to":"dev1.out0"},
    {"from":"dev0.in1","to":"dev2.out0"},
    {"from":"dev0.in2","to":"dev6.out0"},
    {"from":"dev6.in0","to":"dev5.out0"},
    {"from":"dev7.in0","to":"dev8.out0"},
    {"from":"dev8.in0","to":"dev0.out0"},
    {"from":"dev8.in1","to":"dev9.out0"},
    {"from":"dev8.in2","to":"dev6.out1"},
    {"from":"dev9.in0","to":"dev3.out0"},
    {"from":"dev9.in1","to":"dev4.out0"},
    {"from":"dev9.in2","to":"dev6.out0"}
  ],
    "tests":{   "number":4,
                "toSet":["A","B","C","D","SEL"],
                "toCheck":["OUT"],
                "A":[1337,-1337,666,666],
                "B":[-1,1,-1,1],
                "C":[65,66,67,68],
                "D":[100,99,98,97],
                "SEL":[0,1,2,3],
                "OUT":[1337,1,67,97]
                }

};


devices.MUX8WAY16 = {  "devices":[
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev0","x":40,"y":0,"label":"A","isBus":true,"value":0},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev1","x":40,"y":45,"label":"B","isBus":true,"value":0},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev2","x":40,"y":90,"label":"C","isBus":true,"value":0},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev3","x":40,"y":135,"label":"D","isBus":true,"value":0},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev4","x":40,"y":180,"label":"E","isBus":true,"value":0},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev5","x":40,"y":225,"label":"F","isBus":true,"value":0},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev6","x":40,"y":270,"label":"G","isBus":true,"value":0},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"id":"dev7","x":40,"y":315,"label":"H","isBus":true,"value":0},
    {"type":"CUSTOMBUSOUT","numInputs":3,"immobile":true,"id":"dev8","x":40,"y":355,"label":"SEL","isBus":true,"value":0},
    {"type":"CUSTOMBUSIN","numOutputs":16,"immobile":true,"id":"dev9","x":480,"y":176,"label":"OUT","isBus":true,"value":0},
    {"type":"MUX16","id":"dev10","x":384,"y":160,"label":"MUX16"},
    {"type":"MUX4WAY16","id":"dev11","x":272,"y":184,"label":"MUX4WAY16"},
    {"type":"MUX4WAY16","id":"dev12","x":272,"y":40,"label":"MUX4WAY16"},
    {"type":"BusIn","numOutputs":3,"id":"dev13","x":120,"y":320,"label":"BusIn"},
    {"type":"BusOut","numInputs":2,"id":"dev14","x":200,"y":320,"label":"BusOut"}
  ],
  "connectors":[
    {"from":"dev9.in0","to":"dev10.out0"},
    {"from":"dev10.in0","to":"dev12.out0"},
    {"from":"dev10.in1","to":"dev11.out0"},
    {"from":"dev10.in2","to":"dev13.out2"},
    {"from":"dev11.in0","to":"dev4.out0"},
    {"from":"dev11.in1","to":"dev5.out0"},
    {"from":"dev11.in2","to":"dev6.out0"},
    {"from":"dev11.in3","to":"dev7.out0"},
    {"from":"dev11.in4","to":"dev14.out0"},
    {"from":"dev12.in0","to":"dev0.out0"},
    {"from":"dev12.in1","to":"dev1.out0"},
    {"from":"dev12.in2","to":"dev2.out0"},
    {"from":"dev12.in3","to":"dev3.out0"},
    {"from":"dev12.in4","to":"dev14.out0"},
    {"from":"dev13.in0","to":"dev8.out0"},
    {"from":"dev14.in0","to":"dev13.out0"},
    {"from":"dev14.in1","to":"dev13.out1"}
  ],
    "tests":{   "number":8,
                "toSet":["A","B","C","D","E","F","G","H","SEL"],
                "toCheck":["OUT"],
                "A":[1337,-1337,666,666,1337,-1337,666,666],
                "B":[-1,1,-1,1,-1,1,-1,1],
                "C":[65,66,67,68,65,66,67,68],
                "D":[100,99,98,97,100,99,98,97],
                "E":[-1,-2,-3,-4,-5,-6,-7,-8],
                "F":[1,1,2,3,5,8,13,21],
                "G":[2,4,8,32,64,128,256,512],
                "H":[0,0,0,0,0,0,0,0],
                "SEL":[0,1,2,3,4,5,6,7],
                "OUT":[1337,1,67,97,-5,8,256,0]
                }

};

devices.HALFADDER = {
	"devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":88,"y":168,"label":"A"},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":88,"y":72,"label":"B"},
    {"type":"XOR","id":"dev2","x":240,"y":72,"label":"XOR"},
    {"type":"AND","id":"dev3","x":248,"y":168,"label":"AND"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev4","x":400,"y":72,"label":"SUM"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev5","x":400,"y":168,"label":"CARRY"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev1.out0"},
    {"from":"dev2.in1","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev1.out0"},
    {"from":"dev3.in1","to":"dev0.out0"},
    {"from":"dev4.in0","to":"dev2.out0"},
    {"from":"dev5.in0","to":"dev3.out0"}
  ],
    "tests":{   "number":4,
                "toSet":["A","B"],
                "toCheck":["SUM","CARRY"],
                "A":[0,1,0,1],
                "B":[0,0,1,1],
                "SUM":[0,1,1,0],
                "CARRY":[0,0,0,1]
            }
}

devices.FULLADDER = {
	"devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":56,"y":40,"label":"A"},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":56,"y":120,"label":"B"},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev2","x":56,"y":200,"label":"C"},
    {"type":"HALFADDER","id":"dev3","x":144,"y":160,"label":"HALFADDER"},
    {"type":"HALFADDER","id":"dev4","x":240,"y":72,"label":"HALFADDER"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev5","x":432,"y":160,"label":"CARRY"},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev6","x":440,"y":64,"label":"SUM"},
    {"type":"OR","id":"dev7","x":344,"y":160,"label":"OR"}
  ],
  "connectors":[
    {"from":"dev3.in0","to":"dev1.out0"},
    {"from":"dev3.in1","to":"dev2.out0"},
    {"from":"dev4.in0","to":"dev0.out0"},
    {"from":"dev4.in1","to":"dev3.out0"},
    {"from":"dev5.in0","to":"dev7.out0"},
    {"from":"dev6.in0","to":"dev4.out0"},
    {"from":"dev7.in0","to":"dev4.out1"},
    {"from":"dev7.in1","to":"dev3.out1"}
  ],
    "tests":{   "number":8,
                "toSet":["A","B","C"],
                "toCheck":["SUM","CARRY"],
                "A":[0,1,0,1,0,1,0,1],
                "B":[0,0,1,1,0,0,1,1],
                "C":[0,0,0,0,1,1,1,1],
                "SUM":  [0,1,1,0,1,0,0,1],
                "CARRY":[0,0,0,1,0,1,1,1]
            }
}

devices.ADD16 = {
	"devices":[
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev0","x":40,"y":32,"label":"A"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev1","x":40,"y":160,"label":"B"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev2","x":144,"y":16,"label":"BusIn"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev3","x":144,"y":200,"label":"BusIn"},
    {"type":"BusOut","numInputs":16,"immobile":true,"id":"dev4","x":536,"y":104,"label":"BusOut"},
    {"type":"CUSTOMBUSIN","numOutputs":16,"immobile":true,"isBus":true,"value":0,"id":"dev5","x":624,"y":128,"label":"OUT"},
    {"type":"FULLADDER","id":"dev6","x":312,"y":8,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev7","x":312,"y":72,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev8","x":312,"y":136,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev9","x":312,"y":210,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev10","x":312,"y":280,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev11","x":312,"y":350,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev12","x":312,"y":420,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev13","x":312,"y":490,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev14","x":312,"y":560,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev15","x":312,"y":660,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev16","x":312,"y":760,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev17","x":312,"y":860,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev18","x":312,"y":960,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev19","x":312,"y":1060,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev20","x":312,"y":1160,"label":"FULLADDER"},
    {"type":"FULLADDER","id":"dev21","x":312,"y":1260,"label":"FULLADDER"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev1.out0"},
    {"from":"dev4.in0","to":"dev6.out1"},
    {"from":"dev4.in1","to":"dev7.out1"},
    {"from":"dev4.in2","to":"dev8.out1"},
    {"from":"dev4.in3","to":"dev9.out1"},
    {"from":"dev4.in4","to":"dev10.out1"},
    {"from":"dev4.in5","to":"dev11.out1"},
    {"from":"dev4.in6","to":"dev12.out1"},
    {"from":"dev4.in7","to":"dev13.out1"},
    {"from":"dev4.in8","to":"dev14.out1"},
    {"from":"dev4.in9","to":"dev15.out1"},
    {"from":"dev4.in10","to":"dev16.out1"},
    {"from":"dev4.in11","to":"dev17.out1"},
    {"from":"dev4.in12","to":"dev18.out1"},
    {"from":"dev4.in13","to":"dev19.out1"},
    {"from":"dev4.in14","to":"dev20.out1"},
    {"from":"dev4.in15","to":"dev21.out1"},
    {"from":"dev5.in0","to":"dev4.out0"},
    {"from":"dev6.in0","to":"dev2.out0"},
    {"from":"dev6.in1","to":"dev3.out0"},
    {"from":"dev7.in0","to":"dev2.out1"},
    {"from":"dev7.in1","to":"dev3.out1"},
    {"from":"dev7.in2","to":"dev6.out0"},
    {"from":"dev8.in0","to":"dev2.out2"},
    {"from":"dev9.in0","to":"dev2.out3"},
    {"from":"dev10.in0","to":"dev2.out4"},
    {"from":"dev11.in0","to":"dev2.out5"},
    {"from":"dev12.in0","to":"dev2.out6"},
    {"from":"dev13.in0","to":"dev2.out7"},
    {"from":"dev14.in0","to":"dev2.out8"},
    {"from":"dev15.in0","to":"dev2.out9"},
    {"from":"dev16.in0","to":"dev2.out10"},
    {"from":"dev17.in0","to":"dev2.out11"},
    {"from":"dev18.in0","to":"dev2.out12"},
    {"from":"dev19.in0","to":"dev2.out13"},
    {"from":"dev20.in0","to":"dev2.out14"},
    {"from":"dev21.in0","to":"dev2.out15"},
    {"from":"dev8.in1","to":"dev3.out2"},
    {"from":"dev9.in1","to":"dev3.out3"},
    {"from":"dev10.in1","to":"dev3.out4"},
    {"from":"dev11.in1","to":"dev3.out5"},
    {"from":"dev12.in1","to":"dev3.out6"},
    {"from":"dev13.in1","to":"dev3.out7"},
    {"from":"dev14.in1","to":"dev3.out8"},
    {"from":"dev15.in1","to":"dev3.out9"},
    {"from":"dev16.in1","to":"dev3.out10"},
    {"from":"dev17.in1","to":"dev3.out11"},
    {"from":"dev18.in1","to":"dev3.out12"},
    {"from":"dev19.in1","to":"dev3.out13"},
    {"from":"dev20.in1","to":"dev3.out14"},
    {"from":"dev21.in1","to":"dev3.out15"},
    {"from":"dev8.in2","to":"dev7.out0"},
    {"from":"dev9.in2","to":"dev8.out0"},
    {"from":"dev10.in2","to":"dev9.out0"},
    {"from":"dev11.in2","to":"dev10.out0"},
    {"from":"dev12.in2","to":"dev11.out0"},
    {"from":"dev13.in2","to":"dev12.out0"},
    {"from":"dev14.in2","to":"dev13.out0"},
    {"from":"dev15.in2","to":"dev14.out0"},
    {"from":"dev16.in2","to":"dev15.out0"},
    {"from":"dev17.in2","to":"dev16.out0"},
    {"from":"dev18.in2","to":"dev17.out0"},
    {"from":"dev19.in2","to":"dev18.out0"},
    {"from":"dev20.in2","to":"dev19.out0"},
    {"from":"dev21.in2","to":"dev20.out0"}
  ],
    "tests":{   "number":5,
                "toSet":["A","B"],
                "toCheck":["OUT"],
                "A":[671,512,-5,32767,20000],
                "B":[666,-256,-1337,1,20000],
                "OUT":[1337,256,-1342,-32768,-25536]
            }
}

devices.INC16 = {
	"devices":[
    {"type":"DC","id":"dev0","x":56,"y":176,"label":"DC"},
    {"type":"BusOut","numInputs":16,"id":"dev1","x":168,"y":184,"label":"BusOut"},
    {"type":"CUSTOMBUSOUT","numInputs":16,"id":"dev2","x":56,"y":64,"label":"IN"},
    {"type":"ADD16","id":"dev3","x":304,"y":112,"label":"ADD16"},
    {"type":"CUSTOMBUSIN","numOutputs":16,"id":"dev4","x":464,"y":112,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev1.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev2.out0"},
    {"from":"dev3.in1","to":"dev1.out0"},
    {"from":"dev4.in0","to":"dev3.out0"}
  ],
    "tests":{   "number":4,
                "toSet":["IN"],
                "toCheck":["OUT"],
                "IN":[5,-1338,32767,-1],
                "OUT":[6,-1337,-32768,0,]
            }
}

devices.DFF = {"devices":[
    {"type":"NAND","id":"dev0","x":240,"y":184,"label":"NAND"},
    {"type":"NAND","id":"dev1","x":176,"y":88,"label":"NAND"},
    {"type":"NAND","id":"dev2","x":336,"y":80,"label":"NAND"},
    {"type":"NOT","id":"dev3","x":160,"y":160,"label":"NOT"},
    {"type":"NAND","id":"dev4","x":336,"y":176,"label":"NAND"},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev5","x":40,"y":80,"label":"IN","state":{"on":false}},
    {"type":"OSC","freq":10,"id":"dev6","x":40,"y":200,"label":"OSC"},
    {"type":"LED","immobile":true,"id":"dev7","x":456,"y":136,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev0.in0","to":"dev3.out0"},
    {"from":"dev0.in1","to":"dev6.out0"},
    {"from":"dev1.in0","to":"dev5.out0"},
    {"from":"dev1.in1","to":"dev6.out0"},
    {"from":"dev2.in0","to":"dev1.out0"},
    {"from":"dev2.in1","to":"dev4.out0"},
    {"from":"dev3.in0","to":"dev5.out0"},
    {"from":"dev4.in0","to":"dev2.out0"},
    {"from":"dev4.in1","to":"dev0.out0"},
    {"from":"dev7.in0","to":"dev2.out0"}
  ]
}

devices.BIT = {"devices":[
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev0","x":456,"y":136,"label":"OUT"},
    {"type":"DFF","id":"dev1","x":304,"y":208,"label":"DFF"},
    {"type":"OSC","immobile":true,"freq":10,"id":"dev2","x":32,"y":224,"label":"OSC"},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev3","x":32,"y":40,"label":"IN","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev4","x":32,"y":120,"label":"LOAD","state":{"on":true}},
    {"type":"MUX","id":"dev5","x":208,"y":112,"label":"MUX"}
  ],
  "connectors":[
    {"from":"dev0.in0","to":"dev1.out0"},
    {"from":"dev1.in0","to":"dev5.out0"},
    {"from":"dev1.in1","to":"dev2.out0"},
    {"from":"dev5.in0","to":"dev1.out0"},
    {"from":"dev5.in1","to":"dev3.out0"},
    {"from":"dev5.in2","to":"dev4.out0"}
  ]
}


devices.REGISTER = {  "devices":[
    {"type":"CUSTOMBUSIN","numInputs":16,"immobile":true,"id":"dev0","x":456,"y":136,"label":"OUT","state":{"on":false},"isBus":true,"value":0,"numOutputs":16},
    {"type":"OSC","immobile":true,"freq":10,"id":"dev1","x":32,"y":224,"label":"OSC"},
    {"type":"CUSTOMBUSOUT","immobile":true,"numOutputs":16,"id":"dev2","x":32,"y":40,"label":"IN","state":{"on":false},"isBus":true,"numInputs":16,"value":0},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev3","x":32,"y":120,"label":"LOAD","state":{"on":true}},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev4","x":96,"y":16,"label":"BusIn"},
    {"type":"BusOut","numInputs":16,"immobile":true,"id":"dev5","x":400,"y":112,"label":"BusOut"},
    {"type":"BIT","id":"dev6","x":248,"y":0,"label":"BIT"},
    {"type":"BIT","id":"dev7","x":248,"y":50,"label":"BIT"},
    {"type":"BIT","id":"dev8","x":248,"y":100,"label":"BIT"},
    {"type":"BIT","id":"dev9","x":248,"y":150,"label":"BIT"},
    {"type":"BIT","id":"dev10","x":248,"y":200,"label":"BIT"},
    {"type":"BIT","id":"dev11","x":248,"y":250,"label":"BIT"},
    {"type":"BIT","id":"dev12","x":248,"y":300,"label":"BIT"},
    {"type":"BIT","id":"dev13","x":248,"y":350,"label":"BIT"},
    {"type":"BIT","id":"dev14","x":248,"y":400,"label":"BIT"},
    {"type":"BIT","id":"dev15","x":248,"y":450,"label":"BIT"},
    {"type":"BIT","id":"dev16","x":248,"y":500,"label":"BIT"},
    {"type":"BIT","id":"dev17","x":248,"y":550,"label":"BIT"},
    {"type":"BIT","id":"dev18","x":248,"y":600,"label":"BIT"},
    {"type":"BIT","id":"dev19","x":248,"y":650,"label":"BIT"},
    {"type":"BIT","id":"dev20","x":248,"y":700,"label":"BIT"},
    {"type":"BIT","id":"dev21","x":248,"y":750,"label":"BIT"}
  ],
  "connectors":[
    {"from":"dev0.in0","to":"dev5.out0"},
    {"from":"dev4.in0","to":"dev2.out0"},
    {"from":"dev5.in0","to":"dev6.out0"},
    {"from":"dev5.in1","to":"dev7.out0"},
    {"from":"dev5.in2","to":"dev8.out0"},
    {"from":"dev5.in3","to":"dev9.out0"},
    {"from":"dev5.in4","to":"dev10.out0"},
    {"from":"dev5.in5","to":"dev11.out0"},
    {"from":"dev5.in6","to":"dev12.out0"},
    {"from":"dev5.in7","to":"dev13.out0"},
    {"from":"dev5.in8","to":"dev14.out0"},
    {"from":"dev5.in9","to":"dev15.out0"},
    {"from":"dev5.in10","to":"dev16.out0"},
    {"from":"dev5.in11","to":"dev17.out0"},
    {"from":"dev5.in12","to":"dev18.out0"},
    {"from":"dev5.in13","to":"dev19.out0"},
    {"from":"dev5.in14","to":"dev20.out0"},
    {"from":"dev5.in15","to":"dev21.out0"},
    {"from":"dev6.in0","to":"dev4.out0"},
    {"from":"dev6.in1","to":"dev3.out0"},
    {"from":"dev6.in2","to":"dev1.out0"},
    {"from":"dev7.in0","to":"dev4.out1"},
    {"from":"dev7.in1","to":"dev3.out0"},
    {"from":"dev7.in2","to":"dev1.out0"},
    {"from":"dev8.in0","to":"dev4.out2"},
    {"from":"dev8.in1","to":"dev3.out0"},
    {"from":"dev8.in2","to":"dev1.out0"},
    {"from":"dev9.in0","to":"dev4.out3"},
    {"from":"dev9.in1","to":"dev3.out0"},
    {"from":"dev9.in2","to":"dev1.out0"},
    {"from":"dev10.in0","to":"dev4.out4"},
    {"from":"dev10.in1","to":"dev3.out0"},
    {"from":"dev10.in2","to":"dev1.out0"},
    {"from":"dev11.in0","to":"dev4.out5"},
    {"from":"dev11.in1","to":"dev3.out0"},
    {"from":"dev11.in2","to":"dev1.out0"},
    {"from":"dev12.in0","to":"dev4.out6"},
    {"from":"dev12.in1","to":"dev3.out0"},
    {"from":"dev12.in2","to":"dev1.out0"},
    {"from":"dev13.in0","to":"dev4.out7"},
    {"from":"dev13.in1","to":"dev3.out0"},
    {"from":"dev13.in2","to":"dev1.out0"},
    {"from":"dev14.in0","to":"dev4.out8"},
    {"from":"dev14.in1","to":"dev3.out0"},
    {"from":"dev14.in2","to":"dev1.out0"},
    {"from":"dev15.in0","to":"dev4.out9"},
    {"from":"dev15.in1","to":"dev3.out0"},
    {"from":"dev15.in2","to":"dev1.out0"},
    {"from":"dev16.in0","to":"dev4.out10"},
    {"from":"dev16.in1","to":"dev3.out0"},
    {"from":"dev16.in2","to":"dev1.out0"},
    {"from":"dev17.in0","to":"dev4.out11"},
    {"from":"dev17.in1","to":"dev3.out0"},
    {"from":"dev17.in2","to":"dev1.out0"},
    {"from":"dev18.in0","to":"dev4.out12"},
    {"from":"dev18.in1","to":"dev3.out0"},
    {"from":"dev18.in2","to":"dev1.out0"},
    {"from":"dev19.in0","to":"dev4.out13"},
    {"from":"dev19.in1","to":"dev3.out0"},
    {"from":"dev19.in2","to":"dev1.out0"},
    {"from":"dev20.in0","to":"dev4.out14"},
    {"from":"dev20.in1","to":"dev3.out0"},
    {"from":"dev20.in2","to":"dev1.out0"},
    {"from":"dev21.in0","to":"dev4.out15"},
    {"from":"dev21.in1","to":"dev3.out0"},
    {"from":"dev21.in2","to":"dev1.out0"}
  ]
}

devices.ALU = {  "devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":32,"y":112,"label":"ZX","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":32,"y":160,"label":"NX","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev2","x":32,"y":208,"label":"ZY","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev3","x":32,"y":256,"label":"NY","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev4","x":32,"y":304,"label":"F","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev5","x":32,"y":352,"label":"NO","state":{"on":false}},
    {"type":"CUSTOMBUSOUT","immobile":true,"numInputs":16,"id":"dev6","x":32,"y":64,"label":"Y","isBus":true,"value":0},
    {"type":"CUSTOMBUSOUT","immobile":true,"numInputs":16,"id":"dev7","x":32,"y":8,"label":"X","isBus":true,"value":0},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev8","x":648,"y":216,"label":"ZR","state":{"on":true}},
    {"type":"CUSTOMBUSIN","immobile":true,"numInputs":16,"id":"dev9","x":648,"y":120,"label":"OUT","isBus":true,"value":0,"numOutputs":16},
    {"type":"SINGLEOUTPUT","immobile":true,"id":"dev10","x":648,"y":328,"label":"NG","state":{"on":false}},
    {"type":"NOT16","id":"dev11","x":192,"y":8,"label":"NOT16"},
    {"type":"MUX16","id":"dev12","x":112,"y":56,"label":"MUX16","layout":{"rows":6,"cols":8,"hideLabelOnWorkspace":false,"nodes":{"A":"L1","B":"L3","SEL":"L5","OUT":"R3"}}},
    {"type":"MUX16","id":"dev13","x":96,"y":192,"label":"MUX16","layout":{"rows":6,"cols":8,"hideLabelOnWorkspace":false,"nodes":{"A":"L1","B":"L3","SEL":"L5","OUT":"R3"}}},
    {"type":"NOT16","id":"dev14","x":152,"y":152,"label":"NOT16"},
    {"type":"MUX16","id":"dev15","x":184,"y":224,"label":"MUX16","layout":{"rows":6,"cols":8,"hideLabelOnWorkspace":false,"nodes":{"A":"L1","B":"L3","SEL":"L5","OUT":"R3"}}},
    {"type":"MUX16","id":"dev16","x":240,"y":88,"label":"MUX16","layout":{"rows":6,"cols":8,"hideLabelOnWorkspace":false,"nodes":{"A":"L1","B":"L3","SEL":"L5","OUT":"R3"}}},
    {"type":"AND16","id":"dev17","x":312,"y":128,"label":"AND16"},
    {"type":"ADD16","id":"dev18","x":288,"y":200,"label":"ADD16"},
    {"type":"MUX16","layout":{"rows":6,"cols":8,"hideLabelOnWorkspace":false,"nodes":{"A":"L1","B":"L3","SEL":"L5","OUT":"R3"}},"id":"dev19","x":368,"y":232,"label":"MUX16"},
    {"type":"NOT16","id":"dev20","x":424,"y":272,"label":"NOT16"},
    {"type":"MUX16","layout":{"rows":6,"cols":8,"hideLabelOnWorkspace":false,"nodes":{"A":"L1","B":"L3","SEL":"L5","OUT":"R3"}},"id":"dev21","x":480,"y":224,"label":"MUX16"},
    {"type":"BusIn","numOutputs":16,"id":"dev22","x":472,"y":24,"label":"BusIn"},
    {"type":"OR8WAY","id":"dev23","x":544,"y":24,"label":"OR8WAY"},
    {"type":"OR8WAY","id":"dev24","x":544,"y":112,"label":"OR8WAY"},
    {"type":"OR","id":"dev25","x":592,"y":72,"label":"OR"},
    {"type":"NOT","id":"dev26","x":568,"y":272,"label":"NOT"}
  ],
  "connectors":[
    {"from":"dev8.in0","to":"dev26.out0"},
    {"from":"dev9.in0","to":"dev21.out0"},
    {"from":"dev10.in0","to":"dev22.out15"},
    {"from":"dev11.in0","to":"dev12.out0"},
    {"from":"dev12.in0","to":"dev7.out0"},
    {"from":"dev12.in2","to":"dev0.out0"},
    {"from":"dev13.in0","to":"dev6.out0"},
    {"from":"dev13.in2","to":"dev2.out0"},
    {"from":"dev14.in0","to":"dev13.out0"},
    {"from":"dev15.in0","to":"dev13.out0"},
    {"from":"dev15.in1","to":"dev14.out0"},
    {"from":"dev15.in2","to":"dev3.out0"},
    {"from":"dev16.in0","to":"dev12.out0"},
    {"from":"dev16.in1","to":"dev11.out0"},
    {"from":"dev16.in2","to":"dev1.out0"},
    {"from":"dev17.in0","to":"dev16.out0"},
    {"from":"dev17.in1","to":"dev15.out0"},
    {"from":"dev18.in0","to":"dev16.out0"},
    {"from":"dev18.in1","to":"dev15.out0"},
    {"from":"dev19.in0","to":"dev17.out0"},
    {"from":"dev19.in1","to":"dev18.out0"},
    {"from":"dev19.in2","to":"dev4.out0"},
    {"from":"dev20.in0","to":"dev19.out0"},
    {"from":"dev21.in0","to":"dev19.out0"},
    {"from":"dev21.in1","to":"dev20.out0"},
    {"from":"dev21.in2","to":"dev5.out0"},
    {"from":"dev22.in0","to":"dev21.out0"},
    {"from":"dev23.in0","to":"dev22.out0"},
    {"from":"dev23.in1","to":"dev22.out1"},
    {"from":"dev23.in2","to":"dev22.out2"},
    {"from":"dev23.in3","to":"dev22.out3"},
    {"from":"dev23.in4","to":"dev22.out4"},
    {"from":"dev23.in5","to":"dev22.out5"},
    {"from":"dev23.in6","to":"dev22.out6"},
    {"from":"dev23.in7","to":"dev22.out7"},
    {"from":"dev24.in0","to":"dev22.out8"},
    {"from":"dev24.in1","to":"dev22.out9"},
    {"from":"dev24.in2","to":"dev22.out10"},
    {"from":"dev24.in3","to":"dev22.out11"},
    {"from":"dev24.in4","to":"dev22.out12"},
    {"from":"dev24.in5","to":"dev22.out13"},
    {"from":"dev24.in6","to":"dev22.out14"},
    {"from":"dev24.in7","to":"dev22.out15"},
    {"from":"dev25.in0","to":"dev23.out0"},
    {"from":"dev25.in1","to":"dev24.out0"},
    {"from":"dev26.in0","to":"dev25.out0"}
  ],
    "tests":{   "number":36,
                "toSet":["X","Y","ZX","NX","ZY","NY","F","NO"],
                "toCheck":["OUT","ZR","NG"],
                "IN":[5,-1338,32767,-1],
                "OUT":[6,-1337,-32768,0,],
                'X': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17],
                'Y': [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
                'ZX': [1,1,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0],
                'NX': [0,1,1,0,1,0,1,0,1,1,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,0,1,1,1,0,1,0,1,0,0,1],
                'ZY': [1,1,1,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,1,1,1,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0],
                'NY': [0,1,0,1,0,1,0,1,0,1,1,1,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,0,0,1,0,1],
                'F': [1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0],
                'NO': [0,1,0,0,0,1,1,1,1,1,1,0,0,0,1,1,0,1,0,1,0,0,0,1,1,1,1,1,1,0,0,0,1,1,0,1],
                'OUT': [0,1,-1,0,-1,-1,0,0,1,1,0,-1,-2,-1,1,-1,0,-1,0,1,-1,17,3,-18,-4,-17,-3,18,4,16,2,20,14,-14,1,19],
                'ZR': [1,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                'NG': [0,0,1,0,1,1,0,0,0,0,0,1,1,1,0,1,0,1,0,0,1,0,0,1,1,1,1,0,0,0,0,0,0,1,0,0] }
}

devices.DMUX4WAY = {  "devices":[
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev0","x":400,"y":128,"label":"A"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev1","x":400,"y":192,"label":"B"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev2","x":400,"y":256,"label":"C"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev3","x":400,"y":320,"label":"D"},
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"numInputs":2,"id":"dev4","x":40,"y":136,"label":"SEL"},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev5","x":40,"y":32,"label":"IN","state":{"on":false}},
    {"type":"BusIn","immobile":true,"numOutputs":2,"id":"dev6","x":144,"y":120,"label":"BusIn"},
    {"type":"DMUX","id":"dev7","x":208,"y":80,"label":"DMUX"},
    {"type":"DMUX","id":"dev8","x":288,"y":112,"label":"DMUX"},
    {"type":"DMUX","id":"dev9","x":272,"y":176,"label":"DMUX"}
  ],
  "connectors":[
    {"from":"dev0.in0","to":"dev8.out0"},
    {"from":"dev1.in0","to":"dev8.out1"},
    {"from":"dev2.in0","to":"dev9.out0"},
    {"from":"dev3.in0","to":"dev9.out1"},
    {"from":"dev6.in0","to":"dev4.out0"},
    {"from":"dev7.in0","to":"dev5.out0"},
    {"from":"dev7.in1","to":"dev6.out1"},
    {"from":"dev8.in0","to":"dev7.out0"},
    {"from":"dev8.in1","to":"dev6.out0"},
    {"from":"dev9.in0","to":"dev7.out1"},
    {"from":"dev9.in1","to":"dev6.out0"}
  ]

}

devices.DMUX8WAY = {   "devices":[
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev0","x":400,"y":0,"label":"A"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev1","x":400,"y":50,"label":"B"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev2","x":400,"y":100,"label":"C"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev3","x":400,"y":150,"label":"D"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev4","x":400,"y":200,"label":"E"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev5","x":400,"y":250,"label":"F"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev6","x":400,"y":300,"label":"G"},
    {"type":"SINGLEOUTPUT","immobile":true,"state":{"on":false},"id":"dev7","x":400,"y":350,"label":"H"},
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"numInputs":3,"id":"dev8","x":40,"y":136,"label":"SEL","value":0},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev9","x":40,"y":32,"label":"IN","state":{"on":false}},
    {"type":"BusIn","immobile":true,"numOutputs":3,"id":"dev10","x":120,"y":136,"label":"BusIn"},
    {"type":"BusOut","immobile":true,"numInputs":2,"id":"dev11","x":184,"y":136,"label":"BusOut"},
    {"type":"DMUX4WAY","id":"dev12","x":288,"y":24,"label":"DMUX4WAY"},
    {"type":"DMUX4WAY","id":"dev13","x":280,"y":152,"label":"DMUX4WAY"},
    {"type":"DMUX","id":"dev14","x":168,"y":32,"label":"DMUX"}
  ],
  "connectors":[
    {"from":"dev0.in0","to":"dev12.out0"},
    {"from":"dev1.in0","to":"dev12.out1"},
    {"from":"dev2.in0","to":"dev12.out2"},
    {"from":"dev3.in0","to":"dev12.out3"},
    {"from":"dev4.in0","to":"dev13.out0"},
    {"from":"dev5.in0","to":"dev13.out1"},
    {"from":"dev6.in0","to":"dev13.out2"},
    {"from":"dev7.in0","to":"dev13.out3"},
    {"from":"dev10.in0","to":"dev8.out0"},
    {"from":"dev11.in0","to":"dev10.out0"},
    {"from":"dev11.in1","to":"dev10.out1"},
    {"from":"dev12.in0","to":"dev14.out0"},
    {"from":"dev12.in1","to":"dev11.out0"},
    {"from":"dev13.in0","to":"dev14.out1"},
    {"from":"dev13.in1","to":"dev11.out0"},
    {"from":"dev14.in0","to":"dev9.out0"},
    {"from":"dev14.in1","to":"dev10.out2"}
  ]


}

devices.RAM8 = {

}
 

