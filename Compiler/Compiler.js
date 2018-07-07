//reads in a .jack file, compiles it into a .vm file, prints the results to stdout
// need to add throws for error messages! give line number for original statements? 

class Analyzer {
    
  constructor(f) {
    this.keywords = ['class',
      'constructor',
      'function',
      'method',
      'field', 'static',
      'var',
      'int', 'char', 'boolean', 'void',
      'true', 'false', 'null',
      'this', 'let', 'do', 'if', 'else',
      'while', 'return'
    ]; 
    
    this.symbols = ['(', ')', '{', '}', '[', ']',
      '.', ',', ';', '+', '-', '*', '/', '&', '|',
      '<', '>', '=', '~'];
    
      
    //var parsed = []; //contains an array of [parsed line, line number] with comments removed
       
        
        
    var lines = f.replace('\t', ' ');
    var startComment;
    while ( (startComment = lines.indexOf('//') ) !== -1 ) {
      var first = lines.slice(0, startComment);
      var endComment = lines.indexOf('\n', startComment);
      var last = lines.slice(endComment);
      lines = first + last;
    }
        
    this.inputStream = lines;
    Analyzer.prototype.lineCount = 1; //start on the first line, every time \n encountered increment. used for debugging
        
  }
       
    
    
  advance() {
    //returns the next token. If no tokens left,
    //returns null
        
    //removes leading whitespace
        
    if (this.inputStream.charAt(0) === ' ' || this.inputStream.charAt(0) === '\t' ) {
           
      this.inputStream = this.inputStream.slice(1);
          
      return this.advance();
    }
           
        
        
    // checks to see if we are looking at a multi-line comment, skips ahead if so
    if (this.inputStream.slice(0, 2) === '/*') {
            
      var endCut = this.inputStream.indexOf('*/');
            
      if (endCut === -1) { throw ('Line ' + Analyzer.prototype.lineCount + ' Comment is not closed!'); }
      endCut += 2;
      //counts the number of new lines in our multiline comment
            
      Analyzer.prototype.lineCount += (this.inputStream.slice(0, endCut).match(/\n/g) || []).length; 
      this.inputStream = this.inputStream.slice(endCut);
      return this.advance();
    }
        
    //if we encounter a new line, skip it and increment the linecount
    if (this.inputStream.charAt(0) === '\n') {
            
      Analyzer.prototype.lineCount += 1;
      this.inputStream = this.inputStream.slice(1);
      return this.advance();
    }
        
        
    if (this.inputStream.replace(' ', '').length === 0) { return null; }
        
    //checks to see if we are looking at a string (leading char is \")
    // if so, pull the entire string as a token
    if (this.inputStream.charAt(0) == '"') {
      var closing_index = this.inputStream.indexOf('"', 1); 
      var token = this.inputStream.slice(0, closing_index + 1);
      this.inputStream = this.inputStream.slice(token.length);
      return token;
    }
            
        
    //checks to see if we are looking at a symbol
    if ( this.symbols.includes( this.inputStream.charAt(0) ) ) {
      var token = this.inputStream.charAt(0);
      this.inputStream = this.inputStream.slice(1);
      return token;
    }
            
        
    // gets a potential token, read up to the next whitespace character
    // this potential token requires further parsing as it might contain a symbol inside, which
    // should delimit the token instead of the whitespace
    // example:   "A=M+3;" returns foundInside = [';','+','=']
        
    var potential_token = this.inputStream.split(' ', 1)[0];
        
    var foundInside = [];
        
    // add one of each symbol found inside the potential token to the list of "found inside"
    for (var i = 0; i < potential_token.length; i++) {
      if ( this.symbols.includes( potential_token.charAt(i) ) & !foundInside.includes( potential_token.charAt(i) ) ) { foundInside.push( potential_token.charAt(i) ); }
    }
        
    //if there is a symbol inside, use it to delimit our token, always slicing to the first token
    if (foundInside.length > 0) {
      for (var i = 0; i < foundInside.length; i++) { potential_token = potential_token.split( foundInside[i], 1)[0]; }
    }
        
    //chops out the token from our input stream and returns it
    var token = potential_token;
    this.inputStream = this.inputStream.slice(token.length).trim();
        
    return token;
        
  }
    
