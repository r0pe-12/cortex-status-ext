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

let parser = new DOMParser();

function write(courses) {
    const div = document.getElementById("stats");
    div.innerText = "";
    for (const element of courses) {
        let cProgress = element
            .querySelector(".aui-progress-indicator")
            .getAttribute("data-rate");
        let cName = element.querySelector(".course-title").innerText;
        let href = element.parentElement.getAttribute("href");
        let data = `
			<div class="stat-card">
				<p class="c-name">
					<a target="_blank" href="https://docs.ictcortex.me${href}">${cName}</a> :
				</p>
				<p class="c-progress">${cProgress + "%"}</p>
			</div>
		`;
        div.innerHTML += data;
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
        write(courses);
    }
};
