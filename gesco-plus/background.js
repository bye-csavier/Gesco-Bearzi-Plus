chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

   checkChromeLocalStorageVars()

   if( changeInfo.status === 'complete' && tab.url)
   {
      if(tab.url.includes("https://gesco.bearzi.it"))
      {
         
            chrome.tabs.sendMessage(tabId,{
               type: "APPLY_THEME",
               url: tab.url
            })

            if(tab.url.includes("secure/scuola/famiglie/allievo"))
            {
               chrome.tabs.sendMessage(tabId,{
                  type: "GET_USER_DATA",
                  url: tab.url
               })
               
               chrome.tabs.sendMessage(tabId,{
                  type: "RIMUOVI_DUPLICATO_VALUTAZIONI",
                  url: tab.url
               })
            }

            if(tab.url.includes("/valutazioni-tabella"))
            {
               chrome.tabs.sendMessage(tabId,{
                  type: "CALC_VALUTAZIONI",
                  url: tab.url
               })
            }

      }
      
   }

   async function checkChromeLocalStorageVars()
   {
         inizializeChromeLocalStorageVar('theme',JSON.stringify({uhm:'yo'}));
   }

   async function inizializeChromeLocalStorageVar(varName, value)
   {
         chrome.storage.local.get([varName]).then((result) => {
            if(!(typeof Object.values(result)[0] !== 'undefined' && Object.values(result)[0] !== null)){ 
               let temp = {}
               temp[varName] = value; 
               chrome.storage.local.set(temp);
            }
         });
   }

//!?!
});

  