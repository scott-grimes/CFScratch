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
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"A","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":150,"label":"B","state":{"on":false}},
    {"type":"NAND","id":"dev2","x":150,"y":100,"label":"Nand"},
    {"type":"LED","immobile":true,"id":"dev3","x":250,"y":100,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev2.in1","to":"dev1.out0"},
    {"from":"dev3.in0","to":"dev2.out0"}
  ]
};

devices.AND = {"devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"A","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":150,"label":"B","state":{"on":false}},
    {"type":"NAND","id":"dev2","x":150,"y":100,"label":"NAND"},
    {"type":"NOT","id":"dev3","x":250,"y":100,"label":"NOT"},
    {"type":"LED","immobile":true,"id":"dev4","x":350,"y":100,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev2.in1","to":"dev1.out0"},
    {"from":"dev3.in0","to":"dev2.out0"},
    {"from":"dev4.in0","to":"dev3.out0"}
  ]};

devices.OR = { "devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"A","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":150,"label":"B","state":{"on":false}},
    {"type":"NOT","id":"dev2","x":150,"y":50,"label":"NOT"},
    {"type":"NOT","id":"dev3","x":150,"y":150,"label":"NOT"},
    {"type":"NAND","id":"dev4","x":250,"y":100,"label":"NAND"},
    {"type":"LED","immobile":true,"id":"dev5","x":350,"y":100,"label":"OUT"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev1.out0"},
    {"from":"dev4.in0","to":"dev2.out0"},
    {"from":"dev4.in1","to":"dev3.out0"},
    {"from":"dev5.in0","to":"dev4.out0"}
  ]
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
    {"type":"LED","immobile":true,"id":"dev7","x":450,"y":100,"label":"OUT"}
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
  ]
};

devices.MUX = {"devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"A","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":150,"label":"B","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev2","x":50,"y":250,"label":"SEL","state":{"on":false}},
    {"type":"NOT","id":"dev3","x":150,"y":250,"label":"NOT"},
    {"type":"AND","id":"dev4","x":150,"y":150,"label":"AND"},
    {"type":"OR","id":"dev5","x":250,"y":150,"label":"OR"},
    {"type":"LED","immobile":true,"id":"dev6","x":350,"y":150,"label":"OUT"},
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
  ]
};

devices.DMUX = {
  "devices":[
    {"type":"SINGLEINPUT","immobile":true,"id":"dev0","x":50,"y":50,"label":"IN","state":{"on":false}},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":250,"label":"SEL","state":{"on":false}},
    {"type":"NOT","id":"dev2","x":150,"y":250,"label":"NOT"},
    {"type":"AND","id":"dev3","x":200,"y":50,"label":"AND"},
    {"type":"AND","id":"dev4","x":200,"y":150,"label":"AND"},
    {"type":"LED","immobile":true,"id":"dev5","x":350,"y":100,"label":"A"},
    {"type":"LED","immobile":true,"id":"dev6","x":350,"y":200,"label":"B"}
  ],
  "connectors":[
    {"from":"dev2.in0","to":"dev1.out0"},
    {"from":"dev3.in0","to":"dev0.out0"},
    {"from":"dev3.in1","to":"dev1.out0"},
    {"from":"dev4.in0","to":"dev0.out0"},
    {"from":"dev4.in1","to":"dev2.out0"},
    {"from":"dev5.in0","to":"dev4.out0"},
    {"from":"dev6.in0","to":"dev3.out0"}
  ]
};

