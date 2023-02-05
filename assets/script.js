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
				<button id="${cName}" class="c-progress">${cProgress + "%"}</button>
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
        $(".c-progress").click(function () {
            $(".c-progress").removeClass("selected");
            $(this).addClass("selected");
            localStorage.setItem("selected", this.id);
            getData();
        });
        document
            .getElementById(localStorage.getItem("selected"))
            .classList.add("selected");
    }
};

localStorage.setItem("uname", "YOUR-USERNAME");
localStorage.setItem("key", "YOUR-API-KEY");

chrome.storage.local.set({ uname: localStorage.getItem("uname") }, () => {});
chrome.storage.local.set({ key: localStorage.getItem("key") }, () => {});

function auth() {
    return true;
}

function login(uname, key) {}
function register(uname, pwd) {}

function getData() {
    let course = localStorage
        .getItem("selected")
        .replaceAll("&", "i")
        .replaceAll(" ", "")
        .trim();
    let req = makeHttpObject();
    let url = "https://iownthis.000webhostapp.com/read.php";
    let params =
        "username=" +
        localStorage.getItem("uname") +
        "&key=" +
        localStorage.getItem("key") +
        "&course=" +
        course;
    req.open("POST", url, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            // document.getElementById("chart").innerText = "";
            let data = req.responseText;
            localStorage.setItem("req_data", data);

            // let dates = data.slice(0, 5).map((el) => el[0]);
            // localStorage.setItem("req_dates", dates);

            // let overall = data.slice(0, 5).map((el) => {
            //     let p = el.at(-1)[0];
            //     return p / 100;
            // });
            // localStorage.setItem("req_overall", overall);
            chart();
        } else {
            // document.getElementById("chart").innerText = "error";
        }
    };
    req.send(params);
}

if (auth()) {
    getData();
}

function chart() {
    let data = localStorage.getItem("req_data");

    let dates = JSON.parse(data)
        .slice(0, 5)
        .map((el) => el[0]);
    dates.unshift("x");

    let overall = JSON.parse(data)
        .slice(0, 5)
        .map((el) => {
            let p = el.at(-1)[0];
            return p / 100;
        });
    overall.unshift("overall");

    let daily = JSON.parse(data)
        .slice(0, 5)
        .map((el) => {
            let p = el.at(-1)[0] - el.at(1)[0];
            return p / 100;
        });
    daily.unshift("daily");

    if (document.getElementById("chart").childNodes.length === 0) {
        console.log("empty");
        window.graph = c3.generate({
            bindto: "#chart",
            size: {
                height: 200,
            },
            padding: {
                right: 10,
                left: 10,
            },
            data: {
                x: "x",
                xFormat: "%Y%m%d",
                columns: [
                    dates,
                    // ["overall", 0.05, 0.1, 0.2, 0.21, 0.3],
                    overall,
                    daily,
                ],
                types: {
                    daily: "bar",
                },
            },
            axis: {
                x: {
                    type: "timeseries",
                    // if true, treat x value as localtime (Default)
                    // if false, convert to UTC internally
                    localtime: true,
                    tick: {
                        format: "%d-%m",
                    },
                },
                y: {
                    show: false, // ADD
                },
            },
            // tooltip: { format: { value: d3.format("%") } },
            tooltip: {
                format: {
                    value: function (value, ratio, id) {
                        return (value * 100).toFixed(1) + "%";
                    },
                    //            value: d3.format(',') // apply this format to both y and y2
                },
            },
        });
    } else {
        window.graph.load({
            columns: [
                dates,
                // ["overall", 0.05, 0.1, 0.2, 0.21, 0.3],
                overall,
                daily,
            ],
        });
    }
}