  hasMoreTokens() {
    if (this.peek()) { return true; }
    return false;
  }
        
        
  peek() {
    // returns the next symbol without removing it from the stream
    var token = this.advance();
    if (!token) { return null; }
    this.inputStream = token + ' ' + this.inputStream;
    return token;
  }
        
            
  tokenType(token) {
    //returns the type of token we have obtained
        
    if ( token.charAt(0) == '"' ) { return 'stringConstant'; }
        
    if (this.keywords.includes(token)) { return 'keyword'; }
    if (this.symbols.includes(token)) { return 'symbol'; }
    if ( '0123456789'.includes(token.charAt(0))) { return 'integerConstant'; }
        
    return 'identifier';
  }
        
        
  keyWord(token) {
    //returns the keyword of the current 
    //token
    return token;
  }

  intVal(token) {
    return parseInt(token);
  }
        
    
  stringVal(token) {
    //strips the quotes off of our token
    return token.slice(1, token.length - 1); 
  }
        
    
  symbolOperator(token) {
    if ( token === '+') { return 'add'; } else if (token === '-') { return 'sub'; } else if (token === '*') { return 'call Math.multiply 2'; } else if (token === '/') { return 'call Math.divide 2'; } else if (token === '&') { return 'and'; } else if (token === '|') { return 'or'; } else if (token === '<') { return 'lt'; } else if (token === '>') { return 'gt'; } else if (token === '=') { return 'eq'; }
        
    return null; 
  }
        
}

class CompileJack {
    
  constructor() {
        
  }

  process(file_with_path) {
    this.fetch = new Analyzer(file_with_path);
    this.symbol = new SymbolTable();
    this.indent = 0;
    this.whileCount = -1;
    this.ifCount = -1;
    CompileJack.prototype.line = ''; //current line to be printed
    CompileJack.prototype.lines = [];
    this.CompileClass();
  }
        
        
  xml_ify(token) {
    //replaces the characters <,>,",and " with their xml equivalants
    token = token.replace('&', '&amp;');
    token = token.replace('<', '&lt;');
    token = token.replace('>', '&gt;');
    token = token.replace('"', '&quot;');
    return token;
  }
        
  static print(token) {
    CompileJack.prototype.line += token;
    CompileJack.prototype.lines.push(CompileJack.prototype.line);
    CompileJack.prototype.line = '';
  }
    
  out(token) {
    //prints out the parsed XML line
        
    //indent for readability
    for (var i = 0; i < this.indent; i++) { CompileJack.line += '  '; }
        
            
    // check if we have an int
    if (Number.isInteger( token )) {
      type = this.fetch.tokenType( token.toString() );
      CompileJack.print('<' + type + '> ' + token.toString() + ' </' + type + '>');
    }
           
        
    //we have a string
    else {
      type = this.fetch.tokenType(token);
            
      //remove quotes form string constants, otherwise just print the type and string
      if (type === 'stringConstant') { token = this.fetch.stringVal(token); }
                
      //removes non-xml-compatable characters from our token
      token = this.xml_ify(token);
      CompileJack.print('<' + type + '> ' + token + ' </' + type + '>');
            
    }
            
            
            
  }    
    
  CompileClass() {
        
    this.indent += 1;
    var f = this.fetch;
    this.AssertAndAdvance('class'); //encountered a class "class"
        
    this.class_name = f.advance(); 
        
    this.AssertAndAdvance('{'); //opens the class '{'
        
    //might have class variables, check for them!
    var peek = f.peek(); //class Var Dec
    var classVars = 0;
    this.staticVarCount = 0;
    while ( ['static', 'field'].includes( peek )) {
      classVars += this.CompileClassVarDec();
      peek = f.peek();
    }
           
    //class variables dealt with, move on to
    //class subroutine Dec
    while (['constructor', 'function',
      'method', 'void'].includes( peek )) {
      this.CompileSubroutine(classVars);
      peek = f.peek();
    }
            
            
         
            
    this.AssertAndAdvance('}'); //ends the class '}'
        
    this.indent -= 1;        
  }
    
