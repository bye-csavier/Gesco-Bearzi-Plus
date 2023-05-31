(() => {
    
    let aTestSilly;

    const sezioneBrutta = document.querySelector('.gl-valutazioni1').parentElement;
    console.log(sezioneBrutta);
    if(sezioneBrutta != null)
    {
        sezioneBrutta.remove();
    }

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
       
        const {type} = obj;
                
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

            let temp = document.getElementById("tabella-valutazioni_wrapper");
            temp = temp.parentNode.insertBefore(document.createElement('div'), temp);
            temp.classList.add('gesme-ext','wrapper');

            for(let i=0; i<medieMaterie.length; i++)
            {
                temp.append(creaElementoMedia(medieMaterie[i].nome,medieMaterie[i].media));
            }

        }

        
    })

})();

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

    console.log(elemento);

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

