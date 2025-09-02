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
        </button>        <!-- User Profile Button -->
        <div class="dropdown dropdown-end">
          <button 
            class="btn btn-ghost btn-circle" 
            @click="toggleUserMenu" 
            aria-label="User Profile"
            tabindex="0"
          >
            <div v-if="authStore.isAuthenticated && authStore.user" class="avatar">
              <div class="w-8 rounded-full">
                <img 
                  v-if="authStore.user.images && authStore.user.images.length > 0" 
                  :src="authStore.user.images[0].url" 
                  :alt="authStore.user.display_name"
                />
                <div v-else class="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center">
                  {{ authStore.user.display_name ? authStore.user.display_name.charAt(0).toUpperCase() : 'U' }}
                </div>
              </div>
            </div>
            <svg
              v-else
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
          
          <!-- User Dropdown Menu -->
          <ul v-if="showUserDropdown" class="menu menu-sm dropdown-content mt-3 z-[60] p-2 shadow bg-base-100 rounded-box w-52">
            <li v-if="!authStore.isAuthenticated">
              <button @click="loginWithSpotify" :disabled="authStore.isLoading" class="text-green-600">
                <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.6 0-.359.24-.66.54-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.242 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                {{ authStore.isLoading ? 'Connecting...' : 'Login with Spotify' }}
              </button>
            </li>
            <li v-else>
              <div class="px-4 py-2">
                <div class="font-semibold">{{ authStore.user.display_name }}</div>
                <div class="text-sm opacity-70">{{ authStore.user.email }}</div>
              </div>
            </li>
            <li v-if="authStore.isAuthenticated">
              <button @click="logout" class="text-red-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>
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
          </button>            <ul class="menu menu-lg dropdown-content mt-3 z-[60] p-2 shadow bg-base-100 rounded-box w-70">            <router-link to="/"
              ><li><a>Homepage</a></li></router-link
            >            <router-link to="/layoutview"
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
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const showUserDropdown = ref(false)

    onMounted(async () => {
      // Initialize auth from localStorage
      authStore.initializeAuth()
      
      // Check if we're returning from Spotify callback
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      
      if (error) {
        console.error('Spotify auth error:', error)
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }
      
      if (code) {
        try {
          await authStore.handleCallback(code)
          // Clear URL parameters after successful callback
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (error) {
          console.error('Failed to handle callback:', error)
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } else if (authStore.accessToken) {
        // Ensure token is valid and refresh if needed
        await authStore.ensureValidToken()
      }
    })

    return {
      authStore,
      showUserDropdown
    }
  },
  methods: {
    toggleSearch() {
      // Navigate to search page
      this.$router.push('/search');
    },
    toggleUserMenu() {
      // Toggle user dropdown
      this.showUserDropdown = !this.showUserDropdown
    },
    async loginWithSpotify() {
      try {
        await this.authStore.login()
      } catch (error) {
        console.error('Login failed:', error)
        // You could show a toast notification here
      }
    },
    logout() {
      this.authStore.logout()
      this.showUserDropdown = false
      // Redirect to homepage after logout
      this.$router.push('/')
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
