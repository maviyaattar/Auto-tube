// =========================================
// FULL script.js WITH PAGE DEBUG
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

    try{

      await handleOAuth()

      if(token){

        showApp()

        await loadDashboard()
      }

    }catch(err){

      showDebug(
        err.message,
        true
      )
    }
  }
)

// =========================================
// DEBUG BOX
// =========================================

function showDebug(
  text,
  isError=false
){

  let debug =
  document.getElementById(
    'debugBox'
  )

  if(!debug){

    debug =
    document.createElement('div')

    debug.id = 'debugBox'

    debug.style.position = 'fixed'
    debug.style.top = '0'
    debug.style.left = '0'
    debug.style.width = '100%'
    debug.style.height = '100%'
    debug.style.background = '#000'
    debug.style.color =
    isError ? 'red' : '#00ff88'

    debug.style.zIndex = '999999'
    debug.style.padding = '20px'
    debug.style.overflow = 'auto'
    debug.style.whiteSpace = 'pre-wrap'
    debug.style.wordBreak = 'break-word'
    debug.style.fontSize = '14px'

    document.body.appendChild(
      debug
    )
  }

  debug.innerHTML += `

====================================

${text}

====================================

`
}

// =========================================
// HELPERS
// =========================================

function showLoader(){

  document
  .getElementById(
    'loader'
  )
  ?.classList.remove(
    'hidden'
  )
}

function hideLoader(){

  document
  .getElementById(
    'loader'
  )
  ?.classList.add(
    'hidden'
  )
}

function toast(msg){

  alert(msg)
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

    const raw =
    await response.text()

    hideLoader()

    showDebug(

`URL:
${API + url}

STATUS:
${response.status}

RESPONSE:

${raw}

`
    )

    // =====================================
    // TRY JSON
    // =====================================

    let data

    try{

      data = JSON.parse(raw)

    }catch{

      throw new Error(
        'Response is not JSON'
      )
    }

    // =====================================
    // STATUS ERROR
    // =====================================

    if(!response.ok){

      throw new Error(

        data.msg ||
        'Request failed'
      )
    }

    return data

  }catch(err){

    hideLoader()

    showDebug(

      err.message,

      true
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

  toast(
    'Signup Success'
  )

  showApp()

  await loadDashboard()
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

  toast(
    'Login Success'
  )

  showApp()

  await loadDashboard()
}

// =========================================
// LOGOUT
// =========================================

function logout(){

  localStorage.removeItem(
    'token'
  )

  token = ''

  location.href = '/'
}

// =========================================
// CONNECT YOUTUBE
// =========================================

async function connectYouTube(){

  if(!token){

    return toast(
      'Login first'
    )
  }

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
    location.search
  )

  const code =
  params.get('code')

  if(!code){

    showDebug(
      'No OAuth code found'
    )

    return
  }

  if(!token){

    showDebug(
      'No token found'
    )

    return
  }

  showDebug(
    'OAuth code found'
  )

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

  if(data){

    toast(
      'YouTube Connected'
    )

    history.replaceState(

      {},

      document.title,

      '/'
    )
  }
}

// =========================================
// DASHBOARD
// =========================================

async function loadDashboard(){

  const channelsRes =
  await api(

    '/channels',

    {

      method:'GET',

      headers:headers()
    }
  )

  const projectsRes =
  await api(

    '/projects',

    {

      method:'GET',

      headers:headers()
    }
  )

  if(
    !channelsRes ||
    !projectsRes
  ){
    return
  }

  renderChannels(
    channelsRes.channels || []
  )

  renderProjects(
    projectsRes.projects || []
  )

  fillChannelSelect(
    channelsRes.channels || []
  )
}

// =========================================
// CHANNELS
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

  channels.forEach(channel=>{

    grid.innerHTML += `

    <div class="card">

      <img
        src="${channel.profileImg}"
        class="channel-img"
      />

      <h3>
        ${channel.channelTitle}
      </h3>

      <p>
        ${channel.email}
      </p>

    </div>

    `
  })
}

// =========================================
// PROJECTS
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

  projects.forEach(project=>{

    grid.innerHTML += `

    <div class="card">

      <h3>
        ${project.name}
      </h3>

      <p>
        ${project.niche}
      </p>

    </div>

    `
  })
}

// =========================================
// MODAL
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
// CHANNEL SELECT
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

    select.innerHTML += `

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

  if(data){

    toast(
      'Project Created'
    )

    closeModal()

    await loadDashboard()
  }
}