devices.NOT16 = {
  "devices":[
    {"type":"BusIn","immobile":true,"id":"dev0","x":50,"y":150,"numOutputs":16,"label":"IN"},
    {"type":"BusOut","immobile":true,"id":"dev1","x":400,"y":150,"numInputs":16,"label":"OUT"},
    {"type":"NOT","id":"dev2","x":200,"y":0,"label":"NOT"},
    {"type":"NOT","id":"dev3","x":200,"y":50,"label":"NOT"},
    {"type":"NOT","id":"dev4","x":200,"y":100,"label":"NOT"},
    {"type":"NOT","id":"dev5","x":200,"y":150,"label":"NOT"},
    {"type":"NOT","id":"dev6","x":200,"y":200,"label":"NOT"},
    {"type":"NOT","id":"dev7","x":200,"y":250,"label":"NOT"},
    {"type":"NOT","id":"dev8","x":200,"y":300,"label":"NOT"},
    {"type":"NOT","id":"dev9","x":200,"y":350,"label":"NOT"},
    {"type":"NOT","id":"dev10","x":200,"y":400,"label":"NOT"},
    {"type":"NOT","id":"dev11","x":200,"y":450,"label":"NOT"},
    {"type":"NOT","id":"dev12","x":200,"y":500,"label":"NOT"},
    {"type":"NOT","id":"dev13","x":200,"y":550,"label":"NOT"},
    {"type":"NOT","id":"dev14","x":200,"y":600,"label":"NOT"},
    {"type":"NOT","id":"dev15","x":200,"y":650,"label":"NOT"},
    {"type":"NOT","id":"dev16","x":200,"y":700,"label":"NOT"},
    {"type":"NOT","id":"dev17","x":200,"y":750,"label":"NOT"}
  ],
  "connectors":[
    {"from":"dev1.in0","to":"dev2.out0"},
    {"from":"dev1.in1","to":"dev3.out0"},
    {"from":"dev1.in2","to":"dev4.out0"},
    {"from":"dev1.in3","to":"dev5.out0"},
    {"from":"dev1.in4","to":"dev6.out0"},
    {"from":"dev1.in5","to":"dev7.out0"},
    {"from":"dev1.in6","to":"dev8.out0"},
    {"from":"dev1.in7","to":"dev9.out0"},
    {"from":"dev1.in8","to":"dev10.out0"},
    {"from":"dev1.in9","to":"dev11.out0"},
    {"from":"dev1.in10","to":"dev12.out0"},
    {"from":"dev1.in11","to":"dev13.out0"},
    {"from":"dev1.in12","to":"dev14.out0"},
    {"from":"dev1.in13","to":"dev15.out0"},
    {"from":"dev1.in14","to":"dev16.out0"},
    {"from":"dev1.in15","to":"dev17.out0"},
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev0.out1"},
    {"from":"dev4.in0","to":"dev0.out2"},
    {"from":"dev5.in0","to":"dev0.out3"},
    {"from":"dev6.in0","to":"dev0.out4"},
    {"from":"dev7.in0","to":"dev0.out5"},
    {"from":"dev8.in0","to":"dev0.out6"},
    {"from":"dev9.in0","to":"dev0.out7"},
    {"from":"dev10.in0","to":"dev0.out8"},
    {"from":"dev11.in0","to":"dev0.out9"},
    {"from":"dev12.in0","to":"dev0.out10"},
    {"from":"dev13.in0","to":"dev0.out11"},
    {"from":"dev14.in0","to":"dev0.out12"},
    {"from":"dev15.in0","to":"dev0.out13"},
    {"from":"dev16.in0","to":"dev0.out14"},
    {"from":"dev17.in0","to":"dev0.out15"}
  ]
};
devices.AND16 = {
  "devices":[
    {"type":"BusIn","immobile":true,"id":"dev0","x":50,"y":150,"numOutputs":16,"label":"A"},
    {"type":"BusIn","immobile":true,"id":"dev18","x":50,"y":350,"numOutputs":16,"label":"B"},
    {"type":"BusOut","immobile":true,"id":"dev1","x":400,"y":150,"numInputs":16,"label":"OUT"},
    {"type":"AND","id":"dev2","x":200,"y":0,"label":"AND"},
    {"type":"AND","id":"dev3","x":200,"y":50,"label":"AND"},
    {"type":"AND","id":"dev4","x":200,"y":100,"label":"AND"},
    {"type":"AND","id":"dev5","x":200,"y":150,"label":"AND"},
    {"type":"AND","id":"dev6","x":200,"y":200,"label":"AND"},
    {"type":"AND","id":"dev7","x":200,"y":250,"label":"AND"},
    {"type":"AND","id":"dev8","x":200,"y":300,"label":"AND"},
    {"type":"AND","id":"dev9","x":200,"y":350,"label":"AND"},
    {"type":"AND","id":"dev10","x":200,"y":400,"label":"AND"},
    {"type":"AND","id":"dev11","x":200,"y":450,"label":"AND"},
    {"type":"AND","id":"dev12","x":200,"y":500,"label":"AND"},
    {"type":"AND","id":"dev13","x":200,"y":550,"label":"AND"},
    {"type":"AND","id":"dev14","x":200,"y":600,"label":"AND"},
    {"type":"AND","id":"dev15","x":200,"y":650,"label":"AND"},
    {"type":"AND","id":"dev16","x":200,"y":700,"label":"AND"},
    {"type":"AND","id":"dev17","x":200,"y":750,"label":"AND"}
  ],
  "connectors":[
    {"from":"dev1.in0","to":"dev2.out0"},
    {"from":"dev1.in1","to":"dev3.out0"},
    {"from":"dev1.in2","to":"dev4.out0"},
    {"from":"dev1.in3","to":"dev5.out0"},
    {"from":"dev1.in4","to":"dev6.out0"},
    {"from":"dev1.in5","to":"dev7.out0"},
    {"from":"dev1.in6","to":"dev8.out0"},
    {"from":"dev1.in7","to":"dev9.out0"},
    {"from":"dev1.in8","to":"dev10.out0"},
    {"from":"dev1.in9","to":"dev11.out0"},
    {"from":"dev1.in10","to":"dev12.out0"},
    {"from":"dev1.in11","to":"dev13.out0"},
    {"from":"dev1.in12","to":"dev14.out0"},
    {"from":"dev1.in13","to":"dev15.out0"},
    {"from":"dev1.in14","to":"dev16.out0"},
    {"from":"dev1.in15","to":"dev17.out0"},
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev0.out1"},
    {"from":"dev4.in0","to":"dev0.out2"},
    {"from":"dev5.in0","to":"dev0.out3"},
    {"from":"dev6.in0","to":"dev0.out4"},
    {"from":"dev7.in0","to":"dev0.out5"},
    {"from":"dev8.in0","to":"dev0.out6"},
    {"from":"dev9.in0","to":"dev0.out7"},
    {"from":"dev10.in0","to":"dev0.out8"},
    {"from":"dev11.in0","to":"dev0.out9"},
    {"from":"dev12.in0","to":"dev0.out10"},
    {"from":"dev13.in0","to":"dev0.out11"},
    {"from":"dev14.in0","to":"dev0.out12"},
    {"from":"dev15.in0","to":"dev0.out13"},
    {"from":"dev16.in0","to":"dev0.out14"},
    {"from":"dev17.in0","to":"dev0.out15"},
    {"from":"dev2.in1","to":"dev18.out0"},
    {"from":"dev3.in1","to":"dev18.out1"},
    {"from":"dev4.in1","to":"dev18.out2"},
    {"from":"dev5.in1","to":"dev18.out3"},
    {"from":"dev6.in1","to":"dev18.out4"},
    {"from":"dev7.in1","to":"dev18.out5"},
    {"from":"dev8.in1","to":"dev18.out6"},
    {"from":"dev9.in1","to":"dev18.out7"},
    {"from":"dev10.in1","to":"dev18.out8"},
    {"from":"dev11.in1","to":"dev18.out9"},
    {"from":"dev12.in1","to":"dev18.out10"},
    {"from":"dev13.in1","to":"dev18.out11"},
    {"from":"dev14.in1","to":"dev18.out12"},
    {"from":"dev15.in1","to":"dev18.out13"},
    {"from":"dev16.in1","to":"dev18.out14"},
    {"from":"dev17.in1","to":"dev18.out15"}
  ]
};


