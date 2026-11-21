// ============================================================
//  GALAXIA DE AMOR  ·  canvas 2D con proyección 3D propia
// ============================================================

// ---------- PERSONALIZA AQUÍ ----------
const FRASES = [
    "AMOR ETERNO +",
    "CONTIGO SIEMPRE",
    "MI CORAZÓN ES TUYO",
    "INFINITO ∞",
    "ERES MI UNIVERSO",
    "TE AMO"
];

// Pon aquí las rutas de tus fotos (ej. "fotos/1.jpg"). Si lo dejas vacío
// se muestran círculos con un corazón como marcador.
const FOTOS = [];

const TEXTO_FLOTANTE_COLOR = "255, 205, 245";
// --------------------------------------

const canvas = document.getElementById("galaxia");
const ctx = canvas.getContext("2d");
const TAU = Math.PI * 2;

let W = 0, H = 0, dpr = 1;
let cx = 0, cy = 0, base = 1;

const R = 420;          // radio de la galaxia (unidades de mundo)
const DIST = 1100;
const FOV = 1000;

const cam = { yaw: 0, pitch: 0.5, zoom: 1, auto: 0 };
let cY = 1, sY = 0, cP = 1, sP = 0;

const rnd = (a, b) => Math.random() * (b - a) + a;
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

// ---------- Proyección 3D -> pantalla (y hacia arriba) ----------
function actualizarCamara() {
    const yaw = cam.yaw + cam.auto;
    cY = Math.cos(yaw); sY = Math.sin(yaw);
    cP = Math.cos(cam.pitch); sP = Math.sin(cam.pitch);
}

function proj(o, x, y, z) {
    const x1 = x * cY - z * sY;
    const z1 = x * sY + z * cY;
    const y1 = y * cP + z1 * sP;
    const z2 = z1 * cP - y * sP;
    const s = base * cam.zoom * FOV / (DIST + z2);
    o.x = cx + x1 * s;
    o.y = cy - y1 * s;
    o.s = s;
    o.z = z2;
    return o;
}

// ---------- Datos ----------
let fondo = [];
let galaxia = [];
let polvo = [];
let corazonGrande = [];
let orbes = [];
let anillos = [];

const paleta = [];
(function () {
    // del núcleo blanco-rosado al borde violeta-azulado
    const stops = [
        [255, 235, 250], [255, 190, 240], [255, 120, 225],
        [235, 100, 235], [190, 110, 255], [140, 130, 255]
    ];
    for (let i = 0; i < 24; i++) {
        const t = (i / 23) * (stops.length - 1);
        const a = Math.floor(t), b = Math.min(a + 1, stops.length - 1), f = t - a;
        const c = stops[a].map((v, k) => Math.round(v + (stops[b][k] - v) * f));
        paleta.push(`rgb(${c[0]},${c[1]},${c[2]})`);
    }
})();

function crearFondo() {
    fondo = [];
    for (let i = 0; i < 480; i++) {
        fondo.push({
            x: Math.random(), y: Math.random(),
            r: rnd(0.3, 1.4), ph: rnd(0, TAU), v: rnd(0.0008, 0.003)
        });
    }
}

function crearGalaxia() {
    galaxia = [];
    for (let i = 0; i < 12000; i++) {
        const brazo = i % 3;
        const r = Math.pow(Math.random(), 0.72) * R;
        const t = r / R;
        const ang = brazo * (TAU / 3) + r * 0.011 + gauss() * (0.22 + t * 0.3);
        galaxia.push({
            r, ang,
            y: gauss() * (22 * (1 - t) + 3),
            vel: 0.00006 * (420 / (r + 110)),
            tam: rnd(0.5, 1.7),
            a: rnd(0.25, 0.95),
            c: Math.min(23, Math.floor(Math.pow(t, 0.8) * 23 + rnd(-2, 2)) | 0)
        });
        if (galaxia[i].c < 0) galaxia[i].c = 0;
    }

    polvo = [];
    for (let i = 0; i < 5000; i++) {
        polvo.push({
            r: R * (0.25 + Math.random() * 2.7),
            ang: rnd(0, TAU),
            y: gauss() * 70,
            vel: rnd(0.00001, 0.00003),
            tam: rnd(0.5, 1.3),
            a: rnd(0.15, 0.7)
        });
    }
}

// Forma clásica del corazón (y hacia arriba)
function formaCorazon(t) {
    return [
        16 * Math.pow(Math.sin(t), 3),
        13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    ];
}

