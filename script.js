// script.js

const API =
'https://autotube-kajc.onrender.com/api'

let token =
localStorage.getItem('token') || ''

// ======================================
// START
// ======================================

window.onload = async ()=>{

  if(token){

    showApp()

    await handleOAuth()

    await loadDashboard()
  }
}

// ======================================
// HELPERS
// ======================================

function showLoader(){

  document
  .getElementById('loader')
  .classList.remove('hidden')
}

function hideLoader(){

  document
  .getElementById('loader')
  .classList.add('hidden')
}

function showApp(){

  document
  .getElementById('authScreen')
  .classList.add('hidden')

  document
  .getElementById('app')
  .classList.remove('hidden')
}

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

  try{

    showLoader()

    const res =
    await fetch(
      API + url,
      options
    )

    const data =
    await res.json()

    hideLoader()

    if(!res.ok){

      alert(
        data.msg || 'Error'
      )

      throw new Error(
        data.msg
      )
    }

    return data

  }catch(err){

    hideLoader()

    console.log(err)

    alert(
      err.message ||
      'Something went wrong'
    )
  }
}

// ======================================
// AUTH
// ======================================

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
    return alert(
      'Fill all fields'
    )
  }

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

  if(!data) return

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
    return alert(
      'Fill all fields'
    )
  }

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

  if(!data) return

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

// ======================================
// YOUTUBE CONNECT
// ======================================

async function connectYouTube(){

  const data =
  await api(

    '/youtube/connect',

    {

      headers:headers()
    }
  )

  if(data?.url){

    window.location.href =
    data.url
  }
}

// ======================================
// OAUTH CALLBACK
// ======================================

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
}

// ======================================
// DASHBOARD
// ======================================

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

  if(!channelsRes || !projectsRes)
  return

  renderChannels(
    channelsRes.channels
  )

  renderProjects(
    projectsRes.projects
  )

  fillChannelSelect(
    channelsRes.channels
  )
}

// ======================================
// RENDER CHANNELS
// ======================================

function renderChannels(
  channels
){

  const grid =
  document.getElementById(
    'channelsGrid'
  )

  grid.innerHTML = ''

  if(!channels.length){

    grid.innerHTML =
    '<p>No channels connected</p>'

    return
  }

  channels.forEach(channel=>{

    grid.innerHTML += `

    <div class="card">

      <img src="${channel.profileImg}" />

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

// ======================================
// RENDER PROJECTS
// ======================================

function renderProjects(
  projects
){

  const grid =
  document.getElementById(
    'projectsGrid'
  )

  grid.innerHTML = ''

  if(!projects.length){

    grid.innerHTML =
    '<p>No projects created</p>'

    return
  }

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
        Niche:
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
        Topics:
        ${project.topics.join(', ')}
      </p>

    </div>

    `
  })
}

// ======================================
// MODAL
// ======================================

function openModal(){

  document
  .getElementById(
    'projectModal'
  )
  .classList.remove('hidden')
}

function closeModal(){

  document
  .getElementById(
    'projectModal'
  )
  .classList.add('hidden')
}

// ======================================
// CHANNEL SELECT
// ======================================

function fillChannelSelect(
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

// ======================================
// CREATE PROJECT
// ======================================

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
    return alert(
      'Fill required fields'
    )
  }

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

  closeModal()

  loadDashboard()
}
