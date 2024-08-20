// Classe CalcController controlando a lógica da calculadora
class CalcController {

   constructor() {
      // Atributos da classe
      this._audio = new Audio('click.mp3');
      this._audioOnOff = false; //inicia sem som (deligado)
      this._lastOperator = '';
      this._lastNumber = '';
      this._operation = []; // Array para armazenar a operação
      this._locale = 'pt-BR'; // Localização para formatação de data e hora
      this._displayCalcEl = document.querySelector("#display"); // Elemento do display da calculadora
      this._dateEl = document.querySelector("#data"); // Elemento da data
      this._timeEl = document.querySelector("#hora"); // Elemento da hora
      this._currentDate; // Data atual
      this.initialize(); // Inicializa a exibição de data e hora
      this.initButtonsEvents(); // Inicializa os eventos dos botões
      this.initKeyboard();
   }

   pasteFromClipboard(){

      document.addEventListener('paste', e=>{

         let text = e.clipboardData.getData('Text');

         this.displayCalc = parseFloat(text);        
         console.log(text);
      });

   }

   copyToClipboard(){
      let input = document.createElement('input');
      input.value = this.displayCalc;

      document.body.appendChild(input); //appendChild é como um jeito de dizer ao site "Adicione isso aqui!".
      input.select();

      document.execCommand("Copy");
      input.remove();
  
   }

   initialize() {
      // Atualiza data e hora a cada segundo
      this.setDisplayDateTime();
      setInterval(() => {
         this.setDisplayDateTime();
      }, 1000);

      this.setLastNumberToDisplay();
      this.pasteFromClipboard();

      document.querySelectorAll('.btn-ac').forEach(btn =>{
         btn.addEventListener('dblclick', e=>{

            this.toggleAudio();
         });

      });
   }

   toggleAudio(){

      this._audioOnOff = !this._audioOnOff;
   }

   playAudio(){
      if(this._audioOnOff){
         this._audio.currentTime = 0;
         this._audio.play();
      }
   }

   initKeyboard(){
      document.addEventListener('keyup', e=>{

         this.playAudio();

         switch (e.key) {
            case 'Escape': //Esc (limpa calculadora)
               this.clearAll();
               break;
            case 'Backspace':
               this.clearEntry();
               break;
            case '+':
            case '-':
            case '*':
            case '/':
            case '%':
               this.addOperation(e.key);
               break;
            case 'Enter':
            case '=':
               this.calc();
               break;
            case '.':
            case ',':
               this.addDot('.');
               break;
            case '0': 
            case '1': 
            case '2': 
            case '3': 
            case '4':
            case '5': 
            case '6': 
            case '7': 
            case '8': 
            case '9':
               this.addOperation(parseInt(e.key)); // Adiciona um número
               break;
            case 'c':
               if(e.ctrlKey) this.copyToClipboard();
               break;
         }
      });
   }

   // Adiciona múltiplos eventos a um elemento
   addEventListenerAll(element, events, fn) {
      events.split(' ').forEach(event => {
         element.addEventListener(event, fn, false);
      });
   }

   // Limpa todas as operações
   clearAll(){
      this._operation = [];
      this._lastNumber = '';
      this._lastOperator = '';

      this.setLastNumberToDisplay();
   }

   // Remove a última entrada
   clearEntry(){
      this._operation.pop();
      this.setLastNumberToDisplay();
   }

   // Retorna a última operação
   getLastOperation(){
      return this._operation[this._operation.length - 1];
   }

   // Substitui a última operação
   setLastOperation(value){
      this._operation[this._operation.length - 1] = value;
   }

   // Verifica se o valor é um operador (+, -, *, /, %)
   isOperator(value){
      return ['+', '-', '*', '/', '%'].indexOf(value) > -1;
   }

   // Adiciona um valor à operação e verifica se há mais de 3 elementos para calcular
   pushOperation(value){
      this._operation.push(value);
      if (this._operation.length > 3) {
         this.calc();
      }
   }

   getResult(){
      try{ //O código que você coloca dentro do bloco try é aquele que você acha que pode causar um erro.
         return eval(this._operation.join(""));// Calcula a operação
      }catch(e){//Se algum erro ocorrer dentro do bloco try, o controle é passado imediatamente para o bloco catch, onde você pode lidar com o erro
         setTimeout(() =>{
            this.setError();
         }, 1);
      }
   }

