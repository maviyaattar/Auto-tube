// script.js

const API =
'https://autotube-kajc.onrender.com/api'

let token =
localStorage.getItem('token') || ''

// ====================================
// START
// ====================================

if(token){

  showApp()

  loadDashboard()

  handleOAuth()
}

// ====================================
// HELPERS
// ====================================

function headers(){

  return {

    'Content-Type':'application/json',

    Authorization:
    `Bearer ${token}`
  }
}

async function api(
  url,
  options={}
){

  const res =
  await fetch(
    API + url,
    options
  )

  const data =
  await res.json()

  if(!res.ok){

    alert(
      data.msg || 'Error'
    )

    throw new Error(
      data.msg
    )
  }

  return data
}

// ====================================
// AUTH
// ====================================

async function signup(){

  const name =
  document.getElementById(
    'name'
  ).value

  const email =
  document.getElementById(
    'email'
  ).value

  const password =
  document.getElementById(
    'password'
  ).value

  const data =
  await api(

    '/signup',

    {

      method:'POST',

      headers:{
        'Content-Type':'application/json'
      },

      body:JSON.stringify({

        name,
        email,
        password
      })
    }
  )

  token = data.token

  localStorage.setItem(
    'token',
    token
  )

  showApp()

  loadDashboard()
}

async function login(){

  const email =
  document.getElementById(
    'email'
  ).value

  const password =
  document.getElementById(
    'password'
  ).value

  const data =
  await api(

    '/login',

    {

      method:'POST',

      headers:{
        'Content-Type':'application/json'
      },

      body:JSON.stringify({

        email,
        password
      })
    }
  )

  token = data.token

  localStorage.setItem(
    'token',
    token
  )

  showApp()

  loadDashboard()
}

function logout(){

  localStorage.removeItem(
    'token'
  )

  location.reload()
}

function showApp(){

  document
  .getElementById('authScreen')
  .classList.add('hidden')

  document
  .getElementById('app')
  .classList.remove('hidden')
}

// ====================================
// YOUTUBE CONNECT
// ====================================

async function connectYouTube(){

  const data =
  await api(

    '/youtube/connect',

    {

      headers:headers()
    }
  )

  window.location.href =
  data.url
}

// ====================================
// OAUTH CALLBACK
// ====================================

async function handleOAuth(){

  const params =
  new URLSearchParams(
    location.search
  )

  const code =
  params.get('code')

  if(!code) return

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

  history.replaceState(
    {},
    document.title,
    '/'
  )

  loadDashboard()
}

// ====================================
// DASHBOARD
// ====================================

async function loadDashboard(){

  const channelsRes =
  await api(

    '/channels',

    {

      headers:headers()
    }
  )

  const projectsRes =
  await api(

    '/projects',

    {

      headers:headers()
    }
  )

  renderChannels(
    channelsRes.channels
  )

  renderProjects(
    projectsRes.projects
  )

  fillProjectChannels(
    channelsRes.channels
  )
}

// ====================================
// CHANNELS
// ====================================

function renderChannels(
  channels
){

  const grid =
  document.getElementById(
    'channelsGrid'
  )

  grid.innerHTML = ''

  channels.forEach(channel=>{

    grid.innerHTML += `

    <div class="card">

      <img src="${channel.profileImg}" />

      <h3>
        ${channel.channelTitle}
      </h3>

      <p>
        ${channel.channelId}
      </p>

    </div>

    `
  })
}

// ====================================
// PROJECTS
// ====================================

function renderProjects(
  projects
){

  const grid =
  document.getElementById(
    'projectsGrid'
  )

  grid.innerHTML = ''

  projects.forEach(project=>{

    grid.innerHTML += `

    <div class="card">

      <div class="badge ${project.status}">

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
        Topics:
        ${project.topics.join(', ')}
      </p>

    </div>

    `
  })
}

// ====================================
// MODAL
// ====================================

function openProjectModal(){

  document
  .getElementById(
    'projectModal'
  )
  .classList.remove('hidden')
}

function closeProjectModal(){

  document
  .getElementById(
    'projectModal'
  )
  .classList.add('hidden')
}

// ====================================
// FILL CHANNELS
// ====================================

function fillProjectChannels(
  channels
){

  const select =
  document.getElementById(
    'projectChannel'
  )

  select.innerHTML = ''

  channels.forEach(channel=>{

    select.innerHTML += `

    <option value="${channel._id}">

      ${channel.channelTitle}

    </option>

    `
  })
}

// ====================================
// CREATE PROJECT
// ====================================

async function createProject(){

  const name =
  document.getElementById(
    'projectName'
  ).value

  const niche =
  document.getElementById(
    'projectNiche'
  ).value

  const theme =
  document.getElementById(
    'projectTheme'
  ).value

  const privacy =
  document.getElementById(
    'projectPrivacy'
  ).value

  const channelId =
  document.getElementById(
    'projectChannel'
  ).value

  const topics =
  document.getElementById(
    'projectTopics'
  )
  .value
  .split(',')
  .map(v=>v.trim())

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

  closeProjectModal()

  loadDashboard()
}
