// script.js

const API =
'https://autotube-kajc.onrender.com'

// =========================
// ELEMENTS
// =========================

const authSection =
document.getElementById(
  'authSection'
)

const dashboardSection =
document.getElementById(
  'dashboardSection'
)

const loader =
document.getElementById(
  'loader'
)

const loginForm =
document.getElementById(
  'loginForm'
)

const signupForm =
document.getElementById(
  'signupForm'
)

const loginTab =
document.getElementById(
  'loginTab'
)

const signupTab =
document.getElementById(
  'signupTab'
)

const channelsDiv =
document.getElementById(
  'channels'
)

const projectsDiv =
document.getElementById(
  'projects'
)

const channelSelect =
document.getElementById(
  'channelSelect'
)

// =========================
// HELPERS
// =========================

function showLoader(){

  loader.style.display='flex'
}

function hideLoader(){

  loader.style.display='none'
}

function token(){

  return localStorage.getItem(
    'token'
  )
}

function authHeaders(){

  return {

    'Content-Type':
    'application/json',

    Authorization:
    `Bearer ${token()}`
  }
}

function showDashboard(){

  authSection.classList.add(
    'hidden'
  )

  dashboardSection.classList.remove(
    'hidden'
  )
}

function showAuth(){

  authSection.classList.remove(
    'hidden'
  )

  dashboardSection.classList.add(
    'hidden'
  )
}

// =========================
// TABS
// =========================

loginTab.onclick=()=>{

  loginTab.classList.add('active')

  signupTab.classList.remove('active')

  loginForm.classList.remove('hidden')

  signupForm.classList.add('hidden')
}

signupTab.onclick=()=>{

  signupTab.classList.add('active')

  loginTab.classList.remove('active')

  signupForm.classList.remove('hidden')

  loginForm.classList.add('hidden')
}

// =========================
// SIGNUP
// =========================

signupForm.onsubmit =
async(e)=>{

  e.preventDefault()

  try{

    showLoader()

    const res =
    await fetch(

      `${API}/api/signup`,

      {

        method:'POST',

        headers:{
          'Content-Type':
          'application/json'
        },

        body:JSON.stringify({

          name:
          document.getElementById(
            'signupName'
          ).value,

          email:
          document.getElementById(
            'signupEmail'
          ).value,

          password:
          document.getElementById(
            'signupPassword'
          ).value

        })
      }
    )

    const data =
    await res.json()

    if(!res.ok){

      throw new Error(
        data.msg
      )
    }

    localStorage.setItem(
      'token',
      data.token
    )

    await initDashboard()

  }catch(err){

    alert(err.message)

  }finally{

    hideLoader()
  }
}

// =========================
// LOGIN
// =========================

loginForm.onsubmit =
async(e)=>{

  e.preventDefault()

  try{

    showLoader()

    const res =
    await fetch(

      `${API}/api/login`,

      {

        method:'POST',

        headers:{
          'Content-Type':
          'application/json'
        },

        body:JSON.stringify({

          email:
          document.getElementById(
            'loginEmail'
          ).value,

          password:
          document.getElementById(
            'loginPassword'
          ).value

        })
      }
    )

    const data =
    await res.json()

    if(!res.ok){

      throw new Error(
        data.msg
      )
    }

    localStorage.setItem(
      'token',
      data.token
    )

    await initDashboard()

  }catch(err){

    alert(err.message)

  }finally{

    hideLoader()
  }
}

// =========================
// CONNECT CHANNEL
// =========================

document.getElementById(
  'connectBtn'
).onclick =
async()=>{

  try{

    showLoader()

    const res =
    await fetch(

      `${API}/api/youtube/connect`,

      {

        headers:authHeaders()
      }
    )

    const data =
    await res.json()

    window.location.href =
    data.url

  }catch(err){

    alert(err.message)

  }finally{

    hideLoader()
  }
}

// =========================
// OAUTH CALLBACK
// =========================

async function handleOAuth(){

  const code =
  new URLSearchParams(
    window.location.search
  ).get('code')

  if(!code) return

  try{

    showLoader()

    const res =
    await fetch(

      `${API}/api/youtube/callback`,

      {

        method:'POST',

        headers:authHeaders(),

        body:JSON.stringify({
          code
        })
      }
    )

    const data =
    await res.json()

    if(!res.ok){

      throw new Error(
        data.msg
      )
    }

    history.replaceState(
      {},
      '',
      '/'
    )

    await loadChannels()

    alert(
      'Channel Connected ✅'
    )

  }catch(err){

    alert(err.message)

  }finally{

    hideLoader()
  }
}

