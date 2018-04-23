//each toolbox inside contains the components required to build the desired chip
var thingsToBuild = ['NOT','AND','OR','XOR','MUX','DMUX','NOT16','AND16','OR16','MUX16','OR8WAY','MUX4WAY16','MUX8WAY16','DMUX4WAY','DMUX8WAY','HALFADDER','FULLADDER','ADD16','INC16','ALU','DFF','BIT','REGISTER','RAM8','RAM64','RAM512','RAM4K','RAM16K','PC'];
var toolboxes = {}; // the toolbox required for each component to be built
var devices = {}; //the setup required for each component to be built

// TOOLBOXES
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
                       {"type":"MUX16"}]; 
toolboxes.DMUX4WAY = [{"type":"DMUX"}]; 
toolboxes.DMUX8WAY = [{"type":"DMUX"},
                       {"type":"DMUX4WAY"}]; 




// CHIPS
toolboxes.HALFADDER = [{"type":"AND"},
                       {"type":"XOR"}]; 

toolboxes.FULLADDER = [{"type":"HALFADDER"},
                       {"type":"OR"}]; 


toolboxes.ADD16 = [{"type":"HALFADDER"},
                   {"type":"FULLADDER"}]; 

toolboxes.INC16 = [{"type":"ADD16"}]; //todo NEEDS A TRUE GATE

toolboxes.ALU = [{"type":"MUX16"},
                   {"type":"NOT16"},
                   {"type":"ADD16"},
                   {"type":"OR8WAY"},
                   {"type":"OR"},
                   {"type":"NOT"}]; 

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


// SETUP

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
    {"type":"CUSTOMBUSIN","immobile":true,"isBus":true,"value":0,"id":"dev0","x":616,"y":144,"label":"OUT"},
    {"type":"BusOut","numInputs":16,"immobile":true,"id":"dev1","x":520,"y":128,"label":"BusOut"},
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"value":8,"id":"dev2","x":48,"y":152,"label":"IN"},
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
  ]};

devices.AND16 = {
   "devices":[
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"value":8,"id":"dev0","x":48,"y":48,"label":"A"},
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"value":8,"id":"dev1","x":48,"y":192,"label":"B"},
    {"type":"CUSTOMBUSIN","immobile":true,"isBus":true,"value":0,"id":"dev2","x":616,"y":144,"label":"OUT"},
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
  ]
};


devices.OR16 = {
   "devices":[
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"value":8,"id":"dev0","x":48,"y":48,"label":"A"},
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"value":8,"id":"dev1","x":48,"y":192,"label":"B"},
    {"type":"CUSTOMBUSIN","immobile":true,"isBus":true,"value":0,"id":"dev2","x":616,"y":144,"label":"OUT"},
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
  ]
};


devices.MUX16 = {
     "devices":[
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"value":8,"id":"dev0","x":48,"y":40,"label":"A"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev1","x":168,"y":16,"label":"BusIn"},
    {"type":"CUSTOMBUSOUT","immobile":true,"isBus":true,"value":8,"id":"dev2","x":48,"y":232,"label":"B"},
    {"type":"BusIn","numOutputs":16,"immobile":true,"id":"dev3","x":168,"y":184,"label":"BusIn"},
    {"type":"CUSTOMBUSIN","immobile":true,"isBus":true,"value":8,"id":"dev4","x":650,"y":144,"label":"OUT"},
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
  ]};

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
  ]

};

devices.MUX4WAY16 = {
 "devices":[
    {"type":"MUX16","id":"dev0","x":256,"y":32,"label":"MUX16"},
    {"type":"CUSTOMBUSOUT","immobile":true,"id":"dev1","x":40,"y":32,"label":"A"},
    {"type":"CUSTOMBUSOUT","immobile":true,"id":"dev2","x":40,"y":96,"label":"B"},
    {"type":"CUSTOMBUSOUT","immobile":true,"id":"dev3","x":40,"y":160,"label":"C"},
    {"type":"CUSTOMBUSOUT","immobile":true,"id":"dev4","x":40,"y":224,"label":"D"},
    {"type":"CUSTOMBUSOUT","numInputs":2,"immobile":true,"id":"dev5","x":40,"y":280,"label":"SEL"},
    {"type":"BusIn","immobile":true,"numOutputs":2,"id":"dev6","x":120,"y":280,"label":"BusIn"},
    {"type":"CUSTOMBUSIN","immobile":true,"id":"dev7","x":480,"y":176,"label":"OUT"},
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
  ]

};

