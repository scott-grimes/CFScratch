class Keyboard{
    
    constructor(){
        this.keyChanged = false;
        this.key = 0;
    }
    
handlekeydown(k){              
    // only allow one key to be pressed at a time
    
    if(this.key===0){
        
        //a-z
        if(k>=65 && k<=90){
            this.key=k;
        } else if(k>=48 && k<=57){
            //1-9
            this.key = k;
        }
        this.keyChanged = true;
    }
        
}
    
    getKeyChar(){
        var k = this.key
        if(k === 0)
            return 'None'
        if(k>=65 && k<=90){
            return String.fromCharCode(k);
        } else if(k>=48 && k<=57){
            //1-9
            return k-48;
        }
    }
    
handlekeyup(){              
    this.key=0
    this.keyChanged = true;
}
    
    
    buildTables(){
        
    //New line = 128 = String.newline()
    // Backspace = 129 = String.backspace()
    // Left Arrow = 130
    // Up Arrow = 131
    // Right Arrow = 132
    // Down Arrow = 133
    // Home = 134
    // End = 135
    // Page Up = 136
    // Page Down = 137
    // Insert = 138
    // Delete = 139
    // ESC = 140
    // F1 - F12 = 141 - 152
        
        
        
    }
    
}
