# Plan de QA: Beta → Main

> Checklist exhaustivo antes de mergear. Marcar cada item como ✅ o ❌.

## 🔧 Pre-requisitos

- [x] Servidor de beta corriendo (Pi o local)
- [x] Cliente de beta accesible (Vercel preview o local)
- [x] Mínimo 2 dispositivos/navegadores para probar multiplayer
- [x] Acceso a cuenta admin para probar `/admin`

---

## 1. 🔐 Autenticación

### 1.1 Login
- [x] Login con Google funciona
- [x] Login con GitHub funciona
- [x] Redirect correcto después de login
- [x] Usuario aparece en header/home tras login

### 1.2 Persistencia de sesión
- [x] Cerrar pestaña y abrir de nuevo → sigue logueado
- [x] Hard refresh (Ctrl+Shift+R) → sigue logueado
- [x] `localStorage.getItem('user-storage')` contiene `isAuthenticated: true`

### 1.3 Logout
- [x] Logout limpia sesión
- [x] No se puede acceder a rutas protegidas tras logout

---

## 2. 🚪 Routing SPA

### 2.1 Navegación directa (escribir URL)
- [x] `/` → Home
- [Not found] `/join` → Join room
- [Not found] `/room/XXXX` → Room (o redirect si no existe)
- [x] `/terms` → Términos de uso
- [x] `/privacy` → Política de privacidad
- [x] `/admin` → Panel admin (si autorizado) o redirect a `/`
- [Not found, pero creo que esto es ok] `/ruta-inexistente` → Comportamiento esperado (no 404 de Vercel)

### 2.2 Links internos
- [Esto se actualizó en main] Links de términos/privacidad en login funcionan
- [El botón de la ui de volver funciona, por ejemplo, si estoy en unirme a una sala y le doy para atrás con el botón del navegador o del movil, en el caso del movil, cierra el navegador] Navegación con botón "Volver" funciona
- [lo dicho arriba] Browser back/forward funcionan correctamente

---

## 3. 🏠 Lobby / Sala de espera

### 3.1 Crear sala
- [x] Se genera código de 4 letras
- [x] Creador es admin (icono amarillo)
- [x] Selector de idioma funciona
- [x] Selector de modo funciona (Clásico, Aleatorio, Libre, Ruleta)

### 3.2 Unirse a sala
- [x] Código válido → entra a la sala
- [x] Código inválido → mensaje de error
- [x] Jugador aparece en lista para todos

### 3.3 Selector de impostores (NUEVO)
- [ ] Con 3 jugadores: solo permite 1 impostor
- [x] Botón `-` deshabilitado en 1
- [x] Botón `+` con 3 jugadores → shake + mensaje "Mínimo X jugadores"
- [ ] Con 4+ jugadores: permite 2 impostores
- [ ] Con 6+ jugadores: permite 3 impostores
- [ ] Máximo 6 impostores (shake + mensaje al intentar más)
- [x] NO muestra warnings con <4 jugadores
- [ ] Warning "Muchos lobos..." aparece cuando ratio es alto (4+ jugadores)
- [x] Valor se guarda en localStorage y persiste al recargar

### 3.4 Expulsar jugador
- [x] Solo admin ve botón "Echar"
- [x] Confirmación antes de expulsar
- [x] Jugador expulsado sale de la sala

### 3.5 Salir de sala
- [x] Confirmación al salir
- [x] Si admin sale, otro jugador se convierte en admin

---

## 4. 🎮 Flujo de juego - Modo Clásico

### 4.1 Inicio de partida
- [x aunque la siento un poco lag en mobile] Animación de transición de ronda aparece (número grande)
- [ ] Palabra se revela con animación blur→focus
- [x] Impostor ve "???" con pulso rosa
- [ ] Lista de turnos tiene animación stagger
- [x] Badge de ronda tiene indicador pulsante

### 4.2 Multi-impostor (NUEVO)
- [ ] Con 2 impostores: ambos ven "???"
- [ ] Con 2 impostores: badge muestra "2 impostores"
- [ ] Jugadores normales NO ven cuántos impostores hay (verificar)
- [ ] Cada impostor actúa independientemente

### 4.3 Controles de admin
- [x] "Hora de señalar" → inicia votación
- [x] "Otra ronda" → avanza ronda (animación de transición)

---

## 5. 🗳️ Votación

### 5.1 Interfaz
- [x] Todos los jugadores activos pueden votar
- [ ] Jugadores eliminados NO pueden votar
- [x] Emojis animados al aparecer
- [x] Contador de votos se actualiza en tiempo real
- [x] Badge de votos hace bounce al cambiar

### 5.2 Resultados
- [x] Empate → "Todos a salvo" + siguiente ronda
- [x] Mayoría 2/3 → jugador eliminado
- [ ] Si eliminado era impostor → "ERA EL IMPOSTOR" + confetti
- [ ] Si eliminado era inocente → "Era de los nuestros..."
- [x] **CRÍTICO**: Ronda avanza después de votación (CORREGIDO - newRound en vote:result)

### 5.3 Multi-impostor en votación
- [ ] Si había 2 impostores y eliminan 1 → "Uno menos. Quedan más."
- [ ] Si queda 1 impostor → mensaje normal
- [ ] Juego continúa hasta eliminar TODOS los impostores

---

## 6. 🏆 Fin de partida

### 6.1 Victoria de tripulación
- [x] Todos los impostores eliminados → "VICTORIA" para tripulación
- [x] Animación de confetti para ganadores
- [x] Emoji 🏆 con animación explosiva

### 6.2 Victoria de impostor(es)
- [x] Solo queda 1 tripulante → impostores ganan
- [x] "DERROTA" para tripulación
- [x] Emoji 💀 para perdedores

### 6.3 Reveal final (NUEVO - multi-impostor)
- [ ] Muestra TODOS los impostores con animación stagger
- [ ] Cada impostor aparece con delay
- [ ] Avatar gira y escala al aparecer
- [ ] Si había múltiples: "Los impostores eran" (plural)
- [ ] Si había uno: "El impostor era" (singular)

### 6.4 Palabra revelada
- [ ] Animación blur→focus en la palabra
- [ ] Aparece después del reveal de impostores

### 6.5 Acciones post-partida
- [x] Admin ve "Revancha" → reinicia partida
- [x] Todos ven "Salir" → vuelve a home
- [x] No-admin ve "Preparando revancha..." mientras espera

---

## 7. 🎰 Modo Ruleta

- [ ] Inicia fase de recolección de palabras
- [ ] Cada jugador puede enviar 1 palabra
- [ ] Timer de 30 segundos funciona
- [ ] Admin puede forzar inicio con mínimo de palabras
- [ ] Palabra aleatoria se selecciona de las enviadas
- [ ] Multi-impostor funciona igual que en clásico

---

## 8. 📱 Responsive / Mobile

### 8.1 Visualización
- [x] Home se ve bien en móvil
- [x] Lobby se ve bien en móvil
- [x] GameView se ve bien en móvil
- [x] Votación usable en móvil (touch targets suficientes)
- [x] Animaciones no causan lag en móvil (OPTIMIZADO - sin blur, con will-change)

### 8.2 Safe areas
- [x] Contenido no se corta en notch/dynamic island
- [x] Botones no quedan bajo barra de navegación

---

## 9. 🌐 Internacionalización

- [x] Español: textos correctos
- [x] English: textos correctos
- [x] Català: textos correctos
- [x] Euskara: textos correctos
- [x] Galego: textos correctos
- [ ] Nuevas keys existen en todos los idiomas:
  - `game.roundLabel`
  - `game.impostorCount_one` / `game.impostorCount_other`
  - `room.maxImpostorsReached`
  - `results.keepHunting`
  - `results.impostorsRemain`
  - `gameOver.impostorsWere`

---

## 10. ⚡ Performance

- [ ] Animaciones a 60fps (no jank)
- [ ] No memory leaks en partidas largas
- [ ] Reconexión funciona si se pierde conexión brevemente

---

## 11. 🔒 Seguridad / Edge cases

- [x] No se puede iniciar partida con <3 jugadores
- [ ] No se puede tener más impostores que jugadores/2
- [x] Solo admin puede iniciar partida
- [x] Solo admin puede avanzar ronda
- [ ] Manipular localStorage no da acceso a admin sin email válido

---

## 12. 🛠️ Panel Admin

- [x] Acceso con email autorizado → entra
- [ ] Acceso con email no autorizado → redirect a home
- [x] Lista de sugerencias de palabras carga
- [ ] Aprobar palabra funciona
- [ ] Rechazar palabra funciona
- [ ] Traducir palabra funciona

---

## 📝 Notas del QA

| Área | Estado | Notas |
|------|--------|-------|
| Auth | ✅ | Funciona correctamente |
| Routing | ✅ | Comportamiento esperado (estado interno en `/`) |
| Lobby | ✅ | OK |
| Multi-impostor | ⏳ | Pendiente probar con 4+ jugadores |
| Animaciones | ✅ | Optimizada para móvil (sin blur, con will-change) |
| Votación | ✅ | Ronda avanza correctamente (fix: newRound en vote:result) |
| Game Over | ✅ | OK |
| Mobile | ✅ | Back button comportamiento esperado |
| i18n | ✅ | OK |
| Admin | ⏳ | Pendiente probar aprobar/rechazar |

---

## ✅ Decisión final

- [ ] **APROBADO para merge** - Todos los tests críticos pasan
- [ ] **BLOQUEADO** - Issues encontrados (listar abajo)

> ⚠️ **Estado actual**: Issues críticos corregidos, pendiente re-testing en beta

### Issues bloqueantes encontrados:

1. ~~**🔴 CRÍTICO - Ronda no avanza tras votación**~~ → **CORREGIDO** ✅
   - El servidor incrementaba la ronda pero no la comunicaba al cliente
   - Fix: Añadido `newRound` al evento `vote:result`
   - El cliente ahora guarda `pendingRound` y lo aplica al continuar

2. ~~**🟡 Routing SPA incompleto**~~ → **NO ES BUG**
   - `/join` y `/room/XXXX` nunca existieron como rutas
   - La app usa estado interno en `/` para cambiar entre vistas
   - Comportamiento esperado ✅

3. ~~**🟡 Animación de ronda laggy en móvil**~~ → **CORREGIDO** ✅
   - Eliminados filtros blur que causaban jank en GPU
   - Añadido `will-change: transform, opacity`
   - Reducida escala inicial y rotación

### Issues no bloqueantes:
- Browser back cierra navegador en móvil → Comportamiento esperado si no hay historial
- Tests de multi-impostor pendientes → Necesitan 4+ jugadores

---

*Última actualización: 27 Diciembre 2024*
