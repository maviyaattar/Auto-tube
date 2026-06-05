/* ======================================
   AUTOTUBE AI
   PRODUCTION SCRIPT
====================================== */

const API =
"https://autotube-kajc.onrender.com";

const App = {

    token:
    localStorage.getItem("token") || "",

    user: null,

    projects: [],

    channels: [],

    settings: null
};

/* ======================================
   DOM HELPERS
====================================== */

const $ = selector =>
document.querySelector(selector);

const $$ = selector =>
document.querySelectorAll(selector);

/* ======================================
   TOAST
====================================== */

function toast(message,type="success"){

    const toast =
    document.createElement("div");

    toast.className =
    `toast ${type}`;

    toast.innerText =
    message;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },100);

    setTimeout(()=>{

        toast.remove();

    },3500);
}

/* ======================================
   LOADER
====================================== */

function showLoader(){

    let loader =
    document.getElementById("globalLoader");

    if(loader) return;

    loader =
    document.createElement("div");

    loader.id =
    "globalLoader";

    loader.innerHTML =
    `
    <div class="loader"></div>
    `;

    document.body.appendChild(loader);
}

function hideLoader(){

    const loader =
    document.getElementById("globalLoader");

    if(loader)
    loader.remove();
}

/* ======================================
   API CLIENT
====================================== */

async function api(
endpoint,
method="GET",
body=null
){

    const options = {

        method,

        headers:{
            "Content-Type":
            "application/json"
        }
    };

    if(App.token){

        options.headers.Authorization =
        `Bearer ${App.token}`;
    }

    if(body){

        options.body =
        JSON.stringify(body);
    }

    try{

        showLoader();

        const response =
        await fetch(
            API + endpoint,
            options
        );

        const data =
        await response.json();

        hideLoader();

        if(!response.ok){

            throw new Error(
                data.msg ||
                "Request Failed"
            );
        }

        return data;

    }catch(error){

        hideLoader();

        toast(
            error.message,
            "error"
        );

        throw error;
    }
}

/* ======================================
   TOKEN
====================================== */

function saveToken(token){

    App.token = token;

    localStorage.setItem(
        "token",
        token
    );
}

function clearToken(){

    App.token = "";

    localStorage.removeItem(
        "token"
    );
}

/* ======================================
   LOGIN
====================================== */