  //advances the token stream and asserts that the new token has the expected value.
  //returns the token, throws if an unexpected value is enountered
  // *value can be an array of potential values
  AssertAndAdvance(value) {
    var token = this.fetch.advance();
        
    if (Array.isArray(value)) {
      if (value.includes(token)) { return token; }
    } else {
      if (value === token) { return token; }
    }
    throw ('Line: ' + Analyzer.prototype.lineCount + ' expected "' + value + '" but got "' + token + '"');
  }
        
    
  CompileClassVarDec() {
    //CompileJack.print_tag('<classVarDec>')
    //KIND IS FIELD
    this.indent += 1;
    var f = this.fetch;
    var num_of_vars = 1;
    var f_or_s = f.advance(); //field or static
    var type = f.advance();  
    var varName = f.advance(); 
    this.symbol.define(varName, type, f_or_s);
    var peek = f.peek();
    while ( peek === ',' ) {
      f.advance(); //remove the ','
      varName = f.advance();//varName
      this.symbol.define(varName, type, f_or_s);
      peek = f.peek();
      num_of_vars += 1;
    }
            
            
    this.AssertAndAdvance(';'); //';'
    if (f_or_s !== 'static') {
      return num_of_vars;
    }
            
    return 0;
        
  }
       
        
  CompileSubroutine(classVariables = 0) {
        
    this.indent += 1;
    var f = this.fetch;
        
    this.whileCount = -1;
    this.ifCount = -1;
    this.symbol.startSubroutine();
    var sub_type = f.advance(); //could be a constructor/function/method
        
    if (sub_type === 'method')
    //first arg pushed is 'this'
    { this.symbol.define('this', 'object', 'arg'); }
        
        
    var return_type = f.advance(); //return type or void
    if (return_type === 'void') { this.voidReturn = true; } else { this.voidReturn = false; }
    var sub_name = f.advance(); //subroutineName 
       
    this.AssertAndAdvance('('); // '('
        
    var parameter_count = this.CompileParameterList();
        
    this.AssertAndAdvance(')'); // ')'
        
    this.AssertAndAdvance('{'); // '{' starts the body of the subroutine
        
    var num_of_method_vars = 0;
    var peek = f.peek();
    while (peek === 'var') {
      num_of_method_vars += this.CompileVarDec();
      peek = f.peek();
    }
                
    var functionName = this.class_name + '.' + sub_name;
    //find num of variables declared!
    VMWriter.writeFunction(functionName, num_of_method_vars);
        
        
        
    if (sub_type === 'constructor') {
            
      CompileJack.print ('push constant ' + classVariables.toString() );
      CompileJack.print('call Memory.alloc 1');
      CompileJack.print('pop pointer 0');
    }
            
    if (sub_type === 'method') {
      CompileJack.print('push argument 0');
      CompileJack.print('pop pointer 0');
    }
            
            
        
    this.CompileSubroutineBody();
        
    this.indent -= 1;
        
    
        
  }
        
    
  CompileParameterList() {
    //((type varName)(','type varName)*)?
    var parameter_count = 0;
    this.indent += 1;
    var f = this.fetch;
    var peek = f.peek();
    while (peek !== ')') {
      parameter_count += 1;
      var type = f.advance();// type or varName
      var varName = f.advance();
      this.symbol.define(varName, type, 'arg');
      peek = f.peek();
      if (peek === ',') { f.advance(); } else if (peek !== ')') { throw ('Line: ' + Analyzer.prototype.lineCount); }
    }
            
    this.indent -= 1;
    return parameter_count;
        
  }
        
            
  CompileSubroutineBody() {
    this.indent += 1;
    var f = this.fetch;
    var num_of_vars = 0;
    var peek = f.peek();
    while (peek !== '}') {
      this.CompileStatements();
      peek = f.peek();
    }
            
    this.AssertAndAdvance('}'); //'}' end of our function
    //print('i had '+str(num_of_vars)+ ' variables')
    this.indent -= 1;
  }
        

