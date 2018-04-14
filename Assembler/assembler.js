class Assembler {
    
    
    assemble(text){
        
        this.buildDicts();
        this.machineCode = []; // to be filled with the assembled machine code commands
        this.lines = []; //to be filled with the lines from our assembly program
        this.read(text);
        this.parseLabels();
        
        for(var i = 0;i<this.lines.length;i++){
            this.lineNumber = i+1;
            this.buildLine(this.lines[i]);
        }
        
        return this.machineCode;
    }
    
    buildDicts(){
        
        // Built-In Symbols which may be used
        this.symbolDict = {
        "SP": 0,
        "LCL": 1,
        "ARG": 2,
        "THIS": 3,
        "THAT": 4,
        "SCREEN": 16384,
        "KBD": 24576,
        "R0": 0,
        "R1": 1,
        "R2": 2,
        "R3": 3,
        "R4": 4,
        "R5": 5,
        "R6": 6,
        "R7": 7,
        "R8": 8,
        "R9": 9,
        "R10": 10,
        "R11": 11,
        "R12": 12,
        "R13": 13,
        "R14": 14,
        "R15": 15
        }
         
        this.cmd = {
            '0': '0101010',
            '1': '0111111',
            '-1': '0111010',
            'D' : '0001100',
            'A' : '0110000',
            '!D' : '0001101',
            '!A' : '0110001',
            '-D' : '0001111',
            '-A' : '0110011',
            'D+1': '0011111',
            'A+1': '0110111',
            'D-1': '0001110',
            'A-1': '0110010',
            'D+A' : '0000010',
            'D-A' : '0010011',
            'A-D' : '0000111',
            'D&A' : '0000000',
            'D|A' : '0010101',
            'M' : '1110000',
            '!M' : '1110001',
            '-M' : '1110011',
            'M+1': '1110111',
            'M-1': '1110010',
            'D+M' : '1000010',
            'D-M' : '1010011',
            'M-D' : '1000111',
            'D&M' : '1000000',
            'D|M' : '1010101' };
        
        this.jmp = {'JGT' : "001",
                    'JEQ' : "010",
                    'JGE' : "011",
                    'JLT' : "100",
                    'JNE' : "101",
                    'JLE' : "110",
                    'JMP' : "111"};
        
        this.dst = { 
            '0' : '000',
            'M' : '001',
            'D'  : '010',
            'MD'  : '011',
            'A'  : '100',
            'AM'  : '101',
            'AD'  : '110',
            'AMD' : '111'};
        
        this.validChars = 'abcdefghijklmnopqrstuvwxyz'
        this.validChars+= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        this.validChars+= '0123456789'
        this.validChars+= '@_+-.:!&|$;=()'
        
        this.userDefVarsCount = 0
    }
    
    
    // this does shit with the labels
    parseLabels(){
        var lineNumber = 0;
        for(var i = 0;i<this.lines.length;i++){
         if (this.lines[i].charAt(0) ==='('){
              var label = this.lines[i].slice(1,this.lines[i].length-1);
              this.symbolDict[label] = lineNumber;
         }else{
             
             lineNumber+=1;
         }
        }
    }
    
    /* 
    *   Fills this.lines with the given text, after whitespace, comments, and blank lines are removed.
    *   If any invalid characters are found, throws an exception
    */
    read(text){
        var lines = text.split('\n');
        // loops through each line
        for(var i = 0;i<lines.length;i++){
            
            //removes any whitespace
            lines[i] = lines[i].replace(/\s/g, "");
            
            //removes any comments from the line
            lines[i] = lines[i].split('//')[0];
            
            //checks for invalid characters
            for(var j = 0;j<lines[i].length;j++){
                if(this.validChars.indexOf( lines[i].charAt(j) ) === -1){
                    throw('invalid character on line '+(i+1), lines[i])
                }
            }
            
            //adds the parsed line to our list of lines
            if(lines[i]!=='')
                this.lines.push(lines[i]);
            
        }
        
    }
    
                            
    //builds the machine code command associated with the given line                
    buildLine(line){
        
        //ignore blank lines
        if(line === '') throw('blank line encountered');
    
        //ignore lines that start with ( 
        var commandType = this.commandType(line);
        
        // ignore label lines
        if(commandType==='L') return;
        
        var command;
        
        if(commandType==='A')
            command = this.aCommand(line)
        else if(commandType==='C')
            command = this.cCommand(line)
        else{
            throw('invalid command: '+line+' on line: '+this.lineNumber);
        }
            
        this.machineCode.push(command);

        }
    
    commandType(line){
        
        if (line.charAt(0) ==='@')
            return 'A'
        if (line.charAt(0)==='(')
            return 'L'
        return 'C'
    }
    
    // an 'A' command in assembly is the '@' symbol followed by a positive integer,
    // or by a symbol. The symbol may be built-in or user-defined:
    // @512
    // @1337
    // @SCREEN
    // @myVariable
    
    aCommand(line){
        var number;
        // is the first character a digit? 
        
        if('0123456789'.indexOf( line.charAt(1) ) !== -1){
            number = parseInt(line.slice(1,line.length));
        }
        else{
            //fetch the address of the symbol
            var symbol = line.slice(1,line.length);
            number = this.getAddress(symbol);
        }
        
        //convert number to binary
        var command = number.toString(2);
        
        //pad to 16 bits
        while(command.length<16){
            command = '0'+command;
        }
        
        return command;
        
    }
    
    
    // a 'C' command must be of the form:
    // DST=CMD for computation commands
    // or
    // DST;JMP for jump commands
    // where DST,CMD, and JMP are assembly commands in the dictionaries dst,cmd,jmp
    cCommand(line){
       
        // is the line a computation command?
        if(line.indexOf('=')!= -1){
            var dst = line.split('=')[0];
            var cmd = line.split('=')[1];
            if(this.dst[dst] && this.cmd[cmd]){
                return '111'+this.cmd[cmd]+this.dst[dst]+'000';
            }
        }
        // is the line a jump command?
        else if(line.indexOf(';')!= -1){
            var cmd = line.split(';')[0];
            var jmp = line.split(';')[1];
            if(this.cmd[cmd] && this.jmp[jmp]){
                return '111'+this.cmd[cmd]+'000'+this.jmp[jmp];
            }
            
        }
       
           
        //line is not built correcly, throw error
           throw('invalid command: '+line+' on line: '+this.lineNumber);
    }
       
   
    
        
    
    // returns the address of the symbol requested.
    // if the symbol is not already in the dict of symbols,
    // create a new entry beginning at address 16
    getAddress(symbol){
        
        if(!this.symbolDict[symbol]){
            this.symbolDict[symbol] = 16+this.userDefVarsCount;
            this.userDefVarsCount+=1;
        }
        return this.symbolDict[symbol];
        
    }
    
    
}
