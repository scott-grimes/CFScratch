class Keyboard{
    
    constructor(){
        this.keyChanged = false;
        this.key = 0;
        this.buildTables();
    }
    
handlekeydown(k){              
    // only allow one key to be pressed at a time
    
    if(this.key===0){
        
        //a-z
        if(k>=31 && k<=127){
            this.key=k;
        }else if( this.keycodes[k] ){
            this.key= this.keycodes[k];
        }
        this.keyChanged = true;
    }
    
        
}
    
    getKeyChar(){
        var k = this.key
        console.log(k)
        if(k === 0)
            return 'None'
        if(k>=33 && k<=127){
            return String.fromCharCode(k);
        }else if( this.keycodevalues[k] ){
            return this.keycodevalues[k];
        }
        
    }
    
handlekeyup(){              
    this.key=0
    this.keyChanged = true;
}
    
    
    buildTables(){
        //javascript code: our code
        this.keycodes = {};
    this.keycodes[13] = 128//New line = 128 = String.newline()
    this.keycodes[8] = 129// Backspace = 129 = String.backspace()
    this.keycodes[37] = 130// Left Arrow = 130
    this.keycodes[38] = 131// Up Arrow = 131
    this.keycodes[39] = 132// Right Arrow = 132
    this.keycodes[40] = 133// Down Arrow = 133
    this.keycodes[36] = 134// Home = 134
    this.keycodes[35] =135// End = 135
    this.keycodes[33] =136// Page Up = 136
    this.keycodes[34] =137// Page Down = 137
    this.keycodes[45] = 138// Insert = 138
    this.keycodes[46] = 139// Delete = 139
    this.keycodes[27] = 140// ESC = 140
        for(var i = 112;i<124;i++)
            this.keycodes[i] = i+29;
    // F1 - F12 = 141 - 152
        
        this.keycodevalues = {};
        this.keycodevalues[32] = 'SPACE';
        this.keycodevalues[128] = 'ENTER';
        this.keycodevalues[129] = 'BACK';
        this.keycodevalues[130] = 'LEFT';
        this.keycodevalues[131] = 'UP';
        this.keycodevalues[132] = 'RIGHT';
        this.keycodevalues[133] = 'DOWN';
        this.keycodevalues[134] = 'HOME';
        this.keycodevalues[135] = 'END';
        this.keycodevalues[136] = 'PGUP';
        this.keycodevalues[137] = 'PGDWN';
        this.keycodevalues[138] = 'INS';
        this.keycodevalues[139] = 'DEL';
        this.keycodevalues[140] = 'ESC';
        for(var i = 141;i<153;i++){
            this.keycodevalues[i] = 'F'+(i-140).toString();
        }
        window.k = this.keycodevalues
    }
    
}