  CompileVarDec() {
    this.indent += 1;
    var f = this.fetch;
    var num_of_vars = 1;
    var variable_token = f.advance();  
    var type = f.advance();  
    var varName = f.advance(); 
    this.symbol.define(varName, type, 'var');
    var peek = f.peek();
    while (peek === ',') {
      this.AssertAndAdvance(','); //','
      varName = f.advance(); //varName
      this.symbol.define(varName, type, 'var');
            
      //is the var type not built-in? allocate a new object!
      if (!(['int', 'char', 'boolean'].includes(varName))) { continue; }
                
                
            
      peek = f.peek();
      num_of_vars += 1;
    }
            
    this.AssertAndAdvance(';'); //';' ends declaration
    this.indent -= 1;
    return num_of_vars;
        
  }
        
            
  CompileStatements() {
    this.indent += 1;
    var f = this.fetch;
    var peek = f.peek();
    //what if an invalid statement is seen?
    do {
      this.CompileStatement();
      peek = f.peek();
    }
    while (['let', 'if', 'while', 'do', 'return'].includes(peek));
            
        
        
        
    this.indent -= 1;
  }
        
        
  CompileStatement() {
    var f = this.fetch;
    var peek = f.peek();
    if (peek === 'let') { this.CompileLet(); } else if (peek === 'if') { this.CompileIf(); } else if (peek === 'while') { this.CompileWhile(); } else if (peek === 'do') { this.CompileDo(); } else if (peek === 'return') { this.CompileReturn(); } else { throw ('Line: ' + Analyzer.prototype.lineCount + ' invalid statement, expected one of [let,if,while,do,return]'); }
  }
        
        
        
  CompileDo() {
    this.indent += 1;
    var f = this.fetch;
    this.AssertAndAdvance('do'); //do command
    var peek = f.peek();
    while (peek !== ';') {
      this.CompileSubroutineCall();
      peek = f.peek();
    }
            
    this.AssertAndAdvance(';');// ';' end of do command
    VMWriter.pop('temp', 0); //all do commands pop and ignore local 0
    this.indent -= 1;
  }
        
        
  CompileLet() {
    this.indent += 1;
    var f = this.fetch;
    this.AssertAndAdvance('let');// let keyword
    var varName = f.advance();
        
    var peek = f.peek();
    var array = false;
    var kind;
    if (peek === '[') {
      array = True;
      this.AssertAndAdvance('['); //'[' array open bracket
      peek = f.peek();
      if (peek !== ']') { this.CompileExpression(); }
      this.AssertAndAdvance(']');//']' array close bracket
            
      var array_var_number = this.symbol.indexOf(varName).toString();
      kind = this.symbol.kindOf(varName);
      //if arrayvar number is broken! throw
            
      if (array_var_number === null) {
        throw ('Line: ' + Analyzer.prototype.lineCount);
      }
      VMWriter.push(kind, array_var_number);
      CompileJack.print('add');
    }
            
            
            
        
    this.AssertAndAdvance('=');// '=' 
    this.CompileExpression();
        
    this.AssertAndAdvance(';'); // ';'
    var var_symbol_num = this.symbol.indexOf(varName);
    kind = this.symbol.kindOf(varName);
        
    if (array) {
      CompileJack.print('pop temp 0');
      CompileJack.print('pop pointer 1');
      CompileJack.print('push temp 0');
      CompileJack.print('pop that 0');
    } else {
      VMWriter.pop(kind, var_symbol_num);
    }
            
    this.indent -= 1;
  }
       
        
        