function crearCorazonGrande() {
    corazonGrande = [];
    // contorno brillante
    for (let i = 0; i < 1100; i++) {
        const [x, y] = formaCorazon(rnd(0, TAU));
        corazonGrande.push({
            x: x + gauss() * 0.55, y: y + gauss() * 0.55, z: gauss() * 2.5,
            tam: rnd(0.8, 2.2), ph: rnd(0, TAU), v: rnd(0.002, 0.007),
            col: Math.random() < 0.7 ? "255,70,240" : "255,170,250", borde: true
        });
    }
    // relleno
    for (let i = 0; i < 1500; i++) {
        const k = Math.sqrt(Math.random()) * 0.9;
        const [x, y] = formaCorazon(rnd(0, TAU));
        corazonGrande.push({
            x: x * k, y: y * k, z: gauss() * 4,
            tam: rnd(0.7, 1.8), ph: rnd(0, TAU), v: rnd(0.002, 0.007),
            col: Math.random() < 0.6 ? "215,60,225" : "255,110,235", borde: false
        });
    }
}


// =====================================
// STICKERS DE GATITOS
// =====================================

const imagenesStickers = [
    "img/gato1.jpg",
    "img/gato2.jpg",
    "img/gato3.jpg",
    "img/gato4.jpg",
    "img/gato5.jpg"
];

let temporizadorSticker = null;

function crearOrbes() {
    const contenedor = document.getElementById("contenedor-stickers");

    if (!contenedor) return;

    const mostrarSticker = () => {
        const sticker = document.createElement("img");

        const imagen = imagenesStickers[
            Math.floor(Math.random() * imagenesStickers.length)
        ];

        sticker.src = imagen;
        sticker.className = "sticker-gato";

        const posiciones = [
            { left: "8%", top: "20%" },
            { left: "75%", top: "18%" },
            { left: "10%", top: "70%" },
            { left: "78%", top: "72%" },
            { left: "45%", top: "10%" }
        ];

        const posicion = posiciones[
            Math.floor(Math.random() * posiciones.length)
        ];

        sticker.style.left = posicion.left;
        sticker.style.top = posicion.top;

        contenedor.appendChild(sticker);

        setTimeout(() => {
            sticker.remove();
        }, 7000);

        temporizadorSticker = setTimeout(mostrarSticker, 4500);
    };

    mostrarSticker();
}

function dibujarOrbes(t) {
    // Los stickers se animan mediante CSS.
}


function crearAnillos() {
    // dos anillos de frases a distinta distancia y velocidad
    anillos = [
        { radio: 560, vel: 0.00009, tam: 26, items: [] },
        { radio: 760, vel: -0.00006, tam: 32, items: [] }
    ];
    anillos.forEach((an, k) => {
        const n = FRASES.length;
        for (let i = 0; i < n; i++) {
            an.items.push({ texto: FRASES[(i + k * 2) % n], ang: (i / n) * TAU + k * 0.5 });
        }
    });
}

function ajustarPantalla() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    cx = W / 2;
    cy = H * 0.66;
    base = Math.min(W, H * 1.25) / 1050;
    crearFondo();
}

// ---------- Dibujo ----------
const P = { x: 0, y: 0, s: 1, z: 0 };
const Q = { x: 0, y: 0, s: 1, z: 0 };
const C = { x: 0, y: 0, s: 1, z: 0 };

