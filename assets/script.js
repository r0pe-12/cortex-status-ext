document.getElementsByClassName("toggle")[0].onclick = function (e) {
    e.preventDefault();
    change(this.getAttribute("id"));
    this.classList.toggle("toggle-on");
};

if (check("collapse-tabs")) {
    document.getElementById("collapse-tabs").classList.add("toggle-on");
}

function change(name) {
    if (!localStorage.getItem(name)) {
        localStorage.clear();
        chrome.storage.local.clear();
        localStorage.setItem(name, "true");
    }
    const val = check(name) ? "false" : "true";
    const obj = { [name]: [val] };
    chrome.storage.local.set(obj, function () {
        //  Data's been saved boys and girls, go on home
    });
}

function check(name) {
    return localStorage.getItem(name) == "true";
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { newValue }] of Object.entries(changes)) {
        localStorage.setItem(key, newValue);
    }
});
