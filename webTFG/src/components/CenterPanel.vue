<template>
  <div class="center-panel">
    <div class="panel-header">
      <div class="tabs">
        <button class="tab" v-for="tab in tabs" :key="tab.id"
          :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
          {{ tab.label }}
        </button>
      </div>
      <div class="header-actions">
        <input class="search-input" type="text" placeholder="Buscar socio..."
          v-model="searchQ" @input="onSearch" @blur="cerrarSearch" />
      </div>
    </div>

    <!-- Dropdown búsqueda -->
    <div class="search-results" v-if="searchResults.length > 0">
      <div class="search-result-row" v-for="r in searchResults" :key="r.id_cliente"
        @mousedown.prevent @click="abrirPerfil(r.id_cliente)">
        <div class="sr-avatar" :style="{ background: avatarColor(r.nombre) }">{{ initials(r.nombre) }}</div>
        <div class="sr-info">
          <span class="sr-name">{{ r.nombre }}</span>
          <span class="sr-sub">{{ r.documento }} · {{ r.plan_activo ?? 'Sin plan' }}</span>
        </div>
        <span class="sr-arrow">→</span>
      </div>
    </div>

    <!-- ── TAB: CUOTAS ──────────────────────────────────── -->
    <div v-if="activeTab === 'cuotas'" class="tab-content">
      <div v-if="loadingResumen" class="skeleton-row">
        <div class="skeleton h80" v-for="i in 4" :key="i"></div>
      </div>
      <div class="cuotas-summary" v-else>
        <div class="summary-card highlight">
          <span class="summary-num">€{{ Number(resumen.facturado).toLocaleString('es') }}</span>
          <span class="summary-label">Facturado este mes</span>
          <div class="mini-bar"><div class="mini-fill" style="width:100%"></div></div>
        </div>
        <div class="summary-card">
          <span class="summary-num accent-green">€{{ Number(resumen.cobrado).toLocaleString('es') }}</span>
          <span class="summary-label">Cobrado</span>
        </div>
        <div class="summary-card">
          <span class="summary-num accent-red">€{{ Number(resumen.pendiente).toLocaleString('es') }}</span>
          <span class="summary-label">Pendiente</span>
        </div>
        <div class="summary-card">
          <span class="summary-num accent-orange">{{ resumen.vencidas }}</span>
          <span class="summary-label">Cuotas vencidas</span>
        </div>
      </div>

      <div class="chart-section">
        <h3 class="chart-title">INGRESOS MENSUALES</h3>
        <div class="bar-chart">
          <div class="bar-group" v-for="b in barData" :key="b.month">
            <div class="bar-wrap">
              <div class="bar-fill" :style="{ height: b.pct + '%', background: b.active ? 'linear-gradient(180deg,#ff8c00,#ff5c00)' : '#1e1e2a' }"></div>
            </div>
            <span class="bar-label">{{ b.month }}</span>
          </div>
        </div>
      </div>

      <div class="table-section">
        <h3 class="chart-title">SUSCRIPCIONES RECIENTES</h3>
        <div v-if="loadingCuotas" class="skeleton-col">
          <div class="skeleton h40" v-for="i in 5" :key="i"></div>
        </div>
        <table class="data-table" v-else>
          <thead>
            <tr><th>Socio</th><th>Plan</th><th>Monto</th><th>Vencimiento</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <tr v-for="q in cuotas" :key="q.id" @click="abrirPerfilPorSuscripcion(q)">
              <td>
                <div class="td-user">
                  <div class="td-avatar" :style="{ background: avatarColor(q.nombre) }">{{ initials(q.nombre) }}</div>
                  {{ q.nombre }}
                </div>
              </td>
              <td><span class="plan-tag">{{ q.plan }}</span></td>
              <td class="td-amount">€{{ Number(q.monto).toLocaleString('es') }}</td>
              <td class="td-date">{{ q.vence }}</td>
              <td><span class="status-pill" :class="estadoClass(q.estado)">{{ estadoLabel(q.estado) }}</span></td>
            </tr>
            <tr v-if="cuotas.length === 0">
              <td colspan="5" class="empty-cell">Sin registros</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── TAB: CLIENTES ────────────────────────────────── -->
    <div v-if="activeTab === 'clientes'" class="tab-content">

      <!-- Filtros -->
      <div class="clientes-toolbar">
        <div class="filtro-tabs">
          <button class="filtro-btn" :class="{ active: filtroClientes === null }"    @click="setFiltro(null)">Todos</button>
          <button class="filtro-btn" :class="{ active: filtroClientes === 'activos' }" @click="setFiltro('activos')">Activos</button>
          <button class="filtro-btn" :class="{ active: filtroClientes === 'inactivos' }" @click="setFiltro('inactivos')">Sin suscripción</button>
        </div>
        <div class="clientes-meta" v-if="!loadingClientes">
          {{ totalClientes }} cliente{{ totalClientes !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Búsqueda dentro del tab -->
      <div class="clientes-search-wrap">
        <input
          class="clientes-search"
          type="text"
          placeholder="Filtrar por nombre o DNI..."
          v-model="busquedaClientes"
          @input="onBusquedaClientes"
        />
      </div>

      <!-- Skeleton -->
      <div v-if="loadingClientes" class="skeleton-col">
        <div class="skeleton" style="height:56px" v-for="i in 6" :key="i"></div>
      </div>

      <!-- Lista -->
      <template v-else>
        <div class="clientes-list" v-if="clientes.length > 0">
          <div
            class="cliente-row"
            v-for="c in clientes"
            :key="c.id_cliente"
            @click="abrirPerfil(c.id_cliente)"
          >
            <!-- Avatar -->
            <div class="cliente-avatar" :style="{ background: avatarColor(c.nombre) }">
              {{ initials(c.nombre) }}
            </div>

            <!-- Info principal -->
            <div class="cliente-info">
              <div class="cliente-nombre">{{ c.nombre }}</div>
              <div class="cliente-sub">{{ c.documento }} {{ c.email ? '· ' + c.email : '' }}</div>
            </div>

            <!-- Plan / estado -->
            <div class="cliente-plan-col">
              <span class="cliente-plan" v-if="c.plan_activo">{{ c.plan_activo }}</span>
              <span class="cliente-sin-plan" v-else>Sin plan</span>
              <span class="cliente-vence" v-if="c.fecha_fin && !c.vence_pronto">vence {{ c.fecha_fin }}</span>
              <span class="cliente-vence warn" v-if="c.vence_pronto">⚠ vence en {{ c.dias_restantes }}d</span>
            </div>

            <!-- Badge estado -->
            <div class="cliente-badge activo"   v-if="c.tiene_activa">Activo</div>
            <div class="cliente-badge inactivo" v-else>Inactivo</div>
          </div>
        </div>
        <p class="empty-cell-p" v-else>No se encontraron clientes</p>

        <!-- Paginación -->
        <div class="pagination" v-if="totalPaginas > 1">
          <button class="page-btn" :disabled="paginaClientes === 1" @click="cambiarPagina(paginaClientes - 1)">‹</button>
          <button
            class="page-btn"
            v-for="p in paginasVisibles"
            :key="p"
            :class="{ active: p === paginaClientes }"
            @click="cambiarPagina(p)"
          >{{ p }}</button>
          <button class="page-btn" :disabled="paginaClientes === totalPaginas" @click="cambiarPagina(paginaClientes + 1)">›</button>
        </div>
      </template>

    </div>

    <!-- ── TAB: INFO GENERAL ─────────────────────────────── -->
    <div v-if="activeTab === 'info'" class="tab-content info-tab">
      <div class="info-grid">
        <div class="info-card" v-for="info in infoCards" :key="info.title">
          <div class="info-icon">{{ info.icon }}</div>
          <h4 class="info-title">{{ info.title }}</h4>
          <p class="info-body">{{ info.body }}</p>
        </div>
      </div>
    </div>

    <!-- ── TAB: CLASES ───────────────────────────────────── -->
    <div v-if="activeTab === 'clases'" class="tab-content">
      <div class="schedule-grid">
        <div class="class-card" v-for="cls in classes" :key="cls.name + cls.time">
          <div class="class-time">{{ cls.time }}</div>
          <div class="class-info">
            <span class="class-name">{{ cls.name }}</span>
            <span class="class-trainer">con {{ cls.trainer }}</span>
          </div>
          <div class="class-spots" :class="{ full: cls.spots === 0 }">
            {{ cls.spots > 0 ? cls.spots + ' lugares' : 'LLENO' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal perfil cliente -->
    <ClienteModal :id-cliente="perfilId" @close="perfilId = null" />
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted } from 'vue'
import api from '../api/api.js'
import ClienteModal from './Clientemodal.vue'

// ── Refresco global ───────────────────────────────────────
const refreshKey = inject('refreshKey')
watch(refreshKey, () => { fetchResumen(); fetchBars(); fetchCuotas(); fetchClientes() })

// ── Perfil modal ──────────────────────────────────────────
const perfilId = ref(null)

function abrirPerfil(id) {
  searchResults.value = []
  searchQ.value       = ''
  perfilId.value      = null
  setTimeout(() => { perfilId.value = id }, 0)
}

async function abrirPerfilPorSuscripcion(q) {
  try {
    const { data } = await api.get('/cliente/buscar', { params: { q: q.nombre } })
    if (data.length > 0) abrirPerfil(data[0].id_cliente)
  } catch { /* silencioso */ }
}

// ── Tabs ──────────────────────────────────────────────────
const activeTab = ref('cuotas')
const tabs = [
  { id: 'cuotas',    label: 'Cuotas' },
  { id: 'clientes',  label: 'Clientes' },
  { id: 'info',      label: 'Info General' },
  { id: 'clases',    label: 'Clases' },
]

// Al cambiar al tab clientes, cargar si todavía no hay datos
watch(activeTab, (val) => { if (val === 'clientes' && clientes.value.length === 0) fetchClientes() })

// ── Búsqueda header ───────────────────────────────────────
const searchQ       = ref('')
const searchResults = ref([])
let   searchTimer   = null

function onSearch() {
  clearTimeout(searchTimer)
  if (searchQ.value.length < 2) { searchResults.value = []; return }
  searchTimer = setTimeout(async () => {
    try {
      const { data } = await api.get('/cliente/buscar', { params: { q: searchQ.value } })
      searchResults.value = data
    } catch { searchResults.value = [] }
  }, 300)
}
function cerrarSearch() { setTimeout(() => { searchResults.value = [] }, 150) }

// ── Cuotas ────────────────────────────────────────────────
const loadingResumen = ref(true)
const loadingBars    = ref(true)
const loadingCuotas  = ref(true)
const resumen        = ref({ facturado: 0, cobrado: 0, pendiente: 0, vencidas: 0 })
const barData        = ref([])
const cuotas         = ref([])

function estadoClass(e) { return { activa: 'paid', inactiva: 'pending', vencida: 'overdue' }[e] ?? 'pending' }
function estadoLabel(e) { return { activa: 'Activa', inactiva: 'Inactiva', vencida: 'Vencida' }[e] ?? e }

async function fetchResumen() {
  loadingResumen.value = true
  try { const { data } = await api.get('/suscripcion/resumen'); resumen.value = data }
  catch (e) { console.error(e) } finally { loadingResumen.value = false }
}
async function fetchBars() {
  loadingBars.value = true
  try { const { data } = await api.get('/suscripcion/ingresos-mensuales'); barData.value = data }
  catch (e) { console.error(e) } finally { loadingBars.value = false }
}
async function fetchCuotas() {
  loadingCuotas.value = true
  try { const { data } = await api.get('/suscripcion/recientes'); cuotas.value = data }
  catch (e) { console.error(e) } finally { loadingCuotas.value = false }
}

// ── Tab Clientes ──────────────────────────────────────────
const loadingClientes  = ref(false)
const clientes         = ref([])
const totalClientes    = ref(0)
const totalPaginas     = ref(1)
const paginaClientes   = ref(1)
const filtroClientes   = ref(null)
const busquedaClientes = ref('')
let   busquedaTimer    = null

// gym del trabajador (igual que en RightPanel)
const gymId = ref(null)
async function fetchGymId() {
  try { const { data } = await api.get('/gym/info'); gymId.value = data.id_gym }
  catch { /* silencioso */ }
}

const paginasVisibles = computed(() => {
  const total = totalPaginas.value
  const actual = paginaClientes.value
  const pages = []
  const desde = Math.max(1, actual - 2)
  const hasta = Math.min(total, actual + 2)
  for (let i = desde; i <= hasta; i++) pages.push(i)
  return pages
})

async function fetchClientes() {
  if (!gymId.value) return
  loadingClientes.value = true
  try {
    const params = { pagina: paginaClientes.value, tamano: 15 }
    if (filtroClientes.value)    params.filtro = filtroClientes.value
    if (busquedaClientes.value)  params.q      = busquedaClientes.value

    const { data } = await api.get(`/cliente/gym/${gymId.value}`, { params })
    clientes.value      = data.clientes
    totalClientes.value = data.total
    totalPaginas.value  = data.paginas
  } catch (e) { console.error(e) }
  finally { loadingClientes.value = false }
}

function setFiltro(f) {
  filtroClientes.value = f
  paginaClientes.value = 1
  fetchClientes()
}

function onBusquedaClientes() {
  clearTimeout(busquedaTimer)
  busquedaTimer = setTimeout(() => {
    paginaClientes.value = 1
    fetchClientes()
  }, 300)
}

function cambiarPagina(p) {
  if (p < 1 || p > totalPaginas.value) return
  paginaClientes.value = p
  fetchClientes()
}

// ── Helpers avatar ────────────────────────────────────────
const COLORS = ['linear-gradient(135deg,#ff5c00,#ff8c00)','linear-gradient(135deg,#6644ff,#9966ff)','linear-gradient(135deg,#00b4d8,#0077b6)','linear-gradient(135deg,#00e676,#00b248)','linear-gradient(135deg,#ff4060,#cc1040)']
function avatarColor(n) { let h = 0; for (const c of n) h += c.charCodeAt(0); return COLORS[h % COLORS.length] }
function initials(n)    { const p = n.trim().split(' '); return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() }

// ── Estáticos ─────────────────────────────────────────────
const infoCards = [
  { icon: '🏋️', title: 'Horarios',  body: 'Lun–Vie: 6:00–23:00  |  Sáb–Dom: 8:00–20:00' },
  { icon: '📍', title: 'Ubicación', body: 'Av. Libertad 1240, piso 2, Centro' },
  { icon: '📞', title: 'Contacto',  body: '+34 968 123 456  |  info@ironpeak.com' },
  { icon: '🌐', title: 'Web',       body: 'www.ironpeakgym.com' },
]
const classes = [
  { time: '07:00', name: 'Funcional', trainer: 'Lucas P.',    spots: 3  },
  { time: '08:30', name: 'Spinning',  trainer: 'María G.',    spots: 0  },
  { time: '10:00', name: 'Yoga',      trainer: 'Ana R.',      spots: 8  },
  { time: '12:00', name: 'Box',       trainer: 'Rodrigo V.',  spots: 2  },
  { time: '17:00', name: 'CrossFit',  trainer: 'Daniela M.',  spots: 5  },
  { time: '19:00', name: 'Zumba',     trainer: 'Carolina S.', spots: 12 },
  { time: '20:30', name: 'Funcional', trainer: 'Lucas P.',    spots: 1  },
]

onMounted(async () => {
  fetchResumen(); fetchBars(); fetchCuotas()
  await fetchGymId()
})
</script>

<style scoped>
@import './CenterPanel.css';

/* ── TAB CLIENTES ─────────────────────────────────────── */
.clientes-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.filtro-tabs { display: flex; gap: 6px; }

.filtro-btn {
  background: #16161c;
  border: 1px solid #1e1e2a;
  border-radius: 8px;
  padding: 6px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #55556a;
  cursor: pointer;
  transition: all 0.2s;
}
.filtro-btn:hover  { color: #d8d8e8; border-color: #2e2e3e; }
.filtro-btn.active { background: rgba(255,92,0,0.12); border-color: rgba(255,92,0,0.35); color: #ff5c00; }

.clientes-meta { font-size: 12px; color: #33334a; }

.clientes-search-wrap { margin-bottom: 14px; }
.clientes-search {
  width: 100%;
  background: #16161c;
  border: 1px solid #1e1e2a;
  border-radius: 10px;
  padding: 9px 14px;
  color: #d8d8e8;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.clientes-search::placeholder { color: #2e2e3a; }
.clientes-search:focus { border-color: #ff5c00; }

/* Lista de clientes */
.clientes-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.cliente-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #16161c;
  border: 1px solid #1e1e2a;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s;
}
.cliente-row:hover {
  border-color: rgba(255,92,0,0.3);
  background: rgba(255,92,0,0.04);
  transform: translateX(2px);
}

.cliente-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px; color: #fff; flex-shrink: 0;
}

.cliente-info {
  display: flex; flex-direction: column; gap: 2px;
  flex: 1; min-width: 0;
}
.cliente-nombre {
  font-size: 13px; font-weight: 600; color: #d8d8e8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cliente-sub { font-size: 11px; color: #44445a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.cliente-plan-col {
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
  min-width: 100px; flex-shrink: 0;
}
.cliente-plan     { font-size: 11px; font-weight: 600; color: #ff5c00; }
.cliente-sin-plan { font-size: 11px; color: #33334a; }
.cliente-vence    { font-size: 10px; color: #44445a; }
.cliente-vence.warn { color: #ffa000; }

.cliente-badge {
  font-size: 10px; font-weight: 700;
  padding: 3px 9px; border-radius: 20px;
  flex-shrink: 0; white-space: nowrap;
}
.cliente-badge.activo   { background: rgba(0,230,118,0.1); color: #00e676; }
.cliente-badge.inactivo { background: rgba(255,60,60,0.08); color: #ff4060; }

.empty-cell-p { text-align: center; color: #33334a; padding: 24px 0; font-size: 13px; }

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
}

.page-btn {
  background: #16161c;
  border: 1px solid #1e1e2a;
  border-radius: 7px;
  padding: 5px 11px;
  color: #55556a;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 32px;
}
.page-btn:hover:not(:disabled) { border-color: #ff5c00; color: #ff5c00; }
.page-btn.active { background: rgba(255,92,0,0.12); border-color: rgba(255,92,0,0.4); color: #ff5c00; font-weight: 700; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* Skeleton */
.skeleton {
  background: linear-gradient(90deg,#16161c 25%,#1e1e2a 50%,#16161c 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 10px;
}
.skeleton-col { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>