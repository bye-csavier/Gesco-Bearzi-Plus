//=== MAIN ===============================================================================

(() => {
    
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
       
        const {type, url} = obj;
        
        if(type === "APPLY_THEME")
        {
            adjustGescoHTML(url);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', chrome.runtime.getURL("./assets/css/gesco-theme-min.css"), true);

            xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                
                let themeHolder = document.createElement('style');
                themeHolder.innerHTML = xhr.responseText;
                themeHolder.classList.add("gesco-plus-theme");
                
                document.documentElement.append(themeHolder);

                syncGescoPlusRootTheme();

                /* document.body.classList.add("gesme-zoom-fix");
                document.documentElement.classList.add("gesme-zoom-fix");
                let zoomTimeout = setTimeout(function(){
                    document.body.classList.remove("gesme-zoom-fix");
                    document.documentElement.classList.remove("gesme-zoom-fix");
                    clearTimeout(zoomTimeout);
                    zoomTimeout = null;
                }.bind(this), 50); */
            }
            }.bind(this);

            xhr.send();
        }

        if(type === "GET_USER_DATA")
        {
            let username = document.getElementById("menu-top-right");
            username = username.querySelector(".dropdown-toggle")
            
            chrome.storage.local.set({ user: username.textContent })

        }

        if(type === "RIMUOVI_DUPLICATO_VALUTAZIONI")
        {
            if(exist(document.querySelector('.gl-valutazioni1')))
            {
                const sezioneBrutta = document.querySelector('.gl-valutazioni1').parentElement.parentElement;

                if(exist(sezioneBrutta))
                {
                    sezioneBrutta.remove();
                }
            }
        }

        if(type === "CALC_VALUTAZIONI")
        {
            const materie = document.getElementsByClassName("valutazione-riga");
            const medieMaterie = new Array();

            for(let i = 0; i < materie.length/2; i++)
            {
                let temp = calcolaMedia(materie[i]);
                if(!isNaN(temp))
                {
                    medieMaterie.push({ nome: semplificaNome(materie[i].childNodes[1].textContent), 
                                        media: temp});
                }
                
            }

            chrome.storage.local.set({ medie: medieMaterie })

            let temp = document.getElementById("tabella-valutazioni_wrapper");
            
            if(document.getElementsByClassName('gesme-ext').length <= 0)
            {
                temp = temp.parentNode.insertBefore(document.createElement('div'), temp);
                temp.classList.add('gesme-ext','wrapper');

                for(let i=0; i<medieMaterie.length; i++)
                {
                    temp.append(creaElementoMedia(medieMaterie[i].nome,medieMaterie[i].media));
                }
            }
            
        }

        
    })

})();

//=== FUNZIONI ===============================================================================

function calcolaMedia(materia)
{
    var voti = materia.getElementsByClassName('valutazione');

    var fattoreVoti = 0;
    var fattorePesi = 0;

    for(let i = 0; i < voti.length; i++)
    {
        if(voti[i].dataset.peso > 0 && !isNaN(voti[i].dataset.valutazione) && (voti[i].querySelector('.label-primary') === null))
        {
            fattoreVoti += parseFloat(voti[i].dataset.valutazione) * parseFloat(voti[i].dataset.peso);
            fattorePesi += parseFloat(voti[i].dataset.peso);
        }
    }

    return ((fattoreVoti/fattorePesi).toFixed(2));
}

function creaElementoMedia(nome,voto)
{
    let elemento = document.createElement('div')
    elemento.classList.add('gesme-ext','materia');
    
    if(voto >= 6)
    {
        elemento.innerHTML = "<p class =\"titolo\">"+ nome +"</p>" + "\n" + "<p class =\"media up\">" + voto + "<p>";
    }
    else if(voto > 4)
    {
        elemento.innerHTML = "<p class =\"titolo\">"+ nome +"</p>" + "\n" + "<p class =\"media mid\">" + voto + "<p>";
    }
    else
    {
        elemento.innerHTML = "<p class =\"titolo\">"+ nome +"</p>" + "\n" + "<p class =\"media low\">" + voto + "<p>";
    }

    return elemento;
}

function semplificaNome(nome)
{
    switch(nome)
    {

        case "Lingua e letteratura italiana":{
            return "Italiano";
        }

        case "Lingua inglese":{
            return "Inglese";
        }

        case "Matematica e complementi":{
            return "Matematica";
        }

        case "Scienze Motorie e sportive":{
            return "Motoria";
        }

        case "Tecn. e prog. di sistemi inf. e telec.":{
            return "TePrin";
        }

        case "Tecnologie e tecniche di rappr. Grafica":{
            return "Tecnologie";
        }

        default:{
            return nome;
        }
    }
}