devices.OR16 = {
  "devices":[
    {"type":"BusIn","immobile":true,"id":"dev0","x":50,"y":150,"numOutputs":16,"label":"A"},
    {"type":"BusIn","immobile":true,"id":"dev18","x":50,"y":350,"numOutputs":16,"label":"B"},
    {"type":"BusOut","immobile":true,"id":"dev1","x":400,"y":150,"numInputs":16,"label":"OUT"},
    {"type":"OR","id":"dev2","x":200,"y":0,"label":"OR"},
    {"type":"OR","id":"dev3","x":200,"y":50,"label":"OR"},
    {"type":"OR","id":"dev4","x":200,"y":100,"label":"OR"},
    {"type":"OR","id":"dev5","x":200,"y":150,"label":"OR"},
    {"type":"OR","id":"dev6","x":200,"y":200,"label":"OR"},
    {"type":"OR","id":"dev7","x":200,"y":250,"label":"OR"},
    {"type":"OR","id":"dev8","x":200,"y":300,"label":"OR"},
    {"type":"OR","id":"dev9","x":200,"y":350,"label":"OR"},
    {"type":"OR","id":"dev10","x":200,"y":400,"label":"OR"},
    {"type":"OR","id":"dev11","x":200,"y":450,"label":"OR"},
    {"type":"OR","id":"dev12","x":200,"y":500,"label":"OR"},
    {"type":"OR","id":"dev13","x":200,"y":550,"label":"OR"},
    {"type":"OR","id":"dev14","x":200,"y":600,"label":"OR"},
    {"type":"OR","id":"dev15","x":200,"y":650,"label":"OR"},
    {"type":"OR","id":"dev16","x":200,"y":700,"label":"OR"},
    {"type":"OR","id":"dev17","x":200,"y":750,"label":"OR"}
  ],
  "connectors":[
    {"from":"dev1.in0","to":"dev2.out0"},
    {"from":"dev1.in1","to":"dev3.out0"},
    {"from":"dev1.in2","to":"dev4.out0"},
    {"from":"dev1.in3","to":"dev5.out0"},
    {"from":"dev1.in4","to":"dev6.out0"},
    {"from":"dev1.in5","to":"dev7.out0"},
    {"from":"dev1.in6","to":"dev8.out0"},
    {"from":"dev1.in7","to":"dev9.out0"},
    {"from":"dev1.in8","to":"dev10.out0"},
    {"from":"dev1.in9","to":"dev11.out0"},
    {"from":"dev1.in10","to":"dev12.out0"},
    {"from":"dev1.in11","to":"dev13.out0"},
    {"from":"dev1.in12","to":"dev14.out0"},
    {"from":"dev1.in13","to":"dev15.out0"},
    {"from":"dev1.in14","to":"dev16.out0"},
    {"from":"dev1.in15","to":"dev17.out0"},
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev0.out1"},
    {"from":"dev4.in0","to":"dev0.out2"},
    {"from":"dev5.in0","to":"dev0.out3"},
    {"from":"dev6.in0","to":"dev0.out4"},
    {"from":"dev7.in0","to":"dev0.out5"},
    {"from":"dev8.in0","to":"dev0.out6"},
    {"from":"dev9.in0","to":"dev0.out7"},
    {"from":"dev10.in0","to":"dev0.out8"},
    {"from":"dev11.in0","to":"dev0.out9"},
    {"from":"dev12.in0","to":"dev0.out10"},
    {"from":"dev13.in0","to":"dev0.out11"},
    {"from":"dev14.in0","to":"dev0.out12"},
    {"from":"dev15.in0","to":"dev0.out13"},
    {"from":"dev16.in0","to":"dev0.out14"},
    {"from":"dev17.in0","to":"dev0.out15"},
    {"from":"dev2.in1","to":"dev18.out0"},
    {"from":"dev3.in1","to":"dev18.out1"},
    {"from":"dev4.in1","to":"dev18.out2"},
    {"from":"dev5.in1","to":"dev18.out3"},
    {"from":"dev6.in1","to":"dev18.out4"},
    {"from":"dev7.in1","to":"dev18.out5"},
    {"from":"dev8.in1","to":"dev18.out6"},
    {"from":"dev9.in1","to":"dev18.out7"},
    {"from":"dev10.in1","to":"dev18.out8"},
    {"from":"dev11.in1","to":"dev18.out9"},
    {"from":"dev12.in1","to":"dev18.out10"},
    {"from":"dev13.in1","to":"dev18.out11"},
    {"from":"dev14.in1","to":"dev18.out12"},
    {"from":"dev15.in1","to":"dev18.out13"},
    {"from":"dev16.in1","to":"dev18.out14"},
    {"from":"dev17.in1","to":"dev18.out15"}
  ]
};


devices.MUX16 = [
    {"type":"BusIn","immobile":true,"id":"dev0","x":50,"y":150,"numOutputs":16,"label":"IN"},
    {"type":"BusOut","immobile":true,"id":"dev1","x":400,"y":150,"numInputs":16,"label":"OUT"},
    {"type":"SINGLEINPUT","immobile":true,"id":"dev1","x":50,"y":350,"label":"SEL","state":{"on":false}}
];
devices.OR8WAY = [
    {"type":"BusIn","immobile":true,"id":"dev0","x":50,"y":150,"numOutputs":8,"label":"IN"},
    {"type":"LED","immobile":true,"id":"dev1","x":400,"y":175,"label":"OUT"}
];

devices.MUX4WAY16 = [

];

