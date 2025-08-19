<template>
  <section id="Navbar" class="fixed top-0 w-full z-50">
    <div class="navbar bg-gradient">
      <div class="navbar-start text-neutral-content">
        <router-link to="/">
          <a class="btn btn-ghost text-2xl">ARTISTVERSE</a>
        </router-link>        
        <span class="page-name ml-4 text-xl font-semibold">{{ $route.meta.title }}</span>
      </div>
      <div class="navbar-end">
        <!-- Search Button -->
        <button class="btn btn-ghost btn-circle" @click="toggleSearch" aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#ffffff"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        <!-- User Profile Button -->
        <button class="btn btn-ghost btn-circle" @click="toggleUserMenu" aria-label="User Profile">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#ffffff"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />          
          </svg>
        </button>        
        <div class="dropdown dropdown-end">
          <button 
            tabindex="0" 
            class="btn btn-ghost btn-circle"
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#ffffff"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>          
          <ul class="menu menu-lg dropdown-content mt-3 z-[60] p-2 shadow bg-base-100 rounded-box w-70">            <router-link to="/"
              ><li><a>Homepage</a></li></router-link
            >
            <router-link to="/search"
              ><li><a>Search</a></li></router-link
            >
            <router-link to="/layoutview"
              ><li><a>Lyrics Generate</a></li></router-link
            >
            <router-link to="/recommend"
              ><li><a>Camera Mood</a></li></router-link
            >
            <router-link to="/progressiondetail"
              ><li><a>Chord Progression</a></li></router-link
            >
            <router-link to="/ai-assistance"
              ><li><a>AI Analysis</a></li></router-link
            >
          </ul>
        </div>
      </div>
    </div>
  </section>
  <RouterView></RouterView>
</template>

<script>
export default {
  name: 'App',  methods: {
    toggleSearch() {
      // Navigate to search page
      this.$router.push('/search');
    },
    toggleUserMenu() {
      // Handle user profile menu
      console.log('User menu toggled');
      // You can implement user profile dropdown or modal here
    }
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(255, 255, 255, 0));
}

.navbar-start .btn-ghost {
  color: white;
  font-weight: bold;
  letter-spacing: 1px;
}

.navbar-start .btn-ghost:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.page-name {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.navbar-end .btn-ghost {
  color: white;
  transition: all 0.3s ease;
}

.navbar-end .btn-ghost:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.navbar-end .btn-ghost:active {
  transform: scale(0.95);
}

.dropdown-content {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.dropdown-content a {
  color: #333;
  transition: all 0.3s ease;
}

.dropdown-content a:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #000;
}

/* Animation for buttons */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.btn-circle:focus {
  animation: pulse 0.3s ease-in-out;
}

/* Make sure icons are properly aligned */
.btn-circle svg {
  display: block;
  margin: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-name {
    display: none;
  }
  
  .navbar-start .btn-ghost {
    font-size: 1.2rem;
  }
}
</style>
