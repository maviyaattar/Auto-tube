// =========================================
// FINAL CLEAN WORKING script.js
// =========================================

const API =
'https://autotube-kajc.onrender.com/api'

let token =
localStorage.getItem('token') || ''

// =========================================
// START
// =========================================

window.addEventListener(

  'load',

  async ()=>{

    if(token){

      showApp()

      await loadDashboard()
    }

    await handleOAuth()
  }
)

// =========================================
// HELPERS
// =========================================

function toast(msg){

  alert(msg)
}

function showLoader(){

  const loader =
  document.getElementById(
    'loader'
  )

  if(loader){

    loader.style.display =
    'flex'
  }
}

function hideLoader(){

  const loader =
  document.getElementById(
    'loader'
  )

  if(loader){

    loader.style.display =
    'none'
  }
}

function showApp(){

  document
  .getElementById(
    'authScreen'
  )
  ?.classList.add(
    'hidden'
  )

  document
  .getElementById(
    'app'
  )
  ?.classList.remove(
    'hidden'
  )
}

function headers(){

  return {

    'Content-Type':
    'application/json',

    Authorization:
    `Bearer ${token}`
  }
}

// =========================================
// API
// =========================================

async function api(
  url,
  options={}
){

  try{

    showLoader()

    const response =
    await fetch(

      API + url,

      options
    )

    const text =
    await response.text()

    hideLoader()

    let data = {}

    try{

      data = JSON.parse(text)

    }catch{

      throw new Error(
        text || 'Invalid server response'
      )
    }

    if(!response.ok){

      throw new Error(

        data.msg ||
        'Request failed'
      )
    }

    return data

  }catch(err){

    hideLoader()

    console.log(err)

    toast(
      err.message
    )

    return null
  }
}

// =========================================
// SIGNUP
// =========================================

async function signup(){

  const name =
  document
  .getElementById('name')
  .value
  .trim()

  const email =
  document
  .getElementById('email')
  .value
  .trim()

  const password =
  document
  .getElementById('password')
  .value
  .trim()

  if(
    !name ||
    !email ||
    !password
  ){

    return toast(
      'Fill all fields'
    )
  }

  const data =
  await api(

    '/signup',

    {

      method:'POST',

      headers:{
        'Content-Type':
        'application/json'
      },

      body:JSON.stringify({

        name,
        email,
        password
      })
    }
  )

  if(!data) return

  token = data.token

  localStorage.setItem(
    'token',
    token
  )

  showApp()

  await loadDashboard()

  toast(
    'Signup Success'
  )
}

// =========================================
// LOGIN
// =========================================

async function login(){

  const email =
  document
  .getElementById('email')
  .value
  .trim()

  const password =
  document
  .getElementById('password')
  .value
  .trim()

  if(
    !email ||
    !password
  ){

    return toast(
      'Fill all fields'
    )
  }

  const data =
  await api(

    '/login',

    {

      method:'POST',

      headers:{
        'Content-Type':
        'application/json'
      },

      body:JSON.stringify({

        email,
        password
      })
    }
  )

  if(!data) return

  token = data.token

  localStorage.setItem(
    'token',
    token
  )

  showApp()

  await loadDashboard()

  toast(
    'Login Success'
  )
}

// =========================================
// LOGOUT
// =========================================

function logout(){

  localStorage.removeItem(
    'token'
  )

  location.reload()
}

// =========================================
// LOAD DASHBOARD
// =========================================

async function loadDashboard(){

  const channelsRes =
  await api(

    '/api/channels'.replace('/api',''),

    {

      method:'GET',

      headers:headers()
    }
  )

  const projectsRes =
  await api(

    '/api/projects'.replace('/api',''),

    {

      method:'GET',

      headers:headers()
    }
  )

  renderChannels(

    channelsRes?.channels || []
  )

  renderProjects(

    projectsRes?.projects || []
  )

  fillChannelSelect(

    channelsRes?.channels || []
  )
}

// =========================================
// CONNECT YOUTUBE
// =========================================

async function connectYouTube(){

  const data =
  await api(

    '/youtube/connect',

    {

      method:'GET',

      headers:headers()
    }
  )

  if(
    data &&
    data.url
  ){

    window.location.href =
    data.url
  }
}

// =========================================
// HANDLE OAUTH
// =========================================

async function handleOAuth(){

  const params =
  new URLSearchParams(
    window.location.search
  )

  const code =
  params.get('code')

  if(!code) return

  if(!token){

    return toast(
      'Please login first'
    )
  }

  const data =
  await api(

    '/youtube/callback',

    {

      method:'POST',

      headers:headers(),

      body:JSON.stringify({

        code
      })
    }
  )

  if(!data) return

  toast(
    'YouTube Connected'
  )

  window.history.replaceState(

    {},

    document.title,

    '/'
  )

  await loadDashboard()
}

// =========================================
// RENDER CHANNELS
// =========================================

function renderChannels(
  channels
){

  const grid =
  document.getElementById(
    'channelsGrid'
  )

  if(!grid) return

  grid.innerHTML = ''

  if(!channels.length){

    grid.innerHTML =

    `
    <div class="empty">
      No channels connected
    </div>
    `

    return
  }

  channels.forEach(channel=>{

    grid.innerHTML +=

    `
    <div class="card">

      <img
        src="${channel.profileImg}"
        class="channel-img"
      />

      <h3>
        ${channel.channelTitle}
      </h3>

      <button
        onclick="deleteChannel('${channel._id}')"
      >
        Disconnect
      </button>

    </div>
    `
  })
}

// =========================================
// DELETE CHANNEL
// =========================================

async function deleteChannel(id){

  if(
    !confirm(
      'Disconnect channel?'
    )
  ){
    return
  }

  const data =
  await api(

    `/channels/${id}`,

    {

      method:'DELETE',

      headers:headers()
    }
  )

  if(!data) return

  toast(
    'Channel disconnected'
  )

  await loadDashboard()
}

// =========================================
// RENDER PROJECTS
// =========================================

function renderProjects(
  projects
){

  const grid =
  document.getElementById(
    'projectsGrid'
  )

  if(!grid) return

  grid.innerHTML = ''

  if(!projects.length){

    grid.innerHTML =

    `
    <div class="empty">
      No projects yet
    </div>
    `

    return
  }

  projects.forEach(project=>{

    grid.innerHTML +=

    `
    <div class="card">

      <div class="status">

        ${project.status}

      </div>

      <h3>
        ${project.name}
      </h3>

      <p>
        ${project.niche}
      </p>

      <p>
        Theme:
        ${project.theme}
      </p>

      <p>
        Privacy:
        ${project.privacy}
      </p>

      <p>
        ${project.topics?.join(', ')}
      </p>

    </div>
    `
  })
}

// =========================================
// OPEN MODAL
// =========================================

function openModal(){

  document
  .getElementById(
    'projectModal'
  )
  ?.classList.remove(
    'hidden'
  )
}

// =========================================
// CLOSE MODAL
// =========================================

function closeModal(){

  document
  .getElementById(
    'projectModal'
  )
  ?.classList.add(
    'hidden'
  )
}

// =========================================
// FILL CHANNEL SELECT
// =========================================

function fillChannelSelect(
  channels
){

  const select =
  document.getElementById(
    'projectChannel'
  )

  if(!select) return

  select.innerHTML = ''

  channels.forEach(channel=>{

    select.innerHTML +=

    `
    <option value="${channel._id}">

      ${channel.channelTitle}

    </option>
    `
  })
}

// =========================================
// CREATE PROJECT
// =========================================

async function createProject(){

  const name =
  document
  .getElementById(
    'projectName'
  )
  .value
  .trim()

  const niche =
  document
  .getElementById(
    'projectNiche'
  )
  .value

  const theme =
  document
  .getElementById(
    'projectTheme'
  )
  .value

  const privacy =
  document
  .getElementById(
    'projectPrivacy'
  )
  .value

  const channelId =
  document
  .getElementById(
    'projectChannel'
  )
  .value

  const topics =
  document
  .getElementById(
    'projectTopics'
  )
  .value
  .split(',')
  .map(v=>v.trim())
  .filter(Boolean)

  if(
    !name ||
    !channelId
  ){

    return toast(
      'Fill required fields'
    )
  }

  const data =
  await api(

    '/projects',

    {

      method:'POST',

      headers:headers(),

      body:JSON.stringify({

        name,
        niche,
        theme,
        privacy,
        topics,
        channelId
      })
    }
  )

  if(!data) return

  toast(
    'Project Created'
  )

  closeModal()

  await loadDashboard()
}