   // Realiza o cálculo da operação
   calc(){
      let last = '';

      this._lastOperator = this.getLastItem();

      if (this._operation.length < 3){

         let firstItem = this._operation[0];
         this._operation = [firstItem, this._lastOperator, this._lastNumber];

      }

      if(this._operation.length > 3){

         last = this._operation.pop();
         this._lastNumber = this.getResult();
      }else if(this._operation.length == 3){
         
         this._lastNumber = this.getLastItem(false);
      }

      let result = this.getResult();
      
      if (last == '%'){

         result /= 100;
         this._operation = [result]; 


      }else{
         this._operation = [result]; 

         if(last) this._operation.push(last);

      }

      this.setLastNumberToDisplay();
   }

   getLastItem(isOperator = true){
      let lastItem;

      for (let i = this._operation.length - 1; i >= 0; i--){
         if(this.isOperator(this._operation[i]) == isOperator){
            lastItem = this._operation[i];
            break;
         }
      }

      if(!lastItem) {
         // if ternario: 
         //condição | se for true | ? (então) | executa uma instrução | : (se não) for true executa essa ultima instrução
         lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
      }

      return lastItem;
   }

   setLastNumberToDisplay(){
      // Inicializa a variável para armazenar o último número encontrado
      let lastNumber = this.getLastItem(false); 
 
      if(!lastNumber) lastNumber = 0;

      this.displayCalc = lastNumber;
   }

   // Adiciona um valor à operação ou substitui um operador
   addOperation(value){
      if (isNaN(this.getLastOperation())) { // Se a última entrada não for um número
         
         if (this.isOperator(value)) {
            this.setLastOperation(value); // Substitui o operador
         }else {
            this.pushOperation(value); // Adiciona um número
            this.setLastNumberToDisplay();
         }
      }else {
         
         if (this.isOperator(value)) {
            this.pushOperation(value); // Adiciona o operador
         } else {
            // Concatena números e atualiza o display
            let newValue = this.getLastOperation().toString() + value.toString();
            this.setLastOperation(newValue);
            this.setLastNumberToDisplay(); // Atualiza o display com o último número
         }
      }
   }

   // Exibe erro no display
   setError(){
      this.displayCalc = "Error";
   }

   addDot(){
      let lastOperation = this.getLastOperation();

      if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

      if(this.isOperator(lastOperation) || !lastOperation){
         this.pushOperation('0.');
      }else{
         this.setLastOperation(lastOperation.toString() + '.');
      }

      this.setLastNumberToDisplay();
   }

   // Executa a ação correspondente ao botão clicado
   execBtn(value){

      this.playAudio();

      switch (value) {
         case 'ac':
            this.clearAll();
            break;
         case 'ce':
            this.clearEntry();
            break;
         case 'soma':
            this.addOperation('+');
            break;
         case 'subtracao':
            this.addOperation('-');
            break;
         case 'divisao':
            this.addOperation('/');
            break;
         case 'multiplicacao':
            this.addOperation('*');
            break;
         case 'porcento':
            this.addOperation('%');
            break;
         case 'igual':
            this.calc();
            break;
         case 'ponto':
            this.addDot('.');
            break;
         case '0': 
         case '1': 
         case '2': 
         case '3': 
         case '4':
         case '5': 
         case '6': 
         case '7': 
         case '8': 
         case '9':
            this.addOperation(parseInt(value)); // Adiciona um número
            break;
         default: 
            this.setError(); // Exibe erro para valores inválidos
            break;
      }
   }

   // Inicializa os eventos dos botões
   initButtonsEvents() {
      let buttons = document.querySelectorAll("#buttons > g, #parts > g"); // Seleciona todos os botões

      buttons.forEach((btn, index) => { 
         this.addEventListenerAll(btn, "click drag", e => {
            let textBtn = btn.className.baseVal.replace("btn-", ""); // Obtém o valor do botão
            this.execBtn(textBtn); // Executa a ação do botão
         });
         this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
            btn.style.cursor = "pointer"; // Muda o cursor para ponteiro ao passar o mouse
         });
      });
   }

   // Atualiza data e hora no display
   setDisplayDateTime(){
      this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
         day: "2-digit",
         month: "short",
         year: "numeric",
      });
      this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
   }

   // Getters e Setters do display, data e hora
   get displayTime(){
      return this._timeEl.innerHTML;
   }

   set displayTime(value){
      this._timeEl.innerHTML = value;
   }

   get displayDate(){
      return this._dateEl.innerHTML;
   }

   set displayDate(value){
      this._dateEl.innerHTML = value;
   }

   get displayCalc(){
      return this._displayCalcEl.innerHTML;
   }

   set displayCalc(value) {

      if (value.toString().length > 10){
         this.setError();
         return false;
      }

      this._displayCalcEl.innerHTML = value;
   }

   get currentDate(){
      return new Date();
   }

   set currentDate(value){
      this._currentDate = value;
   }

}