  CompileWhile() {
    /* while(cond){ stuff}
        
        Label1
         ~(cond)
        if-goto Label2
        stuff
        goto Label1
        Label2
        */
        
    this.indent += 1;
    this.whileCount += 1;
    var wCount = this.whileCount.toString();
    VMWriter.writeLabel('WHILE_EXP' + wCount);
        
    var f = this.fetch;
    this.AssertAndAdvance('while'); //while
    this.AssertAndAdvance('(');//'('
    var peek = f.peek();
    while (peek !== ')') {
      this.CompileExpression();
      peek = f.peek();
    }
            
    this.AssertAndAdvance(')');// ')'
    CompileJack.print('not');
        
    CompileJack.print('if-goto ' + 'WHILE_END' + wCount);
       
    this.AssertAndAdvance('{');// '{'
    peek = f.peek();
    while (peek !== '}') {
      this.CompileStatements();
      peek = f.peek();
    }
            
    this.AssertAndAdvance('}');// '}'
    CompileJack.print('goto ' + 'WHILE_EXP' + wCount);
    VMWriter.writeLabel('WHILE_END' + wCount);
        
    this.indent -= 1;
  }
        
        
        
  CompileReturn() {
    this.indent += 1;
    var f = this.fetch;
    this.AssertAndAdvance('return');// 'return'
    var peek = f.peek();
    while (peek !== ';') {
      this.CompileExpression();
      peek = f.peek();
    }
            
           
    this.AssertAndAdvance(';');// ';' end of return statement
    if (this.voidReturn) { CompileJack.print('push constant 0'); }
        
    CompileJack.print('return');
        
        
    this.indent -= 1;
  }
        
        
  CompileIf() {
    /*
        if(cond)
        s1
        else
        s2
        
        ~(cond)
        if-goto Label1
        s1
        goto Label2
        Label1
        s2
        Label2
        */
    this.indent += 1;
    var f = this.fetch;
    this.AssertAndAdvance('if');//'if
    this.AssertAndAdvance('(');//'('
    var peek = f.peek();
    this.ifCount += 1;
    var ifCount = this.ifCount.toString();
        
    while (peek !== ')') {
      this.CompileExpression();
      peek = f.peek();
    }
            
    this.AssertAndAdvance(')');//')'
    CompileJack.print('if-goto IF_TRUE' + ifCount);
    CompileJack.print('goto IF_FALSE' + ifCount);
    CompileJack.print('label IF_TRUE' + ifCount);
    this.AssertAndAdvance('{');// '{'
        
    peek = f.peek();
    while (peek !== '}') {
      this.CompileStatements();
      peek = f.peek();
    }
            
    this.AssertAndAdvance('}');// '}'
        
        
    peek = f.peek();
    if (peek === 'else') {
      CompileJack.print('goto IF_END' + ifCount);
      CompileJack.print('label IF_FALSE' + ifCount);
      this.AssertAndAdvance('else');//'else'
      this.AssertAndAdvance('{');// '{'
      while (peek !== '}') {
        this.CompileStatements();
        peek = f.peek();
      }
                
      this.AssertAndAdvance('}');// '}'
            
      CompileJack.print('label IF_END' + ifCount);
    } else {
      CompileJack.print('label IF_FALSE' + ifCount);
    }
            
    this.indent -= 1;
  }
        
        
  CompileExpression() {
    this.indent += 1;
    //term (op term)*
    var f = this.fetch;
    var peek = f.peek();
    this.CompileTerm();
    peek = f.peek();
    //what is valid after a term? a symbol or end of line????
    while ( ['+', '-', '*', '/', '&', '|',
      '<', '>', '='].includes(peek)) {
      var token = f.advance();
      var operator_statement = f.symbolOperator(token);// operator symbol
      this.CompileTerm();
      CompileJack.print(operator_statement);
      peek = f.peek();
    }
            
        
    this.indent -= 1;
  }
       
       
        
