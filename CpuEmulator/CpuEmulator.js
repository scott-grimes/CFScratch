class CpuEmulator{
    
    //rom is an array of machine code. each line is a 16-bit command
    //
    constructor(rom){
        this.rom = rom;
        this.M = {};
        this.PC = 0;
        this.A = 0;
        this.D = 0;
        this.ALUOUT = 0;
        this.buildTables();
    }
    
    execute(){
        var command;
        if(this.PC<0 || this.PC>32000){
            throw("Out of Memory Bounds PC:"+this.pc)
        }
        if(this.PC>=this.rom.length){
            command = this.dec2bin(0);
        }
        else{
            command = this.rom[this.PC];
        }
        
        
        
        //A instruction
        if(command[0] === '0'){
            var dec = this.bin2dec(command);
            this.A = dec;
            this.PC+=1;
            console.log(command,': @'+dec)
        }
        else
        {
            //C instruction
            var cmp = command.slice(3,10);
            var dst = command.slice(10,13);
            var jmp = command.slice(13);
            cmp = this.cmd[cmp];
            dst = this.dst[dst];
            console.log(jmp);
            console.log(this.jmp)
            console.log(this.jmp[jmp])
            jmp = this.jmp[jmp];
            console.log(jmp);
            console.log(command,': '+dst+'='+cmp+';'+jmp)
            cmp = command.slice(3,10);
            this.ALUOUT = this.ALU(cmp);
            
            if(dst[2]==='1'){
                this.M[this.A] = this.ALUOUT;
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
            if(!this.M[this.A]){
                this.M[this.A] = 0;
            }
            
            var M = this.M[this.A];
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
            '1010101':'D|M'   };
        
         this.jmp = { '000': '', //no jump
                      '001': 'JGT',
                      '010': 'JEQ',
                      '011': 'JGE',
                      '100': 'JLT',
                      '101': 'JNE',
                      '110': 'JLE',
                      '111': 'JMP'};
        
        this.dst = { 
             '000': '', //no destination to save
             '001' :'M' ,
             '010': 'D',
             '011': 'MD',
             '100': 'A',
             '101': 'AM',
             '110': 'AD',
             '111': 'AMD'};
    }
    
    
    
}
