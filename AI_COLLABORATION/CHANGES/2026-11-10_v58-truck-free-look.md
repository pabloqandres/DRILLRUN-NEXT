# V58 · Cámara libre en DrillTruck® personal 02

**Pedido del usuario (2026-11-10):** cámara rotatoria hacia los lados como la del avatar mientras se maneja, especialmente desde el lado derecho de pantalla.

## Diagnóstico
El gesto de cámara del avatar se ejecutaba durante conducción, pero `game.mjs` sobrescribía `world.chapterCamera` con un offset rígido de la camioneta todos los fotogramas; los movimientos táctiles nunca afectaban el punto de vista.

## Cambio
- `dist/camera/personal-truck-free-look.mjs`: cámara con yaw/pitch/zoom independientes, relativa a la orientación dinámica del DrillTruck®; vista trasera original al ingresar; límites suaves de inclinación y distancia.
- `dist/chapter/game.mjs`: enlaza `installWorldGestures` (arrastre por mitad derecha del canvas) con la órbita del vehículo, desvía zoom sólo cuando maneja, dibuja el offset rotado en cada fotograma, reinicia al entrar/salir o tocar `cameraHome`.
- El joystick izquierdo conserva aceleración/giro/freno, no hay nuevas zonas táctiles superpuestas, ni se modifica `drivePersonalTruck`.
- `tests/v58-personal-truck-free-look.test.mjs` y CI específica `.github/workflows/v58-personal-truck-free-look.yml`: regresiones visuales/gestos/controles, además de V50/V54/V56/V57/follow-camera.

## Sin alteraciones
M1–M5, economía, costos, física, LEDs, modelos GLB, guardados y automatización de la unidad 01. Ninguna marca externa. Rama y PR; QA visual WebGL real Android pendiente hasta verificación por usuario.

## Estado de verificación
Registrar resultado real de CI en PR. No presentar QA de dispositivo como ejecutada.
