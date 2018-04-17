//each toolbox inside contains the components required to build the desired chip
var thingsToBuild = ['NOT','AND','OR','XOR','MUX','DMUX','NOT16','AND16','OR16','MUX16','OR8WAY','MUX4WAY16','MUX8WAY16','DMUX4WAY','DMUX8WAY','HALFADDER','FULLADDER','ADD16','INC16','ALU','DFF','BIT','REGISTER','RAM8','RAM64','RAM512','RAM4K','RAM16K','PC'];
var toolboxes = {}; // the toolbox required for each component to be built
var setup = {}; //the setup required for each component to be built

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

/*
    
        
    
        
    
        */
