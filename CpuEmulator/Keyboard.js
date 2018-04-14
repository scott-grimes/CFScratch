class Keyboard{
    
    constructor(){
        this.keyChanged = false;
        this.key = 0;
        this.buildTables();
    }
    
handlekeydown(k){              
    // only allow one key to be pressed at a time
    
    if(this.key===0){
        // deal with special code mappings
        if( this.special[k] ){
            this.key= this.special[k];
        }else{
            this.key = k;
        }
        this.keyChanged = true;
    }
    
        
}
    
    getKeyChar(){
        var k = this.key
        var keyval = this.keyboardMap[k]
        if(!keyval || keyval===""){
            return 'None';
        }
        return keyval;
        
    }
    
handlekeyup(){              
    this.key=0
    this.keyChanged = true;
}
    
    
    buildTables(){
        //javascript code: our code
        this.keyboardMap = [
  "None", // [0]
  "", // [1]
  "", // [2]
  "", // [3]
  "", // [4]
  "", // [5]
  "", // [6]
  "", // [7]
  "", // [8]
  "", // [9]
  "", // [10]
  "", // [11]
  "", // [12]
  "", // [13]
  "", // [14]
  "", // [15]
  "", // [16]
  "", // [17]
  "", // [18]
  "", // [19]
  "", // [20]
  "", // [21]
  "", // [22]
  "", // [23]
  "", // [24]
  "", // [25]
  "", // [26]
  "", // [27]
  "", // [28]
  "", // [29]
  "", // [30]
  "", // [31]
  "SPACE", // [32]
  "PGUP", // [33]
  "PGDN", // [34]
  "END", // [35]
  "HOME", // [36]
  "LEFT", // [37]
  "UP", // [38]
  "RIGHT", // [39]
  "DOWN", // [40]
  "SEL", // [41]
  "PRNT", // [42]
  "EXECUTE", // [43]
  "PRTSC", // [44]
  "INS", // [45]
  "DEL", // [46]
  "", // [47]
  "0", // [48]
  "1", // [49]
  "2", // [50]
  "3", // [51]
  "4", // [52]
  "5", // [53]
  "6", // [54]
  "7", // [55]
  "8", // [56]
  "9", // [57]
  ":", // [58]
  ";", // [59]
  "<", // [60]
  "=", // [61]
  ">", // [62]
  "?", // [63]
  "@", // [64]
  "A", // [65]
  "B", // [66]
  "C", // [67]
  "D", // [68]
  "E", // [69]
  "F", // [70]
  "G", // [71]
  "H", // [72]
  "I", // [73]
  "J", // [74]
  "K", // [75]
  "L", // [76]
  "M", // [77]
  "N", // [78]
  "O", // [79]
  "P", // [80]
  "Q", // [81]
  "R", // [82]
  "S", // [83]
  "T", // [84]
  "U", // [85]
  "V", // [86]
  "W", // [87]
  "X", // [88]
  "Y", // [89]
  "Z", // [90]
  "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
  "", // [92]
  "", // [93]
  "", // [94]
  "", // [95]
  "NP_0", // [96]
  "NP_1", // [97]
  "NP_2", // [98]
  "NP_3", // [99]
  "NP_4", // [100]
  "NP_5", // [101]
  "NP_6", // [102]
  "NP_7", // [103]
  "NP_8", // [104]
  "NP_9", // [105]
  "MULTIPLY", // [106]
  "ADD", // [107]
  "SEPARATOR", // [108]
  "SUBTRACT", // [109]
  "DECIMAL", // [110]
  "DIVIDE", // [111]
  "F1", // [112]
  "F2", // [113]
  "F3", // [114]
  "F4", // [115]
  "F5", // [116]
  "F6", // [117]
  "F7", // [118]
  "F8", // [119]
  "F9", // [120]
  "F10", // [121]
  "F11", // [122]
  "F12", // [123]
  "", // [124]
  "", // [125]
  "", // [126]
  "", // [127]
  "", // [128]
  "", // [129]
  "", // [130]
  "", // [131]
  "", // [132]
  "", // [133]
  "", // [134]
  "", // [135]
  "", // [136]
  "", // [137]
  "", // [138]
  "", // [139]
  "", // [140]
  "", // [141]
  "", // [142]
  "", // [143]
  "NUM_LOCK", // [144]
  "SCROLL_LOCK", // [145]
  "", // [146]
  "", // [147]
  "", // [148]
  "", // [149]
  "", // [150]
  "", // [151]
  "", // [152]
  "", // [153]
  "", // [154]
  "", // [155]
  "", // [156]
  "", // [157]
  "", // [158]
  "", // [159]
  "CIRCUMFLEX", // [160]
  "!", // [161]
  "\"", // [162]
  "#", // [163]
  "$", // [164]
  "%", // [165]
  "&", // [166]
  "_", // [167]
  "(", // [168]
  ")", // [169]
  "*", // [170]
  "+", // [171]
  "|", // [172]
  "HYPHEN_MINUS", // [173]
  "{", // [174]
  "}", // [175]
  "~", // [176]
  "", // [177]
  "", // [178]
  "", // [179]
  "", // [180]
  "VOLUME_MUTE", // [181]
  "VOLUME_DOWN", // [182]
  "VOLUME_UP", // [183]
  "", // [184]
  "", // [185]
  ";", // [186]
  "=", // [187]
  ",", // [188]
  "-", // [189]
  ".", // [190]
  "/", // [191]
  "", // [192]
  "", // [193]
  "", // [194]
  "", // [195]
  "", // [196]
  "", // [197]
  "", // [198]
  "", // [199]
  "", // [200]
  "", // [201]
  "", // [202]
  "", // [203]
  "", // [204]
  "", // [205]
  "", // [206]
  "", // [207]
  "", // [208]
  "", // [209]
  "", // [210]
  "", // [211]
  "", // [212]
  "", // [213]
  "", // [214]
  "", // [215]
  "", // [216]
  "", // [217]
  "", // [218]
  "[", // [219]
  "/", // [220]
  "]", // [221]
  "\'", // [222]
  "" // [223]
];
        
    //nonstandard bindings that we will be using
    this.special = {};
    this.special[13] = 128 //New line = 128 = String.newline()
    this.special[8] = 129  // Backspace = 129 = String.backspace()
    this.special[37] = 130 // Left Arrow = 130
    this.special[38] = 131 // Up Arrow = 131
    this.special[39] = 132 // Right Arrow = 132
    this.special[40] = 133 // Down Arrow = 133
    this.special[36] = 134 // Home = 134
    this.special[35] =135  // End = 135
    this.special[33] =136  // Page Up = 136
    this.special[34] =137  // Page Down = 137
    this.special[45] = 138 // Insert = 138
    this.special[46] = 139 // Delete = 139
    this.special[27] = 140 // ESC = 140
        for(var i = 112;i<124;i++) // F1 - F12 = 141 - 152
            this.special[i] = i+29;
    
        //map our bindings onto the standard ascii map
        this.keyboardMap[32] = 'SPACE';
        this.keyboardMap[128] = 'ENTER';
        this.keyboardMap[129] = 'BACK';
        this.keyboardMap[130] = 'LEFT';
        this.keyboardMap[131] = 'UP';
        this.keyboardMap[132] = 'RIGHT';
        this.keyboardMap[133] = 'DOWN';
        this.keyboardMap[134] = 'HOME';
        this.keyboardMap[135] = 'END';
        this.keyboardMap[136] = 'PGUP';
        this.keyboardMap[137] = 'PGDWN';
        this.keyboardMap[138] = 'INS';
        this.keyboardMap[139] = 'DEL';
        this.keyboardMap[140] = 'ESC';
        for(var i = 141;i<153;i++){
            this.keyboardMap[i] = 'F'+(i-140).toString();
        }
    }
    
}
