class CpuEmulator{
    
    //rom is an array of machine code
    constructor(rom){
        this.rom = rom;
        this.ram = {};
        this.PC = 0;
        this.A = 0;
        this.D = 0;
        this.D_in = 0;
        this.MA_in = 0;
        this.ALU_out = 0;
        this.buildTables();
    }
    
    execute(){
        var command = this.rom[this.PC];
        console.log(command)
        //A instruction
        if(command[0] === '0'){
            var dec = binToDec(command);
            this.A = dec;
            this.PC+=1;
        }else{
            //C instruction
            var cmp = command.slice(3,10);
            var dst = command.slice(10,13);
            var jmp = command.slice(13);
            cmp = this.cmd[cmp];
            dst = this.dst[dst];
            jmp = this.jmp[jmp];
            console.log(dst+'='+cmp';'+jmp)
        }
    }
    
    binToDec(bin){
        var sum = 0;
        var pow = 0;
        for(var i = bin.length-1;i>=0;i--){
            if(bin[i]==='1'){
                sum+=Math.pow(2, pow );
            }
            pow+=1;
        }
        return sum;
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
        
         this.jmp = { "001": 'JGT',
                      "010": 'JEQ',
                      "011": 'JGE',
                      "100": 'JLT',
                      "101": 'JNE',
                      "110": 'JLE',
                      "111": 'JMP'};
        
        this.dst = { 
             '000': '0',
             '001' :'M' ,
             '010': 'D',
             '011': 'MD',
             '100': 'A',
             '101': 'AM',
             '110': 'AD',
             '111': 'AMD'};
    }
    
    
    
}
