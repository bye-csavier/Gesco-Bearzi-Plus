chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if( changeInfo.status === 'complete' && tab.url && tab.url.includes("https://gesco.bearzi.it/") && tab.url.includes("/valutazioni-tabella"))
  {
     //console.log("tab: " + tab + "\n" + "tab.id: " + tab.id + "\n" + "tabId: " + tabId + "\n");

     chrome.tabs.sendMessage(tabId,{
        type: "CALC_VALUTAZIONI"
     })

  }

//!?!
});

  