let xhr = new XMLHttpRequest();

xhr.open('GET', chrome.runtime.getURL("./gesco-plus/link-list.html"), true);

xhr.onreadystatechange = function() {
if (xhr.readyState === 4 && xhr.status === 200) { 
    let themeHolder = document.getElementById("link-list");
    
    let linksList = getObjFromHtml(xhr.responseText, 'list');
    let links = linksList.getElementsByClassName("option");

    getCurrentTabUrl().then((response) => {

        let URL = trimUrl(response);
        for(let i=0; i<links.length; i++)
        {
            console.log(URL)
            if(normalizeText(links[i].textContent) === URL || URL.includes("gesco-plus"))
            {
                links[i].href = "";
                links[i].classList.add("selected");
                break;
            }
        }

        themeHolder.append(linksList);
    
    });

}
}.bind(this);

xhr.send();

async function getCurrentTabUrl() {
    const tabs = await chrome.tabs.query({ active: true })
    return tabs[0].url.toString();
}

function getObjFromHtml(html, wrapperClass){
    return document.createRange().createContextualFragment(`<div class="${wrapperClass}">${html}</div>`).firstElementChild;
}

function trimUrl(url)
{
    url = removeText(url,chrome.runtime.getURL(""));
    url = removeText(url,".html");
    url = url.replace(/gesco-plus\/[^\/]+\/([^\/]+)/,'$1');
    url = url.toLowerCase();

    return url;
}

function normalizeText(txt)
{
    txt = txt.toLowerCase();
    txt = txt.replace(/ /g,"");

    return txt;
}

function removeText(string, textToRemove) {
    let parts = string.toString().split(textToRemove);
    let result = parts.join('');
  
    return result;
}