// =========================
// LOAD CHANNELS
// =========================

async function loadChannels(){

  const res =
  await fetch(

    `${API}/api/channels`,

    {

      headers:authHeaders()
    }
  )

  const data =
  await res.json()

  channelsDiv.innerHTML=''

  channelSelect.innerHTML=''

  if(!data.channels.length){

    channelsDiv.innerHTML=
    'No Channels'

    return
  }

  data.channels.forEach(ch=>{

    channelsDiv.innerHTML += `

      <div class="channel-item">

        <img src="${ch.profileImg}" />

        <h4>
          ${ch.channelTitle}
        </h4>

        <button
          onclick="deleteChannel('${ch._id}')"
          class="danger"
        >
          Delete
        </button>

      </div>
    `

    channelSelect.innerHTML += `

      <option value="${ch._id}">
        ${ch.channelTitle}
      </option>
    `
  })
}

// =========================
// DELETE CHANNEL
// =========================

async function deleteChannel(id){

  if(!confirm(
    'Delete channel?'
  )) return

  try{

    showLoader()

    await fetch(

      `${API}/api/channels/${id}`,

      {

        method:'DELETE',

        headers:authHeaders()
      }
    )

    await loadChannels()

  }catch(err){

    alert(err.message)

  }finally{

    hideLoader()
  }
}

// =========================
// CREATE PROJECT
// =========================

document.getElementById(
  'projectForm'
).onsubmit =
async(e)=>{

  e.preventDefault()

  try{

    showLoader()

    const res =
    await fetch(

      `${API}/api/projects`,

      {

        method:'POST',

        headers:authHeaders(),

        body:JSON.stringify({

          name:
          document.getElementById(
            'projectName'
          ).value,

          niche:
          document.getElementById(
            'niche'
          ).value,

          topics:
          document.getElementById(
            'topics'
          )
          .value
          .split(',')
          .map(t=>t.trim()),

          theme:
          document.getElementById(
            'theme'
          ).value,

          privacy:
          document.getElementById(
            'privacy'
          ).value,

          uploadTime:
          document.getElementById(
            'uploadTime'
          ).value,

          channelId:
          channelSelect.value
        })
      }
    )

    const data =
    await res.json()

    if(!res.ok){

      throw new Error(
        data.msg
      )
    }

    alert(
      'Project Created ✅'
    )

    await loadProjects()

  }catch(err){

    alert(err.message)

  }finally{

    hideLoader()
  }
}

// =========================
// LOAD PROJECTS
// =========================

async function loadProjects(){

  const res =
  await fetch(

    `${API}/api/projects`,

    {

      headers:authHeaders()
    }
  )

  const data =
  await res.json()

  projectsDiv.innerHTML=''

  if(!data.projects.length){

    projectsDiv.innerHTML=
    'No Projects'

    return
  }

  data.projects.forEach(p=>{

    projectsDiv.innerHTML += `

      <div class="project-item">

        <h4>${p.name}</h4>

        <p>
          ${p.niche}
        </p>

        <p>
          ${p.uploadTime}
        </p>

        <p>
          ${p.status}
        </p>

        <div class="project-actions">

          <button
            onclick="editProject('${p._id}')"
          >
            Edit
          </button>

          <button
            onclick="deleteProject('${p._id}')"
            class="danger"
          >
            Delete
          </button>

        </div>

      </div>
    `
  })
}

// =========================
// DELETE PROJECT
// =========================

async function deleteProject(id){

  if(!confirm(
    'Delete project?'
  )) return

  try{

    showLoader()

    await fetch(

      `${API}/api/projects/${id}`,

      {

        method:'DELETE',

        headers:authHeaders()
      }
    )

    await loadProjects()

  }catch(err){

    alert(err.message)

  }finally{

    hideLoader()
  }
}

// =========================
// EDIT PROJECT
// =========================

async function editProject(id){

  const name =
  prompt('New Name')

  if(!name) return

  try{

    showLoader()

    await fetch(

      `${API}/api/projects/${id}`,

      {

        method:'PUT',

        headers:authHeaders(),

        body:JSON.stringify({
          name
        })
      }
    )

    await loadProjects()

  }catch(err){

    alert(err.message)

  }finally{

    hideLoader()
  }
}

// =========================
// LOGOUT
// =========================

document.getElementById(
  'logoutBtn'
).onclick=()=>{

  localStorage.removeItem(
    'token'
  )

  location.reload()
}

// =========================
// INIT
// =========================

async function initDashboard(){

  showDashboard()

  await loadChannels()

  await loadProjects()

  await handleOAuth()
}

if(token()){

  initDashboard()
}
