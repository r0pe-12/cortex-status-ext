try {
    let pageName = document
        .getElementById("course-home-title")
        .innerText.trim();
    // let pageName = document.title.replace(" - Documents", "").trim();
    // if (pageName != "Learning") {

    // Create your observer
    const observer = new MutationObserver(function (mutationList, observer) {
        // Your handling code here
        main(pageName);
    });

    // Select the element you want to watch
    const elementNode = document.querySelector("#module-title");

    // Call the observe function by passing the node you want to watch with configuration options
    observer.observe(elementNode, {
        attributes: false,
        childList: true,
        subtree: false,
    });

    // }
} catch (error) {}

// main function
function main(pageName) {
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
}
