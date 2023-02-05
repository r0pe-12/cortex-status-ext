$(".save-button").click(function () {
    let username = $("#username").val().toString();
    let key = $("#key").val().toString();

    localStorage.setItem("uname", username);
    localStorage.setItem("key", key);

    console.log(key);

    // chrome.storage.local.set(
    //     { uname: localStorage.getItem("uname") },
    //     () => {}
    // );
    // chrome.storage.local.set({ key: localStorage.getItem("key") }, () => {});
});