function adjustGescoHTML(url){

    if(url.includes("diario"))
    {
        const tabella = document.querySelector(".fc-view-container");

        const callback = () => {
            let eventi = document.getElementsByClassName('fc-event');
            
            for(let i=0; i < eventi.length; i++)
            {
                let bkgColor = eventi[i].style.backgroundColor;
                bkgColor = bkgColor.toLowerCase();
                bkgColor = bkgColor.replace(/ /g,"");

                let color = eventi[i].style.color;
                color = color.toLowerCase();
                color = color.replace(/ /g,"");

                switch(bkgColor)
                {
                    case "cornflowerblue": {
                        eventi[i].classList.add("gesme-compito")
                        break;
                    }
                    case "aquamarine": {
                        eventi[i].classList.add("gesme-lezione")

                        if(color === "red")
                        {
                            eventi[i].classList.add("gesme-supplenza")
                        }

                        break;
                    }
                    case "aqua": {
                        eventi[i].classList.add("gesme-lezionePassata")

                        if(color === "red")
                        {
                            eventi[i].classList.add("gesme-supplenza")
                        }

                        break;
                    }
                    case "violet": {
                        eventi[i].classList.add("gesme-verifica")
                        break;
                    }
                    case "green": {
                        eventi[i].classList.add("gesme-sportello")
                        break;
                    }
                    case "darkseagreen": {
                        eventi[i].classList.add("gesme-corso")
                        break;
                    }
                    case "orange": {
                        eventi[i].classList.add("gesme-eventoSilly")
                        break;
                    }
                    
                }
            }

            if(eventi.length != 0){
                return;
            }

            eventi = document.getElementsByClassName('fc-event-dot');

            for(let i=0; i < eventi.length; i++)
            {
                let bkgColor = eventi[i].style.backgroundColor;
                bkgColor = bkgColor.toLowerCase();
                bkgColor = bkgColor.replace(/ /g,"");

                switch(bkgColor)
                {
                    case "cornflowerblue": {
                        eventi[i].classList.add("gesme-compito")
                        break;
                    }
                    case "aquamarine": {
                        eventi[i].classList.add("gesme-lezione")

                        break;
                    }
                    case "aqua": {
                        eventi[i].classList.add("gesme-lezionePassata")
                        break;
                    }
                    case "violet": {
                        eventi[i].classList.add("gesme-verifica")
                        break;
                    }
                    case "green": {
                        eventi[i].classList.add("gesme-sportello")
                        break;
                    }
                    case "darkseagreen": {
                        eventi[i].classList.add("gesme-corso")
                        break;
                    }
                    case "orange": {
                        eventi[i].classList.add("gesme-eventoSilly")
                        break;
                    }
                    
                }
            }

        };

        let safeCheckTimeOut = setTimeout(function(){
            callback()
            clearTimeout(safeCheckTimeOut);
            safeCheckTimeOut = null;
        }.bind(this), "300");

        const tabellaObserver = new MutationObserver(function(mutationList, observer){
            if(exist(safeCheckTimeOut))
            {
                clearTimeout(safeCheckTimeOut);
                safeCheckTimeOut = null;
            }
            callback();
        }.bind(this));

        tabellaObserver.observe(tabella, { childList: true, subtree: true});

    }

}


function syncGescoPlusRootTheme(passedRoot = null, endCallBack = null)
{
    let root;

    if(!exist(passedRoot))
    {
        root = document.querySelector(':root');
    }
    else{
        root = passedRoot;
    }

    chrome.storage.local.get([`theme`]).then((result) => {
        
        if(exist(Object.values(result)[0])){

            let theme = JSON.parse(result.theme);

            for(let i=4; i>0; i--)
            {
                if(exist(theme[`__clr_main_${i}`])){
                    root.style.setProperty(`--clr-main-${i}`, theme[`__clr_main_${i}`]);
                }
            }

            for(let i=4; i>0; i--)
            {
                if(exist(theme[`__clr_primary_${i}`])){
                    root.style.setProperty(`--clr-primary-${i}`, theme[`__clr_primary_${i}`]);
                }
            }

            for(let i=3; i>0; i--)
            {
                if(exist(theme[`__clr_ntral_${i}`])){
                    root.style.setProperty(`--clr-ntral-${i}`, theme[`__clr_ntral_${i}`]);
                }
            }

            for(let i=3; i>0; i--)
            {
                if(exist(theme[`__clr_shadow${i}`])){
                    root.style.setProperty(`--clr-shadow${i}`, theme[`__clr_shadow${i}`]);
                }
            }

            for(let i=3; i>0; i--)
            {
                if(exist(theme[`__clr_glow${i}`])){
                    root.style.setProperty(`--clr-glow${i}`, theme[`__clr_glow${i}`]);
                }
            }

            if(exist(theme[`__clr_supplenza`])){
                root.style.setProperty(`--clr-supplenza`, theme[`__clr_supplenza`]);
            }

            if(exist(theme[`__clr_lezionePassata_bkg`])){
                root.style.setProperty(`--clr-lezionePassata-bkg`, theme[`__clr_lezionePassata_bkg`]);
            }

            if(exist(theme[`__clr_lezione_bkg`])){
                root.style.setProperty(`--clr-lezione-bkg`, theme[`__clr_lezione_bkg`]);
            }

            if(exist(theme[`__clr_verifica_bkg`])){
                root.style.setProperty(`--clr-verifica-bkg`, theme[`__clr_verifica_bkg`]);
            }

            if(exist(theme[`__clr_lezionePassata_bkg`])){
                root.style.setProperty(`--clr-lezionePassata-bkg`, theme[`__clr_lezionePassata_bkg`]);
            }

            if(exist(theme[`__clr_corso_bkg`])){
                root.style.setProperty(`--clr-corso-bkg`, theme[`__clr_corso_bkg`]);
            }

            if(exist(theme[`__clr_sportello_bkg`])){
                root.style.setProperty(`--clr-sportello-bkg`, theme[`__clr_sportello_bkg`]);
            }

            if(exist(theme[`__clr_eventoSilly_bkg`])){
                root.style.setProperty(`--clr-eventoSilly-bkg`, theme[`__clr_eventoSilly_bkg`]);
            }

            if(exist(endCallBack))
            {
                endCallBack();
            }
        }
        else{
            if(exist(endCallBack))
            {
                endCallBack();
            }
        }
    });
   

}


//--- Utils ----------------------------------------------------

function exist(value)
{
    return (typeof value !== 'undefined' && value !== null);
}

