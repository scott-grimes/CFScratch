class CpuEmulator{
    
    //rom is an array of machine code. each line is a 16-bit command
    //
    constructor(){
        //outputs
        this.writeM = 0; // c instruct and instruction[12]
        this.outM = 0; //aluout
        this.addressM = 0; //aka A
        this.PC = 0;

        // inputs
        this.inM = 0;
        this.instruction = null;
        this.reset = null;

        //internal items
        this.A = 0;
        this.D = 0;
        this.ALUOUT = 0;
        this.buildTables();
        this.DEBUG = false;

    }

    dec2bus (decimalValue){
          let binary = dec2bin(decimalValue);
          let outVal = [];
            for(let i = 15;i>=0;i--){
              outVal.push(  binary[i]==='1'? 1 : null )
            }
          return outVal;

  }


    busToSignedInt (busVal){
          let value = 0;
          for(let i = 0; i<16;i++){
            let bitOn = isHot( extractValue(busVal,i) )
            value+= bitOn ? Math.pow(2,i) : 0;
          }

          if(value>32767)
            value-= Math.pow(2,16)

          return value;
        }
    
    //acceps a bus of [null,1] for false/true, and a reset value of null or 1
    execute(inM, instruction, reset){
        this.inM = this.busToSignedInt( inM )
        this.reset = reset;

        this.instruction = instruction;

        var command = this.busToSignedInt( instructionBus );
        command = this.dec2bin(command)

        
        

        
        //A instruction
        if(command[0] === '0'){
            var dec = this.bin2dec(command);
            this.A = dec;
            this.PC+=1;
            if(this.DEBUG)
                console.log(command,': @'+dec)
        }
        else
        {
            
            if(command.slice(0,3)!=='111')
                throw("invalid command");
            //C instruction
            var cmp = command.slice(3,10);
            var dst = command.slice(10,13);
            var jmp = command.slice(13);
            
            jmp = this.bin2dec(jmp);
            jmp = this.jmp[jmp];
            
            cmp = command.slice(3,10);
            this.ALUOUT = this.ALU(cmp);
            this.outM = this.dec2Bus( this.ALUOUT );
            
            if(dst[2]==='1'){
              this.writeM = [1];
                    
            }
            else{
              this.writeM=[null]
            }
            if(dst[1]==='1'){
                this.D = this.ALUOUT;
            }
            if(dst[0]==='1'){
                this.A = this.ALUOUT;
            }
            this.PC+=1;
            if( (jmp==='JGT' && this.ALUOUT>0 ) ||
                (jmp==='JEQ' && this.ALUOUT===0 ) || 
               (jmp==='JGE' && this.ALUOUT>=0 ) || 
               (jmp==='JLT' && this.ALUOUT<0 ) || 
               (jmp==='JNE' && this.ALUOUT!==0 ) || 
               (jmp==='JLE' && this.ALUOUT<=0 ) ||
               (jmp==='JMP')){
                this.PC = this.A;
            }
            
            this.addressM = this.dec2Bus( this.A );
        
        if(this.DEBUG){
            console.log(this.machineToAssembly(command));
        }
        }
    }
    
    
        
 dec2bin(int) {
    var u = new Uint32Array(1);
    var nbit = 16;
    u[0] = int;
    int = Math.pow(2, 16) - 1;
    var converted = u[0] & int;
    converted.toString(2);
    return converted.toString(2).padStart(16,"0")
  }

    
 bin2dec(bin){
    return parseInt(bin, 2);
 }
        
 ALU(cmp){
            
            
            var M = this.inM;
            switch(cmp){
            case '0101010' :return 0;
            case '0111111' : return 1 ; 
            case '0111010' : return -1  ;
            case '0001100' : return this.D ; 
            case '0110000' : return this.A ; 
            case '0001101' : return ~this.D ; 
            case '0110001' : return ~this.A ;  
            case '0001111' : return -this.D ;  
            case '0110011' : return -this.A ;  
            case '0011111' : return this.D+1  ;
            case '0110111' : return this.A+1  ;
            case '0001110' : return this.D-1  ;
            case '0110010' : return this.A-1  ;
            case '0000010' : return this.D+this.A ;  
            case '0010011' : return this.D-this.A ; 
            case '0000111' : return this.A-this.D ; 
            case '0000000' : return this.D&this.A ; 
            case '0010101' : return this.D|this.A ; 
            case '1110000' : return M ;  
            case '1110001' : return ~M ; 
            case '1110011' : return -M ;
            case '1110111' : return M+1 ; 
            case '1110010' : return M-1 ; 
            case '1000010' : return this.D+M ; 
            case '1010011' : return this.D-M ; 
            case '1000111' : return M-this.D ; 
            case '1000000' : return this.D&M ; 
            case '1010101' : return this.D|M;
            default: throw("unknown command")
            }
                    
                   }
        
    
    
    buildTables(){
        this.cmd = {
            '0101010':'0' , 
            '0111111' :'1' , 
            '0111010' :'-1'  ,
            '0001100' :'D' , 
            '0110000' :'A' , 
            '0001101' :'!D' , 
            '0110001':'!A' ,  
            '0001111':'-D' ,  
            '0110011':'-A' ,  
            '0011111' :'D+1'  ,
            '0110111' :'A+1'  ,
            '0001110' :'D-1'  ,
            '0110010' :'A-1'  ,
            '0000010':'D+A' ,  
            '0010011' :'D-A' , 
            '0000111' :'A-D' , 
            '0000000' :'D&A' , 
            '0010101' :'D|A' , 
            '1110000':'M' ,  
            '1110001' :'!M' , 
            '1110011' :'-M' ,
            '1110111' :'M+1' , 
            '1110010' :'M-1' , 
            '1000010' :'D+M' , 
            '1010011' :'D-M' , 
            '1000111' :'M-D' , 
            '1000000' :'D&M' , 
            '1010101':'D|M'  };
        
         this.jmp = [  '', //no jump 00
                       'JGT', //001
                       'JEQ', //010
                       'JGE', //011
                       'JLT', //100
                       'JNE', //101
                       'JLE', //110
                       'JMP']; //111
        
        this.dst = { 
             '000' : '', //no destination to save
             '001' :'M' ,
             '010' : 'D',
             '011' : 'MD',
             '100' : 'A',
             '101'  : 'AM',
             '110' : 'AD',
             '111' : 'AMD'};
    }
    
    machineToAssembly(command){
        
        //A instruction
        if(command[0] === '0'){
            var dec = this.bin2dec(command);
            return '@'+dec;
        }
        else
        {
            if(command.slice(0,3)!=='111')
                throw("invalid command");
            //C instruction
            var cmp = command.slice(3,10);
            var dst = command.slice(10,13);
            var jmp = command.slice(13);
            
            
            jmp = this.bin2dec(jmp);
            jmp = this.jmp[jmp];
            cmp = this.cmd[cmp];
            if(!cmp){
                throw("Invalid Command")
            }
            dst = this.dst[dst];
            if(dst===''){
                return cmp+';'+jmp;
            }
                
            else{
                return dst+'='+cmp;
            }        
            }
            
            
            
    }
    
}
