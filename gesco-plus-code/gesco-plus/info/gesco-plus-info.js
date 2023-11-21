import { exist } from "../../assets/js/utilx.js";

document.addEventListener('DOMContentLoaded', function() {

    let temp;

    temp = document.querySelector('#welcome-title h1');

    chrome.storage.local.get([`user`]).then((result) => {
        let daUsername = exist(result.user) == true ? result.user : 'simpaticone';
        temp.innerHTML = temp.innerHTML.replace('?usm?',daUsername);
    });

    let extraLi = document.querySelectorAll('#extra-li');

    for(let i=0; i < extraLi.length; i++)
    {
        extraLi[i].addEventListener('click', ()=>{
            console.log('here')
            extraLi[i].classList.toggle('hideExtra');
        })
    }

});