import { exist } from "../assets/js/utils.js";

//=== SETUP USER DATA ===============================================================================

document.addEventListener('DOMContentLoaded', function() {

    syncGescoPlusRootTheme();

    const linkList = document.querySelector(".page-selector");
    const arrowToggler = document.getElementById('link-list-toggle');
    const content = document.getElementById('content');

    arrowToggler.addEventListener('click',()=>{
        linkList.classList.toggle('hide');
        arrowToggler.classList.toggle('toggled');
        content.classList.toggle('page-selector-closed')
    });

});

export function syncGescoPlusRootTheme(passedRoot = null, endCallBack = null)
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