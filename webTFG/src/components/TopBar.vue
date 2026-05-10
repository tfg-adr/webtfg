<template>
  <div class="topbar">

    <!-- Left: trabajador → click abre modal de perfil + rueda ajustes -->
    <div class="left-section">

      <div class="left clickable" @click="abrirPerfil">
        <div class="avatar">
          <span class="avatar-initials">{{ initials }}</span>
          <div class="avatar-status"></div>
        </div>
        <div class="user-info">
          <span class="user-label">{{ rolLabel }}</span>
          <span class="user-name">{{ nombreUsuario }}</span>
        </div>
        <span class="profile-hint">ver perfil →</span>
      </div>
      <!-- Rueda de ajustes -->
      <div class="settings-wrap" ref="settingsRef">
        <button class="settings-btn" @click="toggleSettings" :class="{ active: showSettings }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Dropdown -->
        <div class="settings-dropdown" v-if="showSettings">
          <button class="dropdown-item" @click="abrirApariencia">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            Cambiar apariencia
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click="abrirAcercaDe">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            Acerca de
          </button>
        </div>
      </div>

  </div>  

    <!-- Center: nombre del gym desde BD -->
    <div class="center">
      <div class="gym-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6 4h2v16H6V4zM16 4h2v16h-2V4zM2 9h4v6H2V9zM18 9h4v6h-4V9zM10 10h4v4h-4v-4z" fill="var(--color-primary)"/>
        </svg>
      </div>
      <div class="gym-name-block">
        <div v-if="loadingGym" class="skeleton-name"></div>
        <h1 v-else class="gym-name">
          {{ gymWords[0] ?? '—' }}
          <span v-if="gymWords[1]" class="gym-sub"> {{ gymWords[1] }}</span>
          <template v-for="w in gymWords.slice(2)" :key="w"> {{ w }}</template>
        </h1>
        <span class="gym-city" v-if="!loadingGym && gymInfo.ciudad">{{ gymInfo.ciudad }}</span>
      </div>
    </div>

    <!-- Right: reloj + activos + logout -->
    <div class="right">
      <div class="time-block">
        <span class="time">{{ clock }}</span>
        <span class="date">{{ dateStr }}</span>
      </div>
      <div class="active-badge">
        <span class="badge-dot"></span>
        <span class="badge-text">{{ loadingGym ? '—' : gymInfo.activosHoy }} activos ahora</span>
      </div>
      <button class="logout-btn" @click="logout">Cerrar sesión</button>
    </div>

  </div>

  <!-- Modal perfil trabajador -->
  <Teleport to="body">
    <div class="overlay" v-if="showPerfil" @click.self="showPerfil = false">
      <div class="modal-perfil">
        <button class="btn-close" @click="showPerfil = false">✕</button>

        <div class="profile-header">
          <div class="profile-avatar" :style="{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-light))' }">
            {{ initials }}
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ nombreUsuario }}</h2>
            <span class="profile-rol">{{ rolLabel }}</span>
            <span class="profile-email">{{ usuario.email ?? '—' }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="p-section">
          <h3 class="p-section-title">DATOS DEL TRABAJADOR</h3>
          <div class="data-grid">
            <div class="data-item">
              <span class="data-label">Nombre</span>
              <span class="data-value">{{ nombreUsuario }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Rol</span>
              <span class="data-value">{{ rolLabel }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email</span>
              <span class="data-value">{{ usuario.email ?? '—' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">ID trabajador</span>
              <span class="data-value">#{{ usuario.id_trabajador }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="p-section">
          <h3 class="p-section-title">GYM ASIGNADO</h3>
          <div class="data-grid">
            <div class="data-item">
              <span class="data-label">Nombre</span>
              <span class="data-value">{{ gymInfo.nombre || '—' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Ciudad</span>
              <span class="data-value">{{ gymInfo.ciudad || '—' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Compañía</span>
              <span class="data-value">{{ gymInfo.compania || '—' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Activos ahora</span>
              <span class="data-value accent-green">{{ gymInfo.activosHoy }}</span>
            </div>
          </div>
        </div>

        <div class="p-footer">
          <button class="btn-logout-modal" @click="logout">Cerrar sesión</button>
        </div>
      </div>
    </div>
  </Teleport>
  <!-- Modal apariencia -->
  <Teleport to="body">
    <div class="overlay" v-if="showApariencia" @click.self="showApariencia = false">
      <div class="modal-apariencia">
        <button class="btn-close" @click="showApariencia = false">✕</button>
        <h2 class="apariencia-title">CAMBIAR APARIENCIA</h2>
        <p class="apariencia-sub">Elige el tema visual de tu gimnasio</p>
        <div class="temas-grid">
          <div class="tema-card" v-for="tema in temasList" :key="tema.id"
            :class="{ selected: temaActual === tema.id }"
            @click="seleccionarTema(tema.id)">
            <div class="tema-preview" :style="{ background: tema.color }"></div>
            <div class="tema-info">
              <span class="tema-nombre">{{ tema.nombre }}</span>
              <span class="tema-check" v-if="temaActual === tema.id">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
  <!-- Modal acerca de -->
  <Teleport to="body">
    <div class="overlay" v-if="showAcercaDe" @click.self="showAcercaDe = false">
      <div class="modal-acerca">
        <button class="btn-close" @click="showAcercaDe = false">✕</button>
        <div class="acerca-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M6 4h2v16H6V4zM16 4h2v16h-2V4zM2 9h4v6H2V9zM18 9h4v6h-4V9zM10 10h4v4h-4v-4z" fill="var(--color-primary)"/>
          </svg>
        </div>
        <h2 class="acerca-title">ADR GYM SOFTWARE</h2>
        <p class="acerca-version">Versión 1.0.0</p>
        <p class="acerca-desc">Panel de gestión para gimnasios. Desarrollado como proyecto TFG.</p>
        <div class="acerca-divider"></div>
        <p class="acerca-copy">© 2026 ADR GYM SOFTWARE. Todos los derechos reservados.</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/api.js'
import { temas, aplicarTema } from '../themes.js'

const router     = useRouter()
const usuario    = ref(JSON.parse(localStorage.getItem('usuario') || '{}'))
const showPerfil = ref(false)
const showSettings  = ref(false)
const showApariencia = ref(false)
const showAcercaDe  = ref(false)
const settingsRef   = ref(null)


const nombreUsuario = computed(() => usuario.value.nombre || 'Trabajador')
const rolLabel      = computed(() => (usuario.value.rol || 'TRABAJADOR').toUpperCase())
const initials      = computed(() => {
  const p = nombreUsuario.value.trim().split(' ')
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
})
// ── Ajustes ───────────────────────────────────────────────
function toggleSettings() { showSettings.value = !showSettings.value }
 
function abrirApariencia() {
  showSettings.value  = false
  showApariencia.value = true
}
 
function abrirAcercaDe() {
  showSettings.value = false
  showAcercaDe.value = true
}
 
// Cerrar dropdown al hacer clic fuera
function onClickOutside(e) {
  if (settingsRef.value && !settingsRef.value.contains(e.target)) {
    showSettings.value = false
  }
}
// ── Temas ─────────────────────────────────────────────────
const temaActual = ref(usuario.value.id_gym ?? 1)
 
const temasList = [
  { id: 1, nombre: 'Naranja',  color: 'linear-gradient(135deg, #ff5c00, #ff8c00)' },
  { id: 2, nombre: 'Azul',     color: 'linear-gradient(135deg, #00b4d8, #0077b6)' },
  { id: 3, nombre: 'Morado',   color: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
]
 
function seleccionarTema(id) {
  temaActual.value = id
  aplicarTema(id)
  // Guardar preferencia en localStorage
  const u = JSON.parse(localStorage.getItem('usuario') || '{}')
  u.tema = id
  localStorage.setItem('usuario', JSON.stringify(u))
}

function abrirPerfil() { showPerfil.value = true }
function logout()      { localStorage.removeItem('usuario'); router.push('/') }

// ── Gym desde BD ──────────────────────────────────────────
const loadingGym = ref(true)
const gymInfo    = ref({ nombre: '', ciudad: '', compania: '', activosHoy: 0 })
const gymWords   = computed(() => gymInfo.value.nombre.trim().split(' ').filter(Boolean))

async function fetchGym() {
  try { const { data } = await api.get('/gym/info'); gymInfo.value = data }
  catch { gymInfo.value = { nombre: 'MI GYM', ciudad: '', compania: '', activosHoy: 0 } }
  finally { loadingGym.value = false }
}

let gymTimer = null
async function refreshActivos() {
  try { const { data } = await api.get('/gym/info'); gymInfo.value.activosHoy = data.activosHoy }
  catch { /* silencioso */ }
}

// ── Reloj ─────────────────────────────────────────────────
const clock   = ref('00:00:00')
const dateStr = ref('—')
const DAYS    = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MONTHS  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function updateClock() {
  const now = new Date()
  clock.value   = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,'0')).join(':')
  dateStr.value = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`
}

let clockTimer = null
onMounted(() => { fetchGym(); updateClock(); clockTimer = setInterval(updateClock, 1_000); gymTimer = setInterval(refreshActivos, 60_000);document.addEventListener('click', onClickOutside)})
onUnmounted(() => { 
  clearInterval(clockTimer);
  clearInterval(gymTimer);
  document.removeEventListener('click', onClickOutside);   
  // Aplicar tema guardado si existe
  const u = JSON.parse(localStorage.getItem('usuario') || '{}')
  if (u.tema) { temaActual.value = u.tema; aplicarTema(u.tema) }
})
</script>

<style scoped>
@import './TopBar.css';
</style>