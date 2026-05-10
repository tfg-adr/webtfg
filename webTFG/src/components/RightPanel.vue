<template>
  <div class="right-panel">

    <div class="section">
      <h2 class="section-title">ACCIONES RÁPIDAS</h2>
      <div class="action-buttons">
        <button class="action-btn primary" @click="openModal('add')">
          <span class="action-icon">👤</span>
          <div class="action-text"><span class="action-label">Añadir Cliente</span><span class="action-sub">Registrar nuevo socio</span></div>
          <span class="action-arrow">→</span>
        </button>
        <button class="action-btn" @click="openModal('renew')">
          <span class="action-icon">🔄</span>
          <div class="action-text"><span class="action-label">Renovar Suscripción</span><span class="action-sub">Actualizar plan existente</span></div>
          <span class="action-arrow">→</span>
        </button>
        <button class="action-btn" @click="openModal('edit')">
          <span class="action-icon">✏️</span>
          <div class="action-text"><span class="action-label">Modificar Cliente</span><span class="action-sub">Editar datos del socio</span></div>
          <span class="action-arrow">→</span>
        </button>
        <button class="action-btn danger" @click="openModal('checkin')">
          <span class="action-icon">✅</span>
          <div class="action-text"><span class="action-label">Check-in Manual</span><span class="action-sub">Registrar ingreso</span></div>
          <span class="action-arrow">→</span>
        </button>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title" style="margin:0">PLANES</h2>
        <!-- Botón + circular dorado a la DERECHA del título -->
        <button class="add-plan-btn" @click="openModal('addPlan')" title="Añadir plan">
          <svg width="25" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="btnGrad" cx="40%" cy="30%" r="65%">
                <stop offset="0%"   stop-color="#FFE033"/>
                <stop offset="50%"  stop-color="#FFB800"/>
                <stop offset="100%" stop-color="#E07B00"/>
              </radialGradient>
              <radialGradient id="shine" cx="38%" cy="22%" r="40%">
                <stop offset="0%"   stop-color="rgba(255,255,255,0.55)"/>
                <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
              </radialGradient>
            </defs>
            <circle cx="17" cy="18.5" r="15" fill="rgba(0,0,0,0.18)"/>
            <circle cx="17" cy="17"   r="15" fill="url(#btnGrad)"/>
            <circle cx="17" cy="17"   r="15" fill="url(#shine)"/>
            <rect x="15.2" y="9"   width="3.6" height="16" rx="1.8" fill="white"/>
            <rect x="9"    y="15.2" width="16" height="3.6" rx="1.8" fill="white"/>
          </svg>
        </button>
      </div>

      <!-- ACTIVOS -->
      <details open class="plans-dropdown">
        <summary>Planes activos ({{ planesActivos.length }})</summary>
        <div class="plans-list">
          <div class="plan-card" v-for="(plan, idx) in planesActivos" :key="plan.id" :class="{ featured: idx === 0 }">
            <div class="plan-header">
              <span class="plan-name">{{ plan.nombre }}</span>
              <span class="plan-badge" v-if="idx === 0">Popular</span>
            </div>
            <div class="plan-price">
              <span class="plan-amount">€{{ Number(plan.precio).toLocaleString('es') }}</span>
              <span class="plan-period"> / {{ plan.tipo }}</span>
            </div>
            <div class="plan-count">
              <span class="plan-bar-wrap">
                <span class="plan-bar-fill" :style="{ width: plan.pct + '%', background: planColor(idx) }"></span>
              </span>
              <span class="plan-count-text">{{ plan.miembros }} socios activos</span>
            </div>
            <button class="plan-action danger" @click="deactivatePlan(plan.id)">Pasar a inactivo</button>
          </div>
        </div>
      </details>

      <!-- INACTIVOS -->
      <details class="plans-dropdown">
        <summary>Planes inactivos ({{ planesInactivos.length }})</summary>
        <div class="plans-list">
          <div class="plan-card inactive" v-for="plan in planesInactivos" :key="plan.id">
            <div class="plan-header">
              <span class="plan-name">{{ plan.nombre }}</span>
            </div>
            <div class="plan-price">
              <span class="plan-amount">€{{ Number(plan.precio).toLocaleString('es') }}</span>
              <span class="plan-period"> / {{ plan.tipo }}</span>
            </div>
            <div class="plan-count-text">{{ plan.miembros }} socios activos</div>
            <div class="inactive-actions">
              <button class="plan-action" @click="activatePlan(plan.id)">Reactivar</button>
              <button class="plan-action danger" @click="deletePlan(plan.id)">Borrar</button>
            </div>
          </div>
        </div>
      </details>
    </div>

    <div class="divider"></div>

    <div class="section">
      <h2 class="section-title">ALERTAS</h2>
      <div class="alerts-list">
        <div class="alert-item danger" v-if="alertas.vencidas > 0">
          <div class="alert-dot"></div>
          <div class="alert-content">
            <span class="alert-msg">{{ alertas.vencidas }} cuotas vencidas sin renovar</span>
            <span class="alert-time">Ahora</span>
          </div>
        </div>
        <div class="alert-item warning" v-if="alertas.vencenHoy > 0">
          <div class="alert-dot"></div>
          <div class="alert-content">
            <span class="alert-msg">{{ alertas.vencenHoy }} suscripciones vencen hoy</span>
            <span class="alert-time">Hoy</span>
          </div>
        </div>
        <div class="alert-item success" v-if="alertas.altasMes > 0">
          <div class="alert-dot"></div>
          <div class="alert-content">
            <span class="alert-msg">{{ alertas.altasMes }} altas nuevas este mes</span>
            <span class="alert-time">Este mes</span>
          </div>
        </div>
        <p v-if="!alertas.vencidas && !alertas.vencenHoy && !alertas.altasMes" class="empty-msg">Sin alertas activas</p>
      </div>
    </div>

    <!-- ═══════════ MODAL ═══════════ -->
    <div class="modal-overlay" v-if="modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ modalTitle }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>

        <div class="modal-feedback success" v-if="feedback.ok">✓ {{ feedback.ok }}</div>
        <div class="modal-feedback error"   v-if="feedback.err">✗ {{ feedback.err }}</div>

        <div class="modal-body">

          <!-- ── AÑADIR CLIENTE ── -->
          <template v-if="modal === 'add'">
            <div class="form-group">
              <label class="form-label">Nombre completo *</label>
              <input class="form-input" v-model="form.nombre" placeholder="Juan García"
                :class="{ 'input-error': dirty.nombre && errNombre }" @blur="dirty.nombre = true" />
              <span class="field-error" v-if="dirty.nombre && errNombre">{{ errNombre }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">DNI / Documento *</label>
              <input class="form-input" v-model="form.documento" placeholder="12345678A"
                :class="{ 'input-error': dirty.documento && errDocumento }" @blur="dirty.documento = true" />
              <span class="field-error" v-if="dirty.documento && errDocumento">{{ errDocumento }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" type="text" v-model="form.email" placeholder="juan@email.com"
                :class="{ 'input-error': dirty.email && errEmail }" @blur="dirty.email = true" />
              <span class="field-error" v-if="dirty.email && errEmail">{{ errEmail }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input class="form-input" v-model="form.telefono" placeholder="+34 600 000 000"
                :class="{ 'input-error': dirty.telefono && errTelefono }" @blur="dirty.telefono = true" />
              <span class="field-error" v-if="dirty.telefono && errTelefono">{{ errTelefono }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña *</label>
              <div class="pass-wrap" :class="{ 'wrap-error': dirty.pass && errPass }">
                <input class="form-input" :type="showPass ? 'text' : 'password'" v-model="form.pass"
                  placeholder="Contraseña de acceso" @blur="dirty.pass = true" />
                <button class="toggle-pass" type="button" @click="showPass = !showPass">
                  <svg v-if="showPass" width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>
                  </svg>
                  <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14.12 14.12a3 3 0 01-4.24-4.24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <span class="field-error" v-if="dirty.pass && errPass">{{ errPass }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Plan inicial</label>
              <select class="form-input" v-model="form.id_plan">
                <option value="">Sin plan</option>
                <option v-for="p in planesActivos" :key="p.id" :value="p.id">{{ p.nombre }} — €{{ p.precio }}</option>
              </select>
            </div>
          </template>

          <!-- ── RENOVAR ── -->
          <template v-if="modal === 'renew'">
            <div class="form-group">
              <label class="form-label">Buscar socio *</label>
              <SearchCliente :id-gym="gymId" @seleccionado="seleccionarCliente" />
              <p class="selected-label" v-if="form.id_cliente">✓ <strong>{{ form.nombreCliente }}</strong></p>
              <span class="field-error" v-if="dirty.cliente && !form.id_cliente">Selecciona un socio de la lista</span>
            </div>
            <div class="form-group">
              <label class="form-label">Plan *</label>
              <select class="form-input" v-model="form.id_plan"
                :class="{ 'input-error': dirty.plan && !form.id_plan }"
                @blur="dirty.plan = true" @change="dirty.plan = true">
                <option value="">Selecciona un plan</option>
                <option v-for="p in planesActivos" :key="p.id" :value="p.id">{{ p.nombre }} — €{{ p.precio }}</option>
              </select>
              <span class="field-error" v-if="dirty.plan && !form.id_plan">Selecciona un plan</span>
            </div>
          </template>

          <!-- ── MODIFICAR ── -->
          <template v-if="modal === 'edit'">
            <div class="form-group">
              <label class="form-label">Buscar socio *</label>
              <SearchCliente :id-gym="gymId" @seleccionado="seleccionarCliente" />
              <p class="selected-label" v-if="form.id_cliente">✓ <strong>{{ form.nombreCliente }}</strong></p>
              <span class="field-error" v-if="dirty.cliente && !form.id_cliente">Selecciona un socio de la lista</span>
            </div>
            <div class="form-group">
              <label class="form-label">Nuevo nombre</label>
              <input class="form-input" v-model="form.nombre" placeholder="(sin cambios)"
                :class="{ 'input-error': dirty.nombre && errNombre }" @blur="dirty.nombre = true" />
              <span class="field-error" v-if="dirty.nombre && errNombre">{{ errNombre }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Nuevo email</label>
              <input class="form-input" type="text" v-model="form.email" placeholder="(sin cambios)"
                :class="{ 'input-error': dirty.email && errEmail }" @blur="dirty.email = true" />
              <span class="field-error" v-if="dirty.email && errEmail">{{ errEmail }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Nuevo teléfono</label>
              <input class="form-input" v-model="form.telefono" placeholder="(sin cambios)"
                :class="{ 'input-error': dirty.telefono && errTelefono }" @blur="dirty.telefono = true" />
              <span class="field-error" v-if="dirty.telefono && errTelefono">{{ errTelefono }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Nueva contraseña</label>
              <div class="pass-wrap">
                <input class="form-input" :type="showPass ? 'text' : 'password'" v-model="form.pass" placeholder="(sin cambios)" />
                <button class="toggle-pass" type="button" @click="showPass = !showPass">
                  <svg v-if="showPass" width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>
                  </svg>
                  <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14.12 14.12a3 3 0 01-4.24-4.24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </template>

          <!-- ── CHECK-IN ── -->
          <template v-if="modal === 'checkin'">
            <div class="form-group">
              <label class="form-label">Buscar socio *</label>
              <SearchCliente :id-gym="gymId" @seleccionado="seleccionarCliente" />
              <p class="selected-label" v-if="form.id_cliente">✓ <strong>{{ form.nombreCliente }}</strong></p>
              <span class="field-error" v-if="dirty.cliente && !form.id_cliente">Selecciona un socio de la lista</span>
            </div>
          </template>

          <!-- ── AÑADIR PLAN ── -->
          <template v-if="modal === 'addPlan'">
            <div class="form-group">
              <label class="form-label">Nombre del plan *</label>
              <input class="form-input" v-model="form.nombre" placeholder="Ej: Mensual Plus"
                :class="{ 'input-error': dirty.nombre && !form.nombre }" @blur="dirty.nombre = true" />
              <span class="field-error" v-if="dirty.nombre && !form.nombre">El nombre es obligatorio</span>
            </div>
            <div class="form-group">
              <label class="form-label">Precio (€) *</label>
              <input class="form-input" type="number" min="0" step="0.01"
                v-model="form.precio" placeholder="29.99"
                :class="{ 'input-error': dirty.precio && !form.precio }" @blur="dirty.precio = true" />
              <span class="field-error" v-if="dirty.precio && !form.precio">El precio es obligatorio</span>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo *</label>
              <select class="form-input" v-model="form.tipo"
                :class="{ 'input-error': dirty.tipo && !form.tipo }"
                @change="dirty.tipo = true">
                <option value="">Selecciona tipo</option>
                <option value="mes">Mes</option>
                <option value="trimestre">Trimestre</option>
                <option value="año">Año</option>
                <option value="día">Día</option>
              </select>
              <span class="field-error" v-if="dirty.tipo && !form.tipo">Selecciona un tipo</span>
            </div>
            <div class="form-group">
              <label class="form-label">Duración (días) *</label>
              <input class="form-input" type="number" min="1"
                v-model="form.duracion_dias" placeholder="30"
                :class="{ 'input-error': dirty.duracion && !form.duracion_dias }" @blur="dirty.duracion = true" />
              <span class="field-error" v-if="dirty.duracion && !form.duracion_dias">La duración es obligatoria</span>
            </div>
            <div class="form-group">
              <label class="form-label">Accesos totales <span style="opacity:.5">(0 = ilimitado)</span></label>
              <input class="form-input" type="number" min="0" v-model="form.total_accesos" placeholder="0" />
            </div>
          </template>

          <button class="btn-submit" @click="submitModal" :disabled="submitting">
            {{ submitting ? 'Procesando...' : modalBtnLabel }}
          </button>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import api from '../api/api.js'
import SearchCliente from './SearchCliente.vue'

const refreshKey = inject('refreshKey')
function triggerRefresh() { modal.value = null; refreshKey.value++ }

const gymId = ref(null)
async function fetchGymId() {
  try { const { data } = await api.get('/gym/info'); gymId.value = data.id_gym }
  catch { /* silencioso */ }
}

const planes = ref([])
const PLAN_COLORS = ['#ff5c00', '#6644ff', '#00e676', '#00b4d8', '#ffa000']
const planColor = (i) => PLAN_COLORS[i % PLAN_COLORS.length]

const planesActivos   = computed(() => planes.value.filter(p =>  p.isActive))
const planesInactivos = computed(() => planes.value.filter(p => !p.isActive))

async function fetchPlanes() {
  try { const { data } = await api.get('/plan'); planes.value = [...data].sort((a, b) => b.miembros - a.miembros) }
  catch { /* silencioso */ }
}

async function deactivatePlan(id) {
  try { await api.put(`/plan/${id}/deactivate`); await fetchPlanes() }
  catch (e) { alert(e.response?.data?.message || 'No se pudo desactivar') }
}
async function activatePlan(id) {
  try { await api.put(`/plan/${id}/activate`); await fetchPlanes() }
  catch (e) { alert(e.response?.data?.message || 'No se pudo activar') }
}
async function deletePlan(id) {
  const plan = planesInactivos.value.find(p => p.id === id)
  if (plan?.miembros > 0) { alert('No se puede borrar: el plan tiene socios activos'); return }
  if (!confirm(`¿Seguro que quieres eliminar este plan? Esta acción no se puede deshacer.`)) return
  try { await api.delete(`/plan/${id}`); await fetchPlanes() }
  catch (e) { alert(e.response?.data?.message || 'No se puede borrar este plan') }
}

const alertas = ref({ vencidas: 0, vencenHoy: 0, altasMes: 0 })
async function fetchAlertas() {
  try {
    const [stats, resumen] = await Promise.all([api.get('/dashboard/stats'), api.get('/suscripcion/resumen')])
    alertas.value = { vencenHoy: stats.data.vencenHoy, altasMes: stats.data.altasMes, vencidas: resumen.data.vencidas }
  } catch { /* silencioso */ }
}

const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const NOMBRE_REGEX   = /^[A-Za-zÀ-ÖØ-öø-ÿñÑçÇ\s'\-]{2,}$/
const DNI_REGEX      = /^([0-9]{8}[A-Za-z]|[XYZxyz][0-9]{7}[A-Za-z])$/
const TELEFONO_REGEX = /^\+?[\d\s\-]{7,17}$/

const errNombre = computed(() => {
  const v = form.value.nombre ?? ''
  if (modal.value === 'add' && !v.trim()) return 'El nombre es obligatorio'
  if (v.trim() && !NOMBRE_REGEX.test(v.trim())) return 'Solo se permiten letras y espacios, sin números'
  return ''
})
const errDocumento = computed(() => {
  const v = form.value.documento ?? ''
  if (!v.trim()) return 'El documento es obligatorio'
  if (!DNI_REGEX.test(v.trim())) return 'Formato inválido. Ejemplos: 12345678A, X1234567B'
  return ''
})
const errEmail = computed(() => {
  const v = form.value.email ?? ''
  if (!v.trim()) return ''
  if (!EMAIL_REGEX.test(v.trim())) return 'Formato inválido — debe ser texto@dominio.ext'
  return ''
})
const errTelefono = computed(() => {
  const v = form.value.telefono ?? ''
  if (!v.trim()) return ''
  if (!TELEFONO_REGEX.test(v.trim())) return 'Formato inválido. Ej: +34 600 000 000 o 600000000'
  const soloDigitos = v.replace(/[\s\-+]/g, '')
  if (soloDigitos.length < 7) return 'El teléfono debe tener al menos 7 dígitos'
  return ''
})
const errPass = computed(() => {
  const v = form.value.pass ?? ''
  if (modal.value === 'add' && !v.trim()) return 'La contraseña es obligatoria'
  return ''
})

const modal      = ref(null)
const submitting = ref(false)
const feedback   = ref({ ok: '', err: '' })
const form       = ref({})
const showPass   = ref(false)
const dirty      = ref({})

const modalConfig = {
  add:     { title: 'Añadir Cliente',      btn: 'Registrar' },
  renew:   { title: 'Renovar Suscripción', btn: 'Renovar' },
  edit:    { title: 'Modificar Cliente',   btn: 'Guardar cambios' },
  checkin: { title: 'Check-in Manual',     btn: 'Registrar ingreso' },
  addPlan: { title: 'Nuevo Plan',          btn: 'Crear plan' },
}
const modalTitle    = computed(() => modal.value ? modalConfig[modal.value].title : '')
const modalBtnLabel = computed(() => modal.value ? modalConfig[modal.value].btn   : '')

function openModal(type) {
  modal.value    = type
  form.value     = type === 'addPlan' ? { total_accesos: 0 } : {}
  feedback.value = { ok: '', err: '' }
  showPass.value = false
  dirty.value    = {}
}
function closeModal() { modal.value = null }

function seleccionarCliente(r) {
  if (!r) return
  form.value.id_cliente    = r.id_cliente
  form.value.nombreCliente = r.nombre
  dirty.value.cliente      = false
}

function marcarTodoDirty() {
  if (modal.value === 'add')     dirty.value = { nombre: true, documento: true, email: true, telefono: true, pass: true }
  if (modal.value === 'renew')   dirty.value = { cliente: true, plan: true }
  if (modal.value === 'edit')    dirty.value = { cliente: true, nombre: true, email: true, telefono: true }
  if (modal.value === 'checkin') dirty.value = { cliente: true }
  if (modal.value === 'addPlan') dirty.value = { nombre: true, precio: true, tipo: true, duracion: true }
}

function hayErrores() {
  if (modal.value === 'add')     return errNombre.value || errDocumento.value || errEmail.value || errTelefono.value || errPass.value
  if (modal.value === 'renew')   return !form.value.id_cliente || !form.value.id_plan
  if (modal.value === 'edit')    return !form.value.id_cliente || errNombre.value || errEmail.value || errTelefono.value
  if (modal.value === 'checkin') return !form.value.id_cliente
  if (modal.value === 'addPlan') return !form.value.nombre || !form.value.precio || !form.value.tipo || !form.value.duracion_dias
  return false
}

async function submitModal() {
  feedback.value = { ok: '', err: '' }
  marcarTodoDirty()
  if (hayErrores()) { feedback.value.err = 'Corrige los errores antes de continuar'; return }

  submitting.value = true
  try {
    if (modal.value === 'add') {
      await api.post('/cliente', {
        nombre: form.value.nombre, documento_identidad: form.value.documento,
        pass: form.value.pass, email: form.value.email || null,
        telefono: form.value.telefono || null, id_plan: form.value.id_plan || null,
      })
    }
    if (modal.value === 'renew') {
      await api.post(`/cliente/${form.value.id_cliente}/renovar`, { id_plan: Number(form.value.id_plan) })
    }
    if (modal.value === 'edit') {
      await api.put(`/cliente/${form.value.id_cliente}`, {
        nombre: form.value.nombre || null, email: form.value.email || null,
        telefono: form.value.telefono || null, pass: form.value.pass || null,
      })
    }
    if (modal.value === 'checkin') {
      await api.post('/registroentrada/checkin', { busqueda: form.value.nombreCliente })
    }
    if (modal.value === 'addPlan') {
      await api.post('/plan', {
        nombre:        form.value.nombre,
        precio:        Number(form.value.precio),
        duracion_dias: Number(form.value.duracion_dias),
        total_accesos: Number(form.value.total_accesos) || 0,
        tipo:          form.value.tipo,
        id_compania:   1,
      })
      await fetchPlanes()
    }

    triggerRefresh()

  } catch (e) {
    feedback.value.err = e.response?.data?.message ?? e.message ?? 'Error inesperado'
  } finally {
    submitting.value = false
  }
}

onMounted(() => { fetchGymId(); fetchPlanes(); fetchAlertas() })
</script>

<style scoped>
@import './RightPanel.css';

/* ── VALIDACIONES ─────────────────────────────────────── */
.input-error { border-color: #ff4060 !important; box-shadow: 0 0 0 3px rgba(255,60,60,0.08) !important; }
.wrap-error .form-input { border-color: #ff4060 !important; box-shadow: 0 0 0 3px rgba(255,60,60,0.08) !important; }
.field-error { font-size: 11px; color: #ff4060; padding-left: 2px; margin-top: -2px; }

/* ── OJO ──────────────────────────────────────────────── */
.pass-wrap { position: relative; display: flex; align-items: center; }
.pass-wrap .form-input { padding-right: 42px; }
.toggle-pass { position: absolute; right: 12px; background: none; border: none; cursor: pointer; color: #33334a; padding: 0; display: flex; align-items: center; transition: color 0.2s; }
.toggle-pass:hover { color: #ff5c00; }

/* ── CABECERA PLANES ──────────────────────────────────── */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

/* ── BOTÓN + CIRCULAR DORADO ──────────────────────────── */
.add-plan-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, filter 0.15s;
  border-radius: 50%;
  margin-right: 175px;
}
.add-plan-btn:hover  { transform: scale(1.08); filter: brightness(1.1); }
.add-plan-btn:active { transform: scale(0.95); filter: brightness(0.95); }

/* ── DESPLEGABLES PLANES ──────────────────────────────── */
.plans-dropdown { margin-bottom: 12px; background: #16161c; border: 1px solid #1e1e2a; border-radius: 12px; overflow: hidden; }
.plans-dropdown summary { cursor: pointer; list-style: none; padding: 14px; color: #d8d8e8; font-size: 14px; font-weight: 600; }
.plans-dropdown summary::-webkit-details-marker { display: none; }

.plan-action { margin-top: 12px; width: 100%; background: #1e1e2a; border: 1px solid #2b2b38; color: #d8d8e8; border-radius: 8px; padding: 9px; font-size: 12px; cursor: pointer; transition: 0.2s; }
.plan-action:hover        { border-color: #ff5c00; color: #ff5c00; }
.plan-action.danger:hover { border-color: #ff4060; color: #ff4060; }
.inactive-actions { display: flex; gap: 8px; }
</style>