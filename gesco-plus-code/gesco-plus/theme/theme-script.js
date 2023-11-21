import {exist, sendFileDownload} from '../../assets/js/utilx.js'
import ColorPicker from '../../assets/js/bye-csavier-color-picker.js';
import {syncGescoPlusRootTheme} from '../gesco-plus.js'


document.addEventListener('DOMContentLoaded', function() { //? Attendiamo il caricamento della pagina prima di manipolarne il contenuto
    
    const helper = document.querySelector(".light-theme-helper");
    const helperToggler = document.getElementById('arrow-helper-toggler');

    helperToggler.addEventListener('click',()=>{
        helper.classList.toggle('hideHelper');
        document.documentElement.classList.toggle('inverted-theme-helper');
    });

    syncGescoPlusRootTheme(null, () => { //? La famosa sincronizzazione del tema che ferma la baracca

        /*
        .   Ho deciso di inserire tutto il codice della pagina dentro a questa funzione cosi da poi poterlo chiamare
        .   solo dopo avere finito di sincronizzare il tema; tutto questo perche il colore di base dei color picker
        .   deve essere uguale a quello del tema ma la sincronizzazione del tema è asincrona e il nostro codice verrebe
        .   eseguito troppo presto
        */

        // === MAIN CODE ===============================================================================

        let temp = document.querySelectorAll("#color-picker"); //? "Otteniamo" tutti i contenitori destinati ai color picker all'interno del documento
        var colorPickers = new Array(); //? Inizializziamo il color picker come un'array perche poi ogni color picker portera con se più informazioni (inserite in un ogetto)
        /*
        ?  Questa costante l'avevo insrita con lo scopo di migliorare le prestazioni durante 
        ?  l'aggiornamento live delle variabili, che però ho scelto di disabilitare 
        const root = document.querySelector(':root'); 
        */

        for(let i=0; i < temp.length; i++)
        {
            colorPickers[i] = { element: temp[i], //? Elemento che contiene tutta la struttura del color picker 
                                active: true, //? Tiene traccia dello stato del contenitore (aperto/chiuso)
                                picker: null, //? L'effetivo oggetto color picker
                                color: null, //? L'elemento che contiene la preview del colore
                                variable: null //? La variabile da modificare seguendo il color picker
                            };
        }

        for(let i=0; i < colorPickers.length; i++)
        {
            /*
            ? Qua otteniamo la variabile preimpostata da modificare e ne "applichiamo lo stile"
            ? al nostro elemento preview  ottenuto nella prima riga "...querySelector("#color-preview");"
            */
            colorPickers[i].color = colorPickers[i].element.querySelector("#color-preview");
            colorPickers[i].variable = colorPickers[i].element.dataset.var;
            colorPickers[i].color.style.backgroundColor = `var(${colorPickers[i].variable})`;


            // ? Selezioniamo i "bottoni" da cliccare che poi faranno apparire il color picker
            temp = colorPickers[i].element.querySelector("#picker-btn"); 
            temp.addEventListener("click", function(){
                if(colorPickers[i].active === true)
                {
                    colorPickers[i].active = false;
                    openColorPicker(colorPickers[i])
                }
                else{
                    colorPickers[i].active = true;
                    closeColorPicker(colorPickers[i])
                }

            }.bind(this) );

            //? Otteniamo il contenitore del nostro color picker(obj) è impostiamo il colore della preview nei suoi dati
            temp = colorPickers[i].element.querySelector("#picker-container");
            temp.dataset.color = window.getComputedStyle(colorPickers[i].color).backgroundColor;

            colorPickers[i].picker = new ColorPicker(temp, temp.dataset.color); //? Inizializzamo il nostro color picker, passandogli il contenitore e il colore di base

            colorPickers[i].picker.onChangeEvent = () => {
                let color = colorPickers[i].picker.getHexColor();
                colorPickers[i].color.style.backgroundColor = color; //? Ogni volta che il color picker riceve un'input noi asseginamo il colore alla preview
                // setRootVar(colorPickers[i].variable,color, root);
            };
        }

        // ! Actions
        /*
        ?   Qui semplicemente ad ogni rispettivo tasto l'azione da compiere alla pressione
        */
        temp = document.getElementById('save');
        temp.addEventListener('click',() => { saveEdit() });

        temp = document.getElementById('cancel');
        temp.addEventListener('click',() => { cancelEdit() });

        const importedTheme = document.getElementById('importedTheme');
        importedTheme.addEventListener('change',() => { importTheme() });

        temp = document.getElementById('export');
        temp.addEventListener('click',() => { exportTheme() });
    
        // === FUNCTIONS ===============================================================================
        /** 
        * Apre il color picker
        * 
        * @param {HTMLElement} colorPickerElement L'intera struttura del color picker, cioè "colorPickers[i].element"
        **/
        function openColorPicker(colorPickerElement)
        {
            colorPickerElement.element.classList.remove("closed"); 
            colorPickerElement.picker.onRevealFunc();   
        }

        /** 
        * Chiude il color picker
        * 
        * @param {HTMLElement} colorPickerElement L'intera struttura del color picker, cioè "colorPickers[i].element"
        **/
        function closeColorPicker(colorPickerElement)
        {
            colorPickerElement.element.classList.add("closed");
        }

        /** 
        * Normalizza le variabili css trasformando i "-" in "_" rendendole valide per js
        * 
        * @param {String} name Nome variabile da normalizzare
        **/
        function normalizeCSSvar(name){
            return name.replace(/\-/g,'_')
        }

        /** 
        * Normalizza le variabili js trasformando i "_" in "-" rendendole valide per css
        * 
        * @param {String} name Nome variabile da normalizzare
        **/
        function normalizeJSvar(name){
            return name.replace(/\_/g,'-')
        }

        /** 
        * Imposta le variabili dello stile andando a modificare il ":root" del documento
        * 
        * @param {String} variable Nome variabile da modificare
        * @param {String} value Valore da assegnare
        **/
        function setRootVar(variable, value, passedRoot = null)
        {
            if(exist(passedRoot))
            {
                passedRoot.style.setProperty(variable, value);
            }
            else{
                document.querySelector(':root').style.setProperty(variable, value);
            }
        }

        /** 
        * Prende i valori dal ":root" del documento
        * 
        * @param {String} variable Nome della variabile da ottenere
        **/
        function getRootVar(variable, passedRoot = null)
        {
            if(exist(passedRoot))
            {
                return getComputedStyle(passedRoot).getPropertyValue(variable);
            }
            else{
                let root = document.querySelector(':root');
                return getComputedStyle(root).getPropertyValue(variable);
            }
        }

        /** 
        * Salva i colori dei color picker nel chrome local storage (seguendo la nomenclatura delle variabili del tema)
        **/
        function saveEdit(bypassConfirm = false ,atEndCallBack = () => {location.reload(true);}){
            
            let confirmation = true;
            if(!bypassConfirm){
                confirmation = confirm("Sei sicuro di salvare le modifiche? Le impostazioni correnti andranno perse."); //? Chiediamo conferma all'utente prima di salvare le impostazioni
            }

            if(confirmation)
            {
                let temp = {};

                for(let i=0; i < colorPickers.length; i++)
                {
                    /*
                    ?   Inseriamo nell'oggetto temporaneo ogni singolo colore accoppiato alla sua variabile
                    */
                    temp[normalizeCSSvar(colorPickers[i].variable)] = colorPickers[i].picker.getHexColor(); 
                }
                
                chrome.storage.local.set({theme: JSON.stringify(temp)}).then(atEndCallBack); //? E infine lo salviamo sotto il nome di "theme"
                    
            }
        }

        /** 
        * Sincronizza la pagina e poi la ricarica annulando cosi le modifiche non salvate
        **/
        function cancelEdit(){
            let confirmation = confirm("Sei sicuro di annulare le modifiche? Le modifiche andranno perse.");
            if(confirmation)
            {
                syncGescoPlusRootTheme(null,() => {location.reload(true);});
            }
        }

        /** 
        * Dopo che l'utente sceglie un file noi ne leggiamo il contenuto, lo salviamo in memoria come "theme" sovrascrivendo l'eventuale versione corrente e poi ricarichiamo la pagina
        **/
        function importTheme(){

            var file = importedTheme.files[0];

            if (exist(file)) {
                let reader = new FileReader();

                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    if(exist(evt.target.result))
                    {
                        chrome.storage.local.set({theme: evt.target.result}).then(()=>{
                            location.reload();
                        });
                    }
                    
                }
                reader.onerror = function (evt) {
                    throw new Error("cannot read file");
                }
            }
        }

        /** 
        * Esporta il tema corrente e fa partire un download del file generato per l'utente
        **/
        function exportTheme(){
            let confirmation = confirm("Cliccando su 'EXPORT', le impostazioni correnti verranno salvate. Sei sicuro di voler procedere?");
            if(confirmation)
            {
                saveEdit(true,() => {

                    let fileName = '';
                
                    do{
                        fileName = prompt("Inserisci un nome per il tuo tema", fileName); //? Lasciamo che l'utente scelga un nome per il suo file
                        
                        if(!exist(fileName)){ return; } //? Usciamo dal codice in caso che l'utente clicchi "annulla"

                        temp = !!(fileName.match(/^[\p{L}\p{N}_\-~() ]+$/gu)); //? Controlliamo che il nome del file sia valido (!! = trasfroma "null" in "false")
                        if(!temp)
                        {
                            alert("!!\nInserisci un nome valido per il file\n(non deve contenere l'estensione o caratteri invalidi)\n!!")
                        }
                        
                    }while(!temp)
                    
                    chrome.storage.local.get([`theme`]).then((result) => {
                        if(exist(Object.values(result)[0])){
                            sendFileDownload(result.theme,`${fileName}.gptheme`, ()=>{location.reload()}); //? Chiamiamo "sendFileDownload" passandogli il tema salvato in memoria e il nome del file dato dall'utente 
                        }
                    });

                });
    
            }

        }

    });
// !!! END
});