function dibujarFondo(t) {
    ctx.globalCompositeOperation = "source-over";
    const px = Math.sin(cam.yaw + cam.auto) * 18;
    for (const e of fondo) {
        const a = 0.35 + Math.sin(e.ph + t * e.v) * 0.35;
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = "#dfe6ff";
        ctx.beginPath();
        ctx.arc(e.x * W + px * e.r, e.y * H, e.r, 0, TAU);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function dibujarNucleo(t) {
    proj(C, 0, 0, 0);
    const rad = 230 * C.s;
    const g = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, rad);
    g.addColorStop(0, "rgba(255,170,240,0.85)");
    g.addColorStop(0.18, "rgba(235,100,225,0.4)");
    g.addColorStop(0.5, "rgba(130,60,200,0.14)");
    g.addColorStop(1, "rgba(40,20,100,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(C.x, C.y, rad, rad * (0.35 + Math.sin(cam.pitch) * 0.6), 0, 0, TAU);
    ctx.fill();
}

function dibujarGalaxia(t) {
    ctx.globalCompositeOperation = "lighter";

    for (const p of polvo) {
        const a = p.ang + t * p.vel;
        proj(P, Math.cos(a) * p.r, p.y, Math.sin(a) * p.r);
        ctx.globalAlpha = p.a;
        ctx.fillStyle = "#e8dcff";
        const z = p.tam * Math.min(1.8, P.s * 1.3);
        ctx.fillRect(P.x, P.y, z, z);
    }

    for (const p of galaxia) {
        const a = p.ang + t * p.vel;
        proj(P, Math.cos(a) * p.r, p.y, Math.sin(a) * p.r);
        ctx.globalAlpha = p.a;
        ctx.fillStyle = paleta[p.c];
        const z = p.tam * Math.min(2, P.s * 1.4);
        ctx.fillRect(P.x, P.y, z, z);
    }
    ctx.globalAlpha = 1;
}

function dibujarFrases(t) {
    ctx.globalCompositeOperation = "source-over";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const an of anillos) {
        for (const it of an.items) {
            const a = it.ang + t * an.vel;
            const px = Math.cos(a) * an.radio, pz = Math.sin(a) * an.radio;
            // tangente y radial en el plano del suelo
            let tx = -Math.sin(a), tz = Math.cos(a);
            let nx = Math.cos(a), nz = Math.sin(a);

            proj(P, px, 0, pz);
            const u = 10;
            proj(Q, px + tx * u, 0, pz + tz * u);
            let ex = (Q.x - P.x) / u, ey = (Q.y - P.y) / u;
            if (ex < 0) { ex = -ex; ey = -ey; tx = -tx; tz = -tz; }

            // elegir el vector "arriba" que apunte hacia arriba en pantalla
            proj(Q, px + nx * u, 0, pz + nz * u);
            let ux = (Q.x - P.x) / u, uy = (Q.y - P.y) / u;
            if (uy > 0) { ux = -ux; uy = -uy; }

            const prof = Math.max(0.25, Math.min(1, 1.15 - (P.z + 600) / 1500));
            ctx.save();
            ctx.setTransform(
                ex * dpr, ey * dpr,
                -ux * dpr, -uy * dpr,
                P.x * dpr, P.y * dpr
            );
            ctx.font = `600 ${an.tam}px "Segoe UI", system-ui, sans-serif`;
            ctx.shadowColor = "rgba(255,80,220,0.95)";
            ctx.shadowBlur = 14;
            ctx.fillStyle = `rgba(${TEXTO_FLOTANTE_COLOR}, ${prof})`;
            ctx.fillText(it.texto, 0, 0);
            ctx.restore();
        }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function trazoCorazon(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.6, y - s * 0.2, x - s * 0.7, y - s * 1.3, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.7, y - s * 1.3, x + s * 1.6, y - s * 0.2, x, y + s * 0.9);
    ctx.closePath();
}

function dibujarOrbes(t) {
    ctx.globalCompositeOperation = "source-over";
    for (const o of orbes) {
        const a = o.ang + t * o.vel;
        const y = o.y + Math.sin(t * 0.001 + o.fase) * 14;
        proj(P, Math.cos(a) * o.r, y, Math.sin(a) * o.r);
        const rad = 30 * P.s;

        ctx.save();
        ctx.shadowColor = "rgba(255,120,240,0.9)";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(P.x, P.y, rad, 0, TAU);
        ctx.fillStyle = "rgba(60,20,70,0.9)";
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(P.x, P.y, rad, 0, TAU);
        ctx.clip();
        if (o.img && o.img.complete && o.img.naturalWidth) {
            const m = Math.min(o.img.naturalWidth, o.img.naturalHeight);
            ctx.drawImage(
                o.img,
                (o.img.naturalWidth - m) / 2, (o.img.naturalHeight - m) / 2, m, m,
                P.x - rad, P.y - rad, rad * 2, rad * 2
            );
        } else {
            const g = ctx.createRadialGradient(P.x, P.y - rad * 0.3, 0, P.x, P.y, rad);
            g.addColorStop(0, "#ffd6f6");
            g.addColorStop(1, "#b04ad0");
            ctx.fillStyle = g;
            ctx.fillRect(P.x - rad, P.y - rad, rad * 2, rad * 2);
            ctx.fillStyle = "#ff2fb4";
            trazoCorazon(P.x, P.y - rad * 0.05, rad * 0.38);
            ctx.fill();
        }
        ctx.restore();

        ctx.beginPath();
        ctx.arc(P.x, P.y, rad, 0, TAU);
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = Math.max(1, 2 * P.s);
        ctx.stroke();
    }
}

function latido(t) {
    // doble pulso tipo "lub-dub"
    const c = (t % 1300) / 1300;
    const a = Math.exp(-Math.pow((c - 0.10) / 0.06, 2));
    const b = Math.exp(-Math.pow((c - 0.30) / 0.07, 2)) * 0.7;
    return 1 + 0.16 * (a + b);
}

function dibujarCorazonCentral(t) {
    proj(C, 0, 6, 0);
    const s = 34 * C.s * latido(t);

    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, s * 3.4);
    halo.addColorStop(0, "rgba(255,70,200,0.55)");
    halo.addColorStop(1, "rgba(255,70,200,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(C.x, C.y, s * 3.4, 0, TAU);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.shadowColor = "rgba(255,60,200,1)";
    ctx.shadowBlur = 36;
    const g = ctx.createRadialGradient(C.x - s * 0.3, C.y - s * 0.4, 0, C.x, C.y, s * 1.5);
    g.addColorStop(0, "#ffd0f2");
    g.addColorStop(0.45, "#ff4fc3");
    g.addColorStop(1, "#b0189a");
    ctx.fillStyle = g;
    trazoCorazon(C.x, C.y, s);
    ctx.fill();
    ctx.restore();
}

function dibujarCorazonGrande(t) {
    const altura = 290;
    proj(P, 0, altura, 0);
    const k = 9.2 * P.s;                  // unidades de corazón -> píxeles
    const giro = Math.sin(t * 0.0006) * 0.75;
    const cg = Math.cos(giro), sg = Math.sin(giro);
    const pulso = 1 + (latido(t) - 1) * 0.35;

    // haz de luz hacia el centro
    proj(C, 0, 0, 0);
    const punta = P.y + 17 * k * pulso;
    ctx.globalCompositeOperation = "lighter";
    const haz = ctx.createLinearGradient(0, punta, 0, C.y);
    haz.addColorStop(0, "rgba(255,90,230,0.9)");
    haz.addColorStop(1, "rgba(255,90,230,0)");
    ctx.strokeStyle = haz;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "rgba(255,80,220,1)";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(P.x, punta);
    ctx.lineTo(C.x, C.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // resplandor suave detrás del corazón
    const gl = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, 20 * k);
    gl.addColorStop(0, "rgba(255,60,220,0.22)");
    gl.addColorStop(1, "rgba(255,60,220,0)");
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(P.x, P.y, 20 * k, 0, TAU);
    ctx.fill();

    // partículas
    for (const p of corazonGrande) {
        const x = p.x * cg + p.z * sg;
        const z = -p.x * sg + p.z * cg;
        const persp = 1 + z * 0.012;
        const sx = P.x + x * k * pulso * persp;
        const sy = P.y - p.y * k * pulso * persp;
        const tw = 0.5 + Math.sin(p.ph + t * p.v * 6) * 0.5;
        ctx.globalAlpha = (p.borde ? 0.55 : 0.4) + tw * 0.45;
        ctx.fillStyle = `rgb(${p.col})`;
        const z2 = p.tam * (0.7 + tw * 0.6) * Math.max(0.6, base * 1.3);
        ctx.fillRect(sx, sy, z2, z2);
    }
    ctx.globalAlpha = 1;
}

function animar(t) {
    cam.auto = Math.sin(t * 0.00022) * 0.28;
    actualizarCamara();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#02000a";
    ctx.fillRect(0, 0, W, H);

    dibujarFondo(t);
    dibujarNucleo(t);
    dibujarGalaxia(t);
    dibujarFrases(t);
    dibujarOrbes(t);
    dibujarCorazonGrande(t);

    requestAnimationFrame(animar);
}

// ---------- Interacción ----------
let arrastrando = false, ux = 0, uy = 0;
const punteros = new Map();
let distPinza = 0;

canvas.addEventListener("pointerdown", e => {
    canvas.setPointerCapture(e.pointerId);
    punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    arrastrando = true; ux = e.clientX; uy = e.clientY;
    if (punteros.size === 2) {
        const [a, b] = [...punteros.values()];
        distPinza = Math.hypot(a.x - b.x, a.y - b.y);
    }
});

canvas.addEventListener("pointermove", e => {
    if (!punteros.has(e.pointerId)) return;
    punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (punteros.size === 2) {
        const [a, b] = [...punteros.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (distPinza) cam.zoom = Math.min(1.8, Math.max(0.6, cam.zoom * d / distPinza));
        distPinza = d;
        return;
    }
    if (!arrastrando) return;
    cam.yaw += (e.clientX - ux) * 0.005;
    cam.pitch = Math.min(1.25, Math.max(0.2, cam.pitch + (e.clientY - uy) * 0.004));
    ux = e.clientX; uy = e.clientY;
});

function soltar(e) {
    punteros.delete(e.pointerId);
    if (punteros.size < 2) distPinza = 0;
    if (punteros.size === 0) arrastrando = false;
}
canvas.addEventListener("pointerup", soltar);
canvas.addEventListener("pointercancel", soltar);

canvas.addEventListener("wheel", e => {
    e.preventDefault();
    cam.zoom = Math.min(1.8, Math.max(0.6, cam.zoom * (e.deltaY > 0 ? 0.94 : 1.06)));
}, { passive: false });

window.addEventListener("resize", ajustarPantalla);

// ---------- Inicio ----------
ajustarPantalla();
crearGalaxia();
crearCorazonGrande();
crearOrbes();
crearAnillos();
requestAnimationFrame(animar);

// =====================================
// INTERACCIÓN DE LAS ESTRELLAS
// =====================================

const botonesEstrellas = [
    ["estrella-recuerdos", "ventana-recuerdos"],
    ["estrella-cancion", "ventana-cancion"],
    ["estrella-dedicatorias", "ventana-dedicatorias"]
];

botonesEstrellas.forEach(([botonId, ventanaId]) => {
    const boton = document.getElementById(botonId);
    const ventana = document.getElementById(ventanaId);

    boton.addEventListener("click", () => {
        ventana.classList.add("activa");
    });
});

document.querySelectorAll(".cerrar-ventana").forEach(boton => {
    boton.addEventListener("click", () => {
        boton.closest(".ventana-universo").classList.remove("activa");
    });
});


/* =====================================
   REPRODUCTOR DE CANCIONES
===================================== */

const canciones = {
    nuestra1: {
        archivo: "musica/nuestra1.mp3",
        inicio: 12,
        final: 128
    },

    nuestra2: {
        archivo: "musica/nuestra2.mp3",
        inicio: 14,
        final: 72
    },

    recuerda1: {
        archivo: "musica/recuerda1.mp3",
        inicio: 0,
        final: 63
    },
    recuerda2: {
        archivo: "musica/recuerda2.mp3",
        inicio: 18,
        final: 80,
    }

};

const reproductores = {};

document.querySelectorAll(".reproducir-cancion").forEach(boton => {
    const id = boton.dataset.cancion;
    const datos = canciones[id];

    const audio = new Audio(datos.archivo);
    audio.preload = "auto";

    const tarjeta = boton.closest(".tarjeta-cancion");
    const progreso = tarjeta.querySelector(".progreso-cancion");
    const tiempo = tarjeta.querySelector(".tiempo-cancion");

    reproductores[id] = audio;

    function formatoTiempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = Math.floor(segundos % 60);

        return minutos + ":" +
            String(segundosRestantes).padStart(2, "0");
    }

    audio.addEventListener("timeupdate", () => {
        const transcurrido = Math.max(
            0,
            audio.currentTime - datos.inicio
        );

        const duracion = datos.final - datos.inicio;
        const porcentaje = Math.min(
            100,
            (transcurrido / duracion) * 100
        );

        progreso.style.width = porcentaje + "%";

        tiempo.textContent =
            formatoTiempo(transcurrido) + " / " +
            formatoTiempo(duracion);

        if (audio.currentTime >= datos.final) {
            audio.pause();
            audio.currentTime = datos.final;
            boton.textContent = "▶ Reproducir";
            progreso.style.width = "100%";
        }
    });

    boton.addEventListener("click", async () => {

        if (!audio.paused) {
            audio.pause();
            boton.textContent = "▶ Reproducir";
            return;
        }

        // Detener las demás canciones
        Object.entries(reproductores).forEach(([otroId, otroAudio]) => {
            if (otroId !== id) {
                otroAudio.pause();

                const otroBoton = document.querySelector(
                    `.reproducir-cancion[data-cancion="${otroId}"]`
                );

                otroBoton.textContent = "▶ Reproducir";
            }
        });

        if (
            audio.currentTime < datos.inicio ||
            audio.currentTime >= datos.final
        ) {
            audio.currentTime = datos.inicio;
        }

        try {
            await audio.play();
            boton.textContent = "Ⅱ Pausar";
        } catch (error) {
            boton.textContent = "▶ Reproducir";
        }
    });
});

// Pausar la música al cerrar su ventana
document.querySelectorAll(".cerrar-ventana").forEach(boton => {
    boton.addEventListener("click", () => {
        Object.entries(reproductores).forEach(([id, audio]) => {
            audio.pause();

            const botonCancion = document.querySelector(
                `.reproducir-cancion[data-cancion="${id}"]`
            );

            botonCancion.textContent = "▶ Reproducir";
        });
    });
});


/* =====================================
   NAVEGACION DE PARA TI
===================================== */

const paginas = document.querySelectorAll(
    "#ventana-dedicatorias .pagina-dedicatoria"
);

const botonAnterior = document.getElementById("pagina-anterior");
const botonSiguiente = document.getElementById("pagina-siguiente");
const indicadorPagina = document.getElementById("indicador-pagina");

let paginaActual = 0;

function mostrarPagina(numero) {

    paginaActual = numero;

    paginas.forEach((pagina, indice) => {
        pagina.classList.toggle(
            "activa",
            indice === paginaActual
        );
    });

    botonAnterior.disabled = paginaActual === 0;

    botonSiguiente.disabled =
        paginaActual === paginas.length - 1;

    indicadorPagina.textContent =
        (paginaActual + 1) + " / " + paginas.length;
}

botonAnterior.addEventListener("click", () => {
    if (paginaActual > 0) {
        mostrarPagina(paginaActual - 1);
    }
});

botonSiguiente.addEventListener("click", () => {
    if (paginaActual < paginas.length - 1) {
        mostrarPagina(paginaActual + 1);
    }
});

// Iniciar siempre desde la primera página
mostrarPagina(0);


// CONTADOR DE NUESTRO AMOR
const fechaInicio = new Date("2026-10-24T21:28:00");

function actualizarContador() {
    const ahora = new Date();
    const diferencia = ahora - fechaInicio;

    if (diferencia < 0) return;

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    document.getElementById("tiempo-juntos").innerHTML = `
        <span>${dias} días</span>
        <span>${String(horas).padStart(2, "0")} horas</span>
        <span>${String(minutos).padStart(2, "0")} minutos</span>
        <span>${String(segundos).padStart(2, "0")} segundos</span>
    `;
}

actualizarContador();
setInterval(actualizarContador, 1000);


/* =================================
   INTERACCIÓN DE NUESTROS RECUERDOS
================================= */

// Ampliar fotografías
document.querySelectorAll(".foto-flotante").forEach(foto => {
    foto.addEventListener("click", () => {
        const visor = document.getElementById("visor-recuerdo");
        const imagen = document.getElementById("imagen-ampliada");

        imagen.src = foto.src;
        visor.classList.add("activo");
    });
});

// Cerrar fotografía ampliada
document.getElementById("cerrar-visor-recuerdo").addEventListener("click", () => {
    document.getElementById("visor-recuerdo").classList.remove("activo");
});

// Cerrar al pulsar fuera de la fotografía
document.getElementById("visor-recuerdo").addEventListener("click", evento => {
    if (evento.target.id === "visor-recuerdo") {
        evento.currentTarget.classList.remove("activo");
    }
});

// Abrir video
document.getElementById("abrir-video-recuerdo").addEventListener("click", () => {
    const visor = document.getElementById("visor-video-recuerdo");
    const video = document.getElementById("video-ampliado");

    visor.classList.add("activo");
    video.play();
});

// Cerrar video
document.getElementById("cerrar-video-recuerdo").addEventListener("click", () => {
    const video = document.getElementById("video-ampliado");

    video.pause();
    video.currentTime = 0;

    document.getElementById("visor-video-recuerdo").classList.remove("activo");
});

// Cerrar video al pulsar fuera
document.getElementById("visor-video-recuerdo").addEventListener("click", evento => {
    if (evento.target.id === "visor-video-recuerdo") {
        const video = document.getElementById("video-ampliado");
        video.pause();
        video.currentTime = 0;
        evento.currentTarget.classList.remove("activo");
    }
});
