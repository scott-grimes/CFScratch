// each toolbox contains the required chips to build the device.
// inputs and outputs are not included in the toolbox, they are immutable to the user
var toolboxes = {}; // the toolbox required for each component to be built

//GATES
toolboxes.NOT = [{"type":"NAND"},{"type":"Joint"}];
toolboxes.AND = [{"type":"NAND"},
                 {"type":"NOT"},{"type":"Joint"}];
toolboxes.OR = [{"type":"NAND"},
                 {"type":"NOT"},{"type":"Joint"}];
toolboxes.XOR = [{"type":"AND"},
                 {"type":"NOT"},
                 {"type":"OR"},{"type":"Joint"}];
toolboxes.MUX = [{"type":"AND"},
                 {"type":"NOT"},
                 {"type":"OR"},{"type":"Joint"}];
toolboxes.DMUX = [{"type":"AND"},
                 {"type":"NOT"},{"type":"Joint"}];

//16 BIT CHIPS (require buses)
toolboxes.NOT16 = [{"type":"NOT"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16},{"type":"Joint"}]; 
toolboxes.AND16 = [{"type":"AND"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16},{"type":"Joint"}];
toolboxes.OR16 = [{"type":"OR"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16},{"type":"Joint"}]; 
toolboxes.MUX16 = [{"type":"MUX"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16},{"type":"Joint"}]; 

//multi-way gates
toolboxes.OR8WAY = [{"type":"OR"},{"type":"Joint"}]; 
toolboxes.MUX4WAY16 = [{"type":"MUX16"},
                      {"type":"BusIn","numOutputs":2},{"type":"Joint"}]; 
toolboxes.MUX8WAY16 = [{"type":"MUX4WAY16"},
                       {"type":"MUX16"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusOut","numInputs":2},{"type":"Joint"}]; 
toolboxes.DMUX4WAY = [{"type":"DMUX"},
                       {"type":"BusIn","numOutputs":2},{"type":"Joint"}]; 
toolboxes.DMUX8WAY = [{"type":"DMUX"},
                       {"type":"DMUX4WAY"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusOut","numInputs":2},{"type":"Joint"}]; 




// CHIPS
toolboxes.HALFADDER = [{"type":"AND"},
                       {"type":"XOR"},{"type":"Joint"}]; 

toolboxes.FULLADDER = [{"type":"HALFADDER"},
                       {"type":"OR"},{"type":"Joint"}]; 


toolboxes.ADD16 = [{"type":"FULLADDER"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16},{"type":"Joint"}]; 

toolboxes.INC16 = [{"type":"ADD16"},{"type":"Joint"}]; 

toolboxes.ALU = [{"type":"MUX16"},
                   {"type":"NOT16"},
                   {"type":"ADD16"},
                   {"type":"AND16"},
                   {"type":"OR"},
                   {"type":"OR8WAY"},
                   {"type":"NOT"},
                   {"type":"BusIn","numOutputs":16},{"type":"Joint"}]; 

toolboxes.DFF = [,{"type":"Joint"}]; //todo this

toolboxes.REGISTER = [{"type":"BIT"},
                       {"type":"BusIn","numOutputs":16},
                       {"type":"BusOut","numInputs":16},{"type":"Joint"}];

toolboxes.RAM8 = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"REGISTER"},{"type":"Joint"}];
toolboxes.RAM64 = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"RAM8"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusOut","numInputs":6},{"type":"Joint"}];
toolboxes.RAM512 = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"RAM64"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusIn","numOutputs":6},
                       {"type":"BusOut","numInputs":9},{"type":"Joint"}];
toolboxes.RAM4K = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"RAM512"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusIn","numOutputs":9},
                       {"type":"BusOut","numInputs":12},{"type":"Joint"}];
toolboxes.RAM16K = [{"type":"MUX8WAY16"},
                  {"type":"DMUX8WAY"},
                  {"type":"RAM4K"},
                       {"type":"BusIn","numOutputs":3},
                       {"type":"BusIn","numOutputs":12},
                       {"type":"BusOut","numInputs":5},{"type":"Joint"}];
toolboxes.PC = [{"type":"REGISTER"},
                  {"type":"INC16"},
                  {"type":"MUX16"},{"type":"Joint"}];
toolboxes.DFF = [{"type":"NAND"},
                  {"type":"NOT"},{"type":"Joint"}];
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
                       {"type":"BusOut","numInputs":15},{"type":"Joint"}]


toolboxes.BIT = [{"type":"DFF"},
                  {"type":"MUX"},{"type":"Joint"}];


