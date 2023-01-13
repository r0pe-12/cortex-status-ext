try {
    let pageName = document
        .getElementById("course-home-title")
        .innerText.trim();
    // let pageName = document.title.replace(" - Documents", "").trim();

    // Create your observer
    const observer = new MutationObserver(function (mutationList, observer) {
        updateTitle(pageName);
        fullscreen();
    });

    // Create your observer
    const subObserver = new MutationObserver(function (mutationList, observer) {
        subMain(pageName);
    });

    // Select the element you want to watch
    const elementNode = document.querySelector("#module-title");
    const titleNode = document.querySelector("title");

    // Call the observe function by passing the node you want to watch with configuration options
    observer.observe(elementNode, {
        attributes: false,
        childList: true,
        subtree: false,
    });

    // Call the observe function by passing the node you want to watch with configuration options
    subObserver.observe(titleNode, {
        attributes: false,
        childList: true,
        subtree: false,
    });
} catch (error) {}

// main function
function updateTitle(pageName) {
    console.log("running function");
    let parser = new DOMParser();

    function getProgress(courses, title = pageName) {
        for (const element of courses) {
            if (
                element.querySelector(".course-title").innerText.trim() == title
            ) {
                let progress = element
                    .querySelector(".aui-progress-indicator")
                    .getAttribute("data-rate");
                return progress;
            }
        }
        return "Course not found";
    }

    function makeHttpObject() {
        try {
            return new XMLHttpRequest();
        } catch (error) {}
        try {
            return new ActiveXObject("Msxml2.XMLHTTP");
        } catch (error) {}
        try {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } catch (error) {}

        throw new Error("Could not create HTTP request object.");
    }

    let request = makeHttpObject();
    request.open(
        "GET",
        "https://docs.ictcortex.me/quiz/learning/my-courses.action",
        true
    );
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            let data = request.responseText;
            let htmlDoc = parser.parseFromString(data, "text/html");
            let courses = htmlDoc.getElementsByClassName("course-meta");
            let progress = getProgress(courses);
            document.title = progress + "% " + pageName;
        }
    };

    // this code will collapse all module tabs, only one which is being watched will be left open
    let modules = document
        .querySelector(".module-tree")
        .querySelectorAll(".module-tree > li");
    for (const element of modules) {
        if (element.classList[0] != "aui-nav-child-selected") {
            element.setAttribute("aria-expanded", "false");
            element
                .querySelector("a > span")
                .classList.replace(
                    "aui-iconfont-expanded",
                    "aui-iconfont-collapsed"
                );
        }
        element.setAttribute(
            "title",
            element
                .querySelectorAll("a")[1]
                .querySelectorAll("span")[1]
                .innerText.trim()
        );
        for (const el of element.querySelectorAll("ul > li")) {
            el.setAttribute(
                "title",
                el.querySelectorAll("a > span")[1].innerText.trim()
            );
        }
    }
}

// function to run when chat changes title
function subMain(pageName) {
    let title = document.querySelector("title").innerText.trim();
    if (title.includes("Document")) {
        updateTitle(pageName);
    }
    return false;
}

// idea of https://github.com/Alldden
// this function enables fullscreen video
function fullscreen() {
    let stateCheck = setInterval(() => {
        if (document.readyState === "complete") {
            clearInterval(stateCheck);
            const iframe = document
                .querySelector("iframe")
                .contentDocument.querySelector("iframe")
                .contentDocument.querySelector("iframe");
            iframe.setAttribute("allow", "fullscreen");
            iframe.setAttribute("src", iframe.src);
        }
    }, 1000);
}