  CompileTerm(self) {
    //term (op term)*
    //if term is identifier, distinguish between
    //[ ( or .
    this.indent += 1;
    var f = this.fetch;
    var token = f.advance();
    var type = f.tokenType(token);
    if (type === 'integerConstant') {
      VMWriter.push('constant', token);
            
    } else if ( type === 'stringConstant') {
      VMWriter.writeString(token);
            
    } else if (type == 'keyword') {
      VMWriter.writeKeyword(token);
            
    }
            
    //( expression )
    else if ( token == '(') {
      this.CompileExpression();
      this.AssertAndAdvance(')'); //token = f.advance()//) end of parenthisis
    } else if ( ['-', '~'].includes(token) ) {
      this.CompileTerm();
      if (token === '-') { CompileJack.print('neg'); }
      if (token === '~') { CompileJack.print('not'); }
    } else if ( type === 'identifier') {
      var peek = f.peek();
           
      //subroutine call
      if (peek === '.') {
        this.CompileSubroutineCall(token);
      }
                
                
      //varName [ expression ]
      else if ( peek == '[') {
        var varName = token;
        var kind = this.symbol.kindOf(varName);
                
        this.AssertAndAdvance('[');
        this.CompileExpression();
        this.AssertAndAdvance(']');
                
        var var_symbol_num = this.symbol.indexOf(varName);
        VMWriter.push(kind, var_symbol_num);
        CompileJack.print('add');
        CompileJack.print('pop pointer 1');
        CompileJack.print('push that 0');
      }
               
                
      //variable
      else {
        var varName = token;
        var var_symbol_num = this.symbol.indexOf(varName);
        var kind = this.symbol.kindOf(varName);
        VMWriter.push(kind, var_symbol_num);
      }
                
    } else {
      throw ('Line: ' + Analyzer.prototype.lineCount + ' unexpected term: ' + token);
    }
            
        
    this.indent -= 1;
  }
       
                
  CompileExpressionList() {
    this.indent += 1;
    var f = this.fetch;
    var peek = f.peek();
    var num_of_expressions = 0;
    while (peek !== ')') {
      num_of_expressions += 1;
      this.CompileExpression();
      peek = f.peek();
      if (peek === ',') {
        f.advance(); // ',' seperates another expression
        peek = f.peek();
      }
                
    }
            
                
        
    this.indent -= 1;
    return num_of_expressions;
  }
        
       
    
  CompileSubroutineCall(className = '') {
    var f = this.fetch;
    var token = f.advance(); //could be a '.' or (
    var num_subroutine_arguments = 0;
    var subroutine_name;
    if (className !== '') {
      subroutine_name = className + '.';
    } else {
      subroutine_name = token;
      className = token;
    }
           
            
    while (token !== '(') {
      token = f.advance();
      if (token !== '(') {
        subroutine_name += token;
      }
                
    }
            
                
    // if we are calling a method in another object, push the first arg to be
    // a reference to the base of that object. write a call to the class's subroutine
    // if we are calling a method in this object, push our pointer to this object, then
    // write a call to the class method        
    if ( this.symbol.getTableOf(className) ) {
      var index = this.symbol.indexOf(className);
      var kind = this.symbol.kindOf(className);
      var type = this.symbol.typeOf(className);
      if (index === null || kind === null || type === null) {
        throw ('Line: ' + Analyzer.prototype.lineCount);
      }
      subroutine_name = type + '.' + subroutine_name.split('.', 1)[1]; //[1]? in javascript
      VMWriter.push(kind, index);
      num_subroutine_arguments += 1;
    }
           
        
    if ( subroutine_name.indexOf('.') == -1 ) {
      //we have a call to this object's method. 
      subroutine_name = this.class_name + '.' + subroutine_name;
      CompileJack.print('push pointer 0');
      num_subroutine_arguments += 1;
    }
           
        
    num_subroutine_arguments += this.CompileExpressionList();
    token = this.AssertAndAdvance(')'); //')' end of subroutine call's arguments
        
    //this.symbol.printTables()
        
        
    VMWriter.writeCall(subroutine_name, num_subroutine_arguments);
  }
        
        
}


class Symbol {
  constructor(name, type, kind) {
    this.name = name;
    this.type = type;
    if (kind === 'var') { this.kind = 'local'; } else if (kind === 'field') { this.kind = 'field'; } else { this.kind = kind; }
  }
}
    

class SymbolTable {
  //subroutine variables are accessed by *local
  //subroutine argument variables are accessed by *argument
  //static class variables are accessed by *static
  //access to class fields in a subroutine are found by pointing to 
  //the "this" segment, then accessing the field via this index reference
    
    
  constructor() {
    this.classTable = [];
    this.subroutineTable = [];
  }
    
  startSubroutine() {
    this.subroutineTable = [];
  }
    