async function login(){

    const email =
    $("#email").value.trim();

    const password =
    $("#password").value.trim();

    if(!email || !password){

        return toast(
            "Enter email and password",
            "error"
        );
    }

    try{

        const data =
        await api(
            "/api/login",
            "POST",
            {
                email,
                password
            }
        );

        saveToken(
            data.token
        );

        toast(
            "Login Success"
        );

        await bootstrap();

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   SIGNUP
====================================== */

async function signup(){

    const email =
    $("#email").value.trim();

    const password =
    $("#password").value.trim();

    const name =
    email.split("@")[0];

    if(!email || !password){

        return toast(
            "Fill all fields",
            "error"
        );
    }

    try{

        const data =
        await api(
            "/api/signup",
            "POST",
            {
                name,
                email,
                password
            }
        );

        saveToken(
            data.token
        );

        toast(
            "Account Created"
        );

        await bootstrap();

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   LOGOUT
====================================== */

function logout(){

    clearToken();

    showPage(
        "loginPage"
    );

    toast(
        "Logged Out"
    );
}

/* ======================================
   PAGE NAVIGATION
====================================== */

function showPage(id){

    $$(".page")
    .forEach(page=>{

        page.classList.add(
            "hidden"
        );

    });

    document
    .getElementById(id)
    .classList.remove(
        "hidden"
    );
}

function bindNavigation(){

    $$(".nav-btn")
    .forEach(button=>{

        button.addEventListener(
            "click",
            ()=>{

                $$(".nav-btn")
                .forEach(btn=>{

                    btn.classList.remove(
                        "active"
                    );

                });

                button.classList.add(
                    "active"
                );

                const page =
                button.dataset.page;

                showPage(
                    page + "Page"
                );
            }
        );
    });
}

/* ======================================
   YOUTUBE CONNECT
====================================== */

async function connectYoutube(){

    try{

        const data =
        await api(
            "/api/youtube/connect"
        );

        window.location.href =
        data.url;

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   GOOGLE CALLBACK
====================================== */

async function handleOAuthCallback(){

    const params =
    new URLSearchParams(
        window.location.search
    );

    const code =
    params.get("code");

    if(!code)
    return;

    if(!App.token)
    return;

    try{

        await api(
            "/api/youtube/callback",
            "POST",
            {
                code
            }
        );

        toast(
            "YouTube Connected"
        );

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

    }catch(err){

        console.error(err);
    }
}
/* ======================================
   BOOTSTRAP
====================================== */

async function bootstrap(){

    try{

        showPage(
            "dashboardPage"
        );

        await Promise.all([

            loadChannels(),

            loadProjects(),

            loadSettings()

        ]);

        updateDashboard();

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   CHANNELS
====================================== */

async function loadChannels(){

    try{

        const data =
        await api(
            "/api/channels"
        );

        App.channels =
        data.channels || [];

        document
        .getElementById(
            "totalChannels"
        ).textContent =
        App.channels.length;

        renderChannels();

    }catch(err){

        console.error(err);
    }
}

function renderChannels(){

    const container =
    document.getElementById(
        "connectedChannels"
    );

    if(!container)
    return;

    container.innerHTML = "";

    if(
        !App.channels.length
    ){

        container.innerHTML =
        `
        <div class="empty-state">
            No channels connected
        </div>
        `;

        return;
    }

    App.channels.forEach(
    channel=>{

        container.innerHTML +=
        `
        <div class="channel-card">

            <img
            src="${channel.profileImg}"
            alt="profile">

            <div>

                <h4>
                ${channel.channelTitle}
                </h4>

                <p>
                ${channel.channelId}
                </p>

            </div>

            <button
            onclick="deleteChannel('${channel._id}')">

            Delete

            </button>

        </div>
        `;
    });
}

async function deleteChannel(id){

    if(
        !confirm(
        "Delete Channel?"
        )
    ) return;

    try{

        await api(
            `/api/channels/${id}`,
            "DELETE"
        );

        toast(
            "Channel Deleted"
        );

        loadChannels();

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   PROJECTS
====================================== */

async function loadProjects(){

    try{

        const data =
        await api(
            "/api/projects"
        );

        App.projects =
        data.projects || [];

        renderProjects();

    }catch(err){

        console.error(err);
    }
}

function renderProjects(){

    const container =
    document.getElementById(
        "projectContainer"
    );

    const dashboard =
    document.getElementById(
        "dashboardProjects"
    );

    if(container)
    container.innerHTML = "";

    if(dashboard)
    dashboard.innerHTML = "";

    App.projects.forEach(
    project=>{

        const card =
        createProjectCard(
            project
        );

        if(container)
        container.innerHTML +=
        card;

        if(dashboard)
        dashboard.innerHTML +=
        card;
    });

    updateDashboard();
}

function createProjectCard(
project
){

    return `
    <div class="project-card">

        <div class="project-top">

            <h3>
            ${project.name}
            </h3>

            <span
            class="status
            ${project.status}">

            ${project.status}

            </span>

        </div>

        <p>

        Niche:
        ${project.niche}

        </p>

        <p>

        Upload:
        ${project.uploadTime}

        </p>

        <p>

        Reels:
        ${project.reelsPerDay}

        </p>

        <div
        class="project-actions">

            <button
            class="edit-btn"
            onclick="editProject('${project._id}')">

            Edit

            </button>

            <button
            class="history-btn"
            onclick="openHistory('${project._id}')">

            History

            </button>

            <button
            class="generate-btn"
            onclick="generateVideo('${project._id}')">

            Generate

            </button>

            <button
            class="delete-btn"
            onclick="deleteProject('${project._id}')">

            Delete

            </button>

        </div>

    </div>
    `;
}

/* ======================================
   DELETE PROJECT
====================================== */

async function deleteProject(
id
){

    if(
        !confirm(
        "Delete Project?"
        )
    ) return;

    try{

        await api(
            `/api/projects/${id}`,
            "DELETE"
        );

        toast(
            "Project Deleted"
        );

        loadProjects();

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   GENERATE VIDEO
====================================== */

async function generateVideo(
id
){

    try{

        toast(
            "Generating..."
        );

        const data =
        await api(
            `/api/projects/${id}/generate`,
            "POST"
        );

        toast(
            "Video Uploaded"
        );

        console.log(data);

        loadProjects();

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   ANALYTICS
====================================== */

async function loadAnalytics(
projectId
){

    try{

        const data =
        await api(
            `/api/analytics/${projectId}`
        );

        const analytics =
        data.analytics;

        document
        .getElementById(
            "totalUploads"
        ).textContent =
        analytics.totalUploads;

        return analytics;

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   DASHBOARD
====================================== */

function updateDashboard(){

    const totalProjects =
    App.projects.length;

    const activeProjects =
    App.projects.filter(
    p=>
    p.status==="active"
    ).length;

    document
    .getElementById(
        "totalProjects"
    ).textContent =
    totalProjects;

    document
    .getElementById(
        "activeProjects"
    ).textContent =
    activeProjects;
}
/* ======================================
   PROJECT FORM STATE
====================================== */

let editingProjectId = null;

const DEFAULT_PROJECT = {

    name: "",

    niche: "quote",

    topics: [],

    theme: "gold-islamic",

    privacy: "public",

    uploadTime: "18:00",

    timezone: "Asia/Kolkata",

    reelsPerDay: 1,

    episodeEnabled: false,

    channelId: ""
};

/* ======================================
   CREATE PROJECT
====================================== */

function openCreateProject(){

    editingProjectId = null;

    fillProjectForm(
        DEFAULT_PROJECT
    );

    document
    .getElementById(
        "projectModal"
    )
    .classList
    .add("show");
}

/* ======================================
   EDIT PROJECT
====================================== */

function editProject(id){

    const project =
    App.projects.find(
    p=>p._id===id
    );

    if(!project)
    return;

    editingProjectId = id;

    fillProjectForm(
        project
    );

    document
    .getElementById(
        "projectModal"
    )
    .classList
    .add("show");
}

/* ======================================
   CLOSE MODAL
====================================== */

function closeProjectModal(){

    document
    .getElementById(
        "projectModal"
    )
    .classList
    .remove("show");
}

/* ======================================
   FILL FORM
====================================== */

function fillProjectForm(
project
){

    $("#projectName").value =
    project.name || "";

    $("#projectTheme").value =
    project.theme || "";

    $("#projectNiche").value =
    project.niche || "";

    $("#uploadTime").value =
    project.uploadTime || "";

    $("#timezone").value =
    project.timezone || "";

    $("#privacy").value =
    project.privacy || "";

    $("#reelsPerDay").value =
    project.reelsPerDay || 1;

    $("#reelsCount").innerText =
    project.reelsPerDay || 1;

    $("#episodeEnabled").checked =
    project.episodeEnabled || false;

    if(project.channelId){

        const id =
        project.channelId._id ||
        project.channelId;

        $("#channelSelect").value =
        id;
    }

    if(project.topics){

        $("#topicsInput").value =
        project.topics.join(",");
    }
}

/* ======================================
   CHANNEL DROPDOWN
====================================== */

function populateChannelDropdown(){

    const select =
    $("#channelSelect");

    if(!select)
    return;

    select.innerHTML = "";

    App.channels.forEach(
    channel=>{

        select.innerHTML +=
        `
        <option
        value="${channel._id}">
        ${channel.channelTitle}
        </option>
        `;
    });
}

/* ======================================
   SAVE PROJECT
====================================== */

async function saveProject(){

    const payload = {

        name:
        $("#projectName")
        .value
        .trim(),

        niche:
        $("#projectNiche")
        .value,

        theme:
        $("#projectTheme")
        .value,

        privacy:
        $("#privacy")
        .value,

        uploadTime:
        $("#uploadTime")
        .value,

        timezone:
        $("#timezone")
        .value,

        reelsPerDay:
        Number(
            $("#reelsPerDay")
            .value
        ),

        episodeEnabled:
        $("#episodeEnabled")
        .checked,

        channelId:
        $("#channelSelect")
        .value,

        topics:
        $("#topicsInput")
        .value
        .split(",")
        .map(x=>x.trim())
        .filter(Boolean)
    };

    if(!payload.name){

        return toast(
            "Project name required",
            "error"
        );
    }

    if(!payload.channelId){

        return toast(
            "Select channel",
            "error"
        );
    }

    try{

        if(editingProjectId){

            await api(

                `/api/projects/${editingProjectId}`,

                "PUT",

                payload
            );

            toast(
                "Project Updated"
            );

        }else{

            await api(

                "/api/projects",

                "POST",

                payload
            );

            toast(
                "Project Created"
            );
        }

        closeProjectModal();

        loadProjects();

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   REELS SLIDER
====================================== */

function bindSlider(){

    const slider =
    $("#reelsPerDay");

    const output =
    $("#reelsCount");

    if(!slider)
    return;

    slider.addEventListener(
        "input",
        ()=>{

            output.innerText =
            slider.value;
        }
    );
}

/* ======================================
   THEME PREVIEW
====================================== */

function bindThemePreview(){

    const theme =
    $("#projectTheme");

    const preview =
    $("#themePreview");

    if(
        !theme ||
        !preview
    ) return;

    theme.addEventListener(
        "change",
        ()=>{

            preview.className =
            "";

            preview.classList.add(

                "theme-preview",

                theme.value
            );
        }
    );
}

/* ======================================
   HISTORY
====================================== */

async function openHistory(
projectId
){

    try{

        showPage(
            "historyPage"
        );

        const data =
        await api(
            `/api/projects/${projectId}/history`
        );

        const uploads =
        data.uploads || [];

        const table =
        document
        .getElementById(
            "historyTable"
        );

        table.innerHTML = "";

        uploads.forEach(
        upload=>{

            table.innerHTML +=
            `
            <tr>

                <td>
                ${upload.title}
                </td>

                <td>
                ${new Date(
                    upload.createdAt
                ).toLocaleString()}
                </td>

                <td>

                    <a
                    href="${upload.videoUrl}"
                    target="_blank">

                    View

                    </a>

                </td>

            </tr>
            `;
        });

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   SETTINGS
====================================== */

async function loadSettings(){

    try{

        const data =
        await api(
            "/api/settings"
        );

        App.settings =
        data.settings;

        renderSettings();

    }catch(err){

        console.error(err);
    }
}

function renderSettings(){

    if(!App.settings)
    return;

    const s =
    App.settings;

    const brand =
    document.getElementById(
        "brandName"
    );

    const series =
    document.getElementById(
        "seriesName"
    );

    const handle =
    document.getElementById(
        "channelHandle"
    );

    const description =
    document.getElementById(
        "descriptionTemplate"
    );

    if(brand)
    brand.value =
    s.brandName || "";

    if(series)
    series.value =
    s.seriesName || "";

    if(handle)
    handle.value =
    s.channelHandle || "";

    if(description)
    description.value =
    s.description || "";
}

async function saveSettings(){

    try{

        const payload = {

            brandName:
            document
            .getElementById(
                "brandName"
            ).value,

            seriesName:
            document
            .getElementById(
                "seriesName"
            ).value,

            channelHandle:
            document
            .getElementById(
                "channelHandle"
            ).value,

            description:
            document
            .getElementById(
                "descriptionTemplate"
            ).value
        };

        await api(
            "/api/settings",
            "POST",
            payload
        );

        toast(
            "Settings Saved"
        );

        loadSettings();

    }catch(err){

        console.error(err);
    }
}

/* ======================================
   AUTO LOGIN
====================================== */

async function checkLogin(){

    if(!App.token){

        showPage(
            "loginPage"
        );

        return;
    }

    try{

        await bootstrap();

    }catch(err){

        clearToken();

        showPage(
            "loginPage"
        );
    }
}

/* ======================================
   EVENT BINDINGS
====================================== */

function bindEvents(){

    const loginBtn =
    document.getElementById(
        "loginBtn"
    );

    if(loginBtn){

        loginBtn.addEventListener(
            "click",
            login
        );
    }

    const signupBtn =
    document.getElementById(
        "signupBtn"
    );

    if(signupBtn){

        signupBtn.addEventListener(
            "click",
            signup
        );
    }

    const youtubeBtn =
    document.getElementById(
        "youtubeConnectBtn"
    );

    if(youtubeBtn){

        youtubeBtn.addEventListener(
            "click",
            connectYoutube
        );
    }

    const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

    if(logoutBtn){

        logoutBtn.addEventListener(
            "click",
            logout
        );
    }

    const saveBtn =
    document.getElementById(
        "saveSettingsBtn"
    );

    if(saveBtn){

        saveBtn.addEventListener(
            "click",
            saveSettings
        );
    }

    const createBtn =
    document.getElementById(
        "createProjectButton"
    );

    if(createBtn){

        createBtn.addEventListener(
            "click",
            openCreateProject
        );
    }

    const modalSave =
    document.getElementById(
        "saveProjectBtn"
    );

    if(modalSave){

        modalSave.addEventListener(
            "click",
            saveProject
        );
    }

    const modalClose =
    document.getElementById(
        "closeProjectModal"
    );

    if(modalClose){

        modalClose.addEventListener(
            "click",
            closeProjectModal
        );
    }
}

/* ======================================
   STARTUP
====================================== */

async function start(){

    bindNavigation();

    bindEvents();

    bindSlider();

    bindThemePreview();

    await handleOAuthCallback();

    await checkLogin();
}

/* ======================================
   DOM READY
====================================== */

document.addEventListener(
    "DOMContentLoaded",
    start
);

/* ======================================
   GLOBAL EXPORTS
====================================== */

window.login =
login;

window.signup =
signup;

window.logout =
logout;

window.saveProject =
saveProject;

window.editProject =
editProject;

window.deleteProject =
deleteProject;

window.openHistory =
openHistory;

window.generateVideo =
generateVideo;

window.connectYoutube =
connectYoutube;

window.saveSettings =
saveSettings;

window.openCreateProject =
openCreateProject;

window.closeProjectModal =
closeProjectModal;

/* ======================================
   OPTIONAL IMPROVEMENTS
====================================== */

// Auto refresh dashboard every 60s

setInterval(()=>{

    if(App.token){

        loadProjects();

        loadChannels();
    }

},60000);

// Enter key login

document.addEventListener(
"keydown",
e=>{

    if(
        e.key==="Enter"
    ){

        const loginPage =
        document.getElementById(
            "loginPage"
        );

        if(
            loginPage &&
            !loginPage.classList.contains(
                "hidden"
            )
        ){

            login();
        }
    }
});
