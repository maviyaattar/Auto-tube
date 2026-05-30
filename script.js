// =========================================
// FULL UPDATED script.js
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

      // =========================
      // HANDLE GOOGLE CALLBACK
      // =========================

      await handleOAuth()

      // =========================
      // LOAD DASHBOARD
      // =========================

      if(token){

        showApp()

        await loadDashboard()
      }

    }catch(err){

      console.log(err)
    }
  }
)

// =========================================
// HELPERS
// =========================================

function showLoader(){

  document
  .getElementById('loader')
  ?.classList.remove('hidden')
}

function hideLoader(){

  document
  .getElementById('loader')
  ?.classList.add('hidden')
}

function toast(msg){

  alert(msg)
}

function showApp(){

  document
  .getElementById('authScreen')
  ?.classList.add('hidden')

  document
  .getElementById('app')
  ?.classList.remove('hidden')
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

    const contentType =
    response.headers.get(
      'content-type'
    ) || ''

    let data

    // =====================================
    // JSON
    // =====================================

    if(
      contentType.includes(
        'application/json'
      )
    ){

      data =
      await response.json()

    }else{

      const text =
      await response.text()

      console.log(
        'RAW RESPONSE:',
        text
      )

      throw new Error(

        'Server returned non JSON response'
      )
    }

    hideLoader()

    // =====================================
    // ERROR STATUS
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

    console.log(err)

    toast(

      err.message ||
      'Something went wrong'
    )

    return null
  }
}

// =========================================
// SIGNUP
// =========================================

async function signup(){

  try{

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

  }catch(err){

    console.log(err)
  }
}

// =========================================
// LOGIN
// =========================================

async function login(){

  try{

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

  }catch(err){

    console.log(err)
  }
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

  try{

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

  }catch(err){

    console.log(err)
  }
}

// =========================================
// HANDLE GOOGLE CALLBACK
// =========================================

async function handleOAuth(){

  try{

    const params =
    new URLSearchParams(
      window.location.search
    )

    const code =
    params.get('code')

    // =============================
    // NO CODE
    // =============================

    if(!code){

      console.log(
        'No OAuth code'
      )

      return
    }

    // =============================
    // NOT LOGGED IN
    // =============================

    if(!token){

      toast(
        'Please login first'
      )

      return
    }

    console.log(
      'OAuth Code:',
      code
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

    console.log(data)

    if(data){

      toast(
        'YouTube Connected Successfully'
      )

      // ===========================
      // REMOVE QUERY PARAMS
      // ===========================

      window.history.replaceState(

        {},

        document.title,

        '/'
      )
    }

  }catch(err){

    console.log(err)
  }
}

// =========================================
// LOAD DASHBOARD
// =========================================

async function loadDashboard(){

  try{

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

  }catch(err){

    console.log(err)
  }
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

    grid.innerHTML = `

    <div class="empty">

      No channels connected

    </div>

    `

    return
  }

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

    grid.innerHTML = `

    <div class="empty">

      No projects created

    </div>

    `

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

  try{

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
        'Fill all required fields'
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
      'Project Created Successfully'
    )

    closeModal()

    await loadDashboard()

  }catch(err){

    console.log(err)
  }
}