  define(name, type, kind) {
    var newSymbol = new Symbol(name, type, kind);
    if (kind === 'arg' || kind === 'var') { this.subroutineTable.push(newSymbol); }
    if (kind === 'static' || kind === 'field') { this.classTable.push(newSymbol); }
        
  }
        
  varCount(kind) {
    var num = 0;
    var table;
    if (kind === 'arg' || kind === 'var') { table = this.subroutineTable; }
    if (kind === 'static' || kind === 'field') { table = this.classTable; }
    for (var i = 0; i < table.length; i++) {
      if (i.kind === kind) { num += 1; }
    }
            
    return num;
  }
    
  kindOf(name) {
    //what kind of variable is name?
        
    var table = this.getTableOf(name);
    if (table) {
            
      for (var i = 0; i < table.length; i++) {
        if (table[i].name == name) {
          return table[i].kind;
        }
      }
    }
    return null;
  }
    
  typeOf(name) {
    //what type of variable is name?
        
    var table = this.getTableOf(name);
    if (table) {
            
      for (var i = 0; i < table.length; i++) {
        if (table[i].name == name) {
          return table[i].type;
        }
      }
    }
    return null;
  }
    
  getTableOf(name) {
    //returns the table which contains our variable
    //is our name in the subroutine?
    for (var i = 0; i < this.subroutineTable.length; i++) {
      if (this.subroutineTable[i].name === name) { return this.subroutineTable; }
    }
        
    //is our name a class var?
    for (var i = 0; i < this.classTable.length; i++) {
      if (this.classTable[i].name === name) { return this.classTable; }
    }
  }
    
  indexOf(name) {
    var table = this.getTableOf(name);
    if (table) {
      var nameKind = this.kindOf(name);
            
      for (var i = 0; i < table.length; i++) {
        if (table[i].name === name && table[i].kind === nameKind) {
          return i;
        }
      }
    }
    return null;
  }
  printTables() {
    console.log('classTable', this.classTable);
    console.log('subroutineTable', this.subroutineTable);
  }
}
    

class VMWriter {
  constructor() {
        
  }
  static push(segment, index) {
    if (index === null) {
      throw ('Line: ' + Analyzer.prototype.lineCount);
    }
    if (segment === 'arg') { segment = 'argument'; }
    if (segment === 'field') { segment = 'this'; }
    CompileJack.print('push ' + segment + ' ' + index.toString() );
         
  }
  static pop(segment, index) {
             
    if (segment === 'arg') { segment = 'argument'; }
    if (segment === 'field') { segment = 'this'; }
    CompileJack.print('pop ' + segment + ' ' + index.toString() );
  }
  static writeLabel(label) {
    CompileJack.print('label ' + label);
        
  }
    
  static writeCall(name, nArgs) {
        
    CompileJack.print('call ' + name + ' ' + nArgs.toString() );
        
  }
        
        
  static writeFunction(name, nLocals) {
        
    CompileJack.print('function ' + name + ' ' + nLocals.toString() );
        
  }
    
    
  static writeKeyword(keyword) {
    if (keyword === 'true') {
      CompileJack.print('push constant 0');
      CompileJack.print('not');
    } else if (keyword === 'false' || keyword === 'null') {
            
      CompileJack.print('push constant 0');
    } else if ( keyword === 'this') {
            
      CompileJack.print('push pointer 0');
    } else {
            
      CompileJack.print(keyword);
    }
  }
       
            
    
  static writeString(string) {
    string = string.slice(1, string.length - 1); //removes quotes
    var length = string.length;
    CompileJack.print('push constant ' + length.toString() );
    CompileJack.print('call String.new 1');
    for (var i = 0; i < string.length; i++) {
      var code = string.charAt(i).charCodeAt(0); //get ascii number from char
      CompileJack.print('push constant ' + code.toString() );
      CompileJack.print('call String.appendChar 2');
    }
           
  }
        
}




var compile = text =>{
  var c = new CompileJack();
  var sol = {err: null, lines: []};
  try {
    c.process(text);
  } catch (err) {
    sol.err = err;
  }

  sol.lines = c.lines;
  return sol;
};