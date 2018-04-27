// each toolbox contains the required chips to build the device.
// inputs and outputs are not included in the toolbox, they are immutable to the user
var toolboxes = {}; // the toolbox required for each component to be built

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

//16 BIT CHIPS (require buses)
toolboxes.NOT16 = [{"type":"NOT"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16}]; 
toolboxes.AND16 = [{"type":"AND"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16}];
toolboxes.OR16 = [{"type":"OR"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16}]; 
toolboxes.MUX16 = [{"type":"MUX"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16}]; 

//multi-way gates
toolboxes.OR8WAY = [{"type":"OR"}]; 
toolboxes.MUX4WAY16 = [{"type":"MUX16"},
                      {"type":"BusIn","numOutputs":2}]; 
toolboxes.MUX8WAY16 = [{"type":"MUX4WAY16"},
                       {"type":"MUX16"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusOut","numInputs":2}]; 
toolboxes.DMUX4WAY = [{"type":"DMUX"},
                       {"type":"BusIn","numOutputs":2}]; 
toolboxes.DMUX8WAY = [{"type":"DMUX"},
                       {"type":"DMUX4WAY"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusOut","numInputs":2}]; 




// CHIPS
toolboxes.HALFADDER = [{"type":"AND"},
                       {"type":"XOR"}]; 

toolboxes.FULLADDER = [{"type":"HALFADDER"},
                       {"type":"OR"}]; 


toolboxes.ADD16 = [{"type":"FULLADDER"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16}]; 

toolboxes.INC16 = [{"type":"ADD16"}]; 

toolboxes.ALU = [{"type":"MUX16"},
                   {"type":"NOT16"},
                   {"type":"ADD16"},
                   {"type":"AND16"},
                   {"type":"OR"},
                   {"type":"OR8WAY"},
                   {"type":"NOT"},
                   {"type":"BusIn","numOutputs":16}]; 

toolboxes.DFF = []; //todo this

toolboxes.REGISTER = [{"type":"BIT"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16}];

toolboxes.RAM8 = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"REGISTER"}];
toolboxes.RAM64 = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"RAM8"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusOut","numInputs":6}];
toolboxes.RAM512 = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"RAM64"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusIn","numOutputs":6},
                       {"type":"BusOut","numInputs":9}];
toolboxes.RAM4K = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"RAM512"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusIn","numOutputs":9},
                       {"type":"BusOut","numInputs":12}];
toolboxes.RAM16K = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"RAM4K"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusIn","numOutputs":12},
                       {"type":"BusOut","numInputs":5}];
toolboxes.PC = [{"type":"REGISTER"},
                  {"type":"INC16"},
                  {"type":"MUX16"}];
toolboxes.DFF = [{"type":"NAND"},
                  {"type":"NOT"}];
toolboxes.CPU = [{"type":"REGISTER"},
                 {"type":"ALU"},
                  {"type":"MUX16"},
                  {"type":"PC"},
                  {"type":"AND"},
                  {"type":"OR"},
                  {"type":"NOT"},
                       {"type":"BusIn","numOutputs":6},
                       {"type":"BusOut","numInputs":6},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusOut","numInputs":3},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":15}]


toolboxes.BIT = [{"type":"DFF"},
                  {"type":"MUX"}];


// add a joint to every toolbox!
for(var key in toolboxes){
  toolboxes[key].push({"type":"Joint"})

}

