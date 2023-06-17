document.addEventListener("DOMContentLoaded", () => {

    var optionsButton = document.getElementById('openOptions');
    optionsButton.addEventListener('click', openOptions);

});

function openOptions() {
    if (chrome.runtime.openOptionsPage) 
    {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}
