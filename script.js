let materias = JSON.parse(localStorage.getItem("org-materias")) || [
    {
        id: 101,
        nombre: "Estructuras de Datos",
        profesor: "Dr. Roberto Gómez",
        unidades: ["Unidad 1: Apuntadores", "Unidad 2: Pilas y Colas"]
    }
];

let tareas = JSON.parse(localStorage.getItem("org-tareas")) || [
    {
        id: 201,
        materiaId: 101,
        materia: "Estructuras de Datos",
        unidad: "Unidad 2: Pilas y Colas",
        nombre: "Implementar Cola en C",
        detalle: "Usar punteros frente y fin",
        fecha: new Date().toISOString().split('T')[0],
        completada: false
    }
];

let historial = JSON.parse(localStorage.getItem("org-historial")) || [];
let acciones = [];

// Tu código fuente completo en C integrado
const codigoC = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define AZUL "\033[1;36m"
#define VERDE "\033[1;32m"
#define AMARILLO "\033[1;33m"
#define ROJO "\033[1;31m"
#define NORMAL "\033[0m"

struct Tarea {
    char nombre[50];
    int completada;
    int dia;
    int mes;
    int anio;
    int proyecto;
    struct Tarea *sig;
};

struct Unidad {
    char nombre[50];
    struct Tarea *tareas;
    struct Unidad *sig;
};

struct Materia {
    char nombre[50];
    struct Unidad *unidades;
    struct Materia *sig;
};

struct Pendiente {
    char tarea[50];
    char unidad[50];
    char materia[50];
    struct Pendiente *sig;
};

struct Evento {
    char nombre[50];
    char materia[50];
    int proyecto;
    int completada;
    struct Evento *sig;
};

struct Materia *materias = NULL;
struct Pendiente *frente = NULL;
struct Pendiente *fin = NULL;
struct Pendiente *tope = NULL;
struct Evento *calendario[32];

void leerTexto(char *texto, int tam) {
    fgets(texto, tam, stdin);
    texto[strcspn(texto, "\n")] = '\0';
}

int leerEntero(char *mensaje) {
    char texto[50];
    printf("%s", mensaje);
    leerTexto(texto, 50);
    return atoi(texto);
}

/*  Fechas  */

int diasDelMes(int mes, int anio) {
    int cantidad[12] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (mes == 2 && ((anio % 4 == 0 && anio % 100 != 0) || anio % 400 == 0)) {
        return 29;
    }
    return cantidad[mes - 1];
}

int fechaValida(int dia, int mes, int anio) {
    if (anio < 2000 || anio > 2100) {
        return 0;
    }
    if (mes < 1 || mes > 12) {
        return 0;
    }
    if (dia < 1 || dia > diasDelMes(mes, anio)) {
        return 0;
    }
    return 1;
}

int diaSemana(int dia, int mes, int anio) {
    int t[12] = {0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4};
    if (mes < 3) {
        anio = anio - 1;
    }
    return (anio + anio / 4 - anio / 100 + anio / 400 + t[mes - 1] + dia) % 7;
}

/*  Lista de materias  */

struct Materia *buscarMateria(char *nombre) {
    struct Materia *aux = materias;
    while (aux != NULL) {
        if (strcmp(aux->nombre, nombre) == 0) {
            return aux;
        }
        aux = aux->sig;
    }
    return NULL;
}

void agregarMateria(char *nombre) {
    struct Materia *nueva = (struct Materia *)malloc(sizeof(struct Materia));
    strcpy(nueva->nombre, nombre);
    nueva->unidades = NULL;
    nueva->sig = NULL;

    if (materias == NULL) {
        materias = nueva;
    } else {
        struct Materia *aux = materias;
        while (aux->sig != NULL) {
            aux = aux->sig;
        }
        aux->sig = nueva;
    }
}

/*  Lista de unidades  */

struct Unidad *buscarUnidad(struct Materia *materia, char *nombre) {
    struct Unidad *aux = materia->unidades;
    while (aux != NULL) {
        if (strcmp(aux->nombre, nombre) == 0) {
            return aux;
        }
        aux = aux->sig;
    }
    return NULL;
}

void agregarUnidad(struct Materia *materia, char *nombre) {
    struct Unidad *nueva = (struct Unidad *)malloc(sizeof(struct Unidad));
    strcpy(nueva->nombre, nombre);
    nueva->tareas = NULL;
    nueva->sig = NULL;

    if (materia->unidades == NULL) {
        materia->unidades = nueva;
    } else {
        struct Unidad *aux = materia->unidades;
        while (aux->sig != NULL) {
            aux = aux->sig;
        }
        aux->sig = nueva;
    }
}

/*  Lista de tareas  */

struct Tarea *buscarTarea(struct Unidad *unidad, char *nombre) {
    struct Tarea *aux = unidad->tareas;
    while (aux != NULL) {
        if (strcmp(aux->nombre, nombre) == 0) {
            return aux;
        }
        aux = aux->sig;
    }
    return NULL;
}

void agregarTarea(struct Unidad *unidad, char *nombre, int dia, int mes, int anio, int proyecto) {
    struct Tarea *nueva = (struct Tarea *)malloc(sizeof(struct Tarea));
    strcpy(nueva->nombre, nombre);
    nueva->completada = 0;
    nueva->dia = dia;
    nueva->mes = mes;
    nueva->anio = anio;
    nueva->proyecto = proyecto;
    nueva->sig = NULL;

    if (unidad->tareas == NULL) {
        unidad->tareas = nueva;
    } else {
        struct Tarea *aux = unidad->tareas;
        while (aux->sig != NULL) {
            aux = aux->sig;
        }
        aux->sig = nueva;
    }
}

/*  Cola de pendientes  */

void encolar(struct Pendiente *nuevo) {
    nuevo->sig = NULL;
    if (frente == NULL) {
        frente = nuevo;
        fin = nuevo;
    } else {
        fin->sig = nuevo;
        fin = nuevo;
    }
}

struct Pendiente *desencolar() {
    if (frente == NULL) {
        return NULL;
    }
    struct Pendiente *sacado = frente;
    frente = frente->sig;
    if (frente == NULL) {
        fin = NULL;
    }
    sacado->sig = NULL;
    return sacado;
}

/*  Pila de completadas  */

void apilar(struct Pendiente *nuevo) {
    nuevo->sig = tope;
    tope = nuevo;
}

struct Pendiente *desapilar() {
    if (tope == NULL) {
        return NULL;
    }
    struct Pendiente *sacado = tope;
    tope = tope->sig;
    sacado->sig = NULL;
    return sacado;
}

/*  Funciones del menu  */

void opcionAgregarMateria() {
    char nombre[50];
    printf("Nombre de la materia: ");
    leerTexto(nombre, 50);

    if (buscarMateria(nombre) != NULL) {
        printf("Esa materia ya existe.\n");
        return;
    }
    agregarMateria(nombre);
    printf("Materia agregada.\n");
}

void opcionAgregarUnidad() {
    char nombreMateria[50];
    char nombreUnidad[50];

    printf("Nombre de la materia: ");
    leerTexto(nombreMateria, 50);
    struct Materia *materia = buscarMateria(nombreMateria);
    if (materia == NULL) {
        printf("Esa materia no existe.\n");
        return;
    }

    printf("Nombre de la unidad: ");
    leerTexto(nombreUnidad, 50);
    if (buscarUnidad(materia, nombreUnidad) != NULL) {
        printf("Esa unidad ya existe en la materia.\n");
        return;
    }
    agregarUnidad(materia, nombreUnidad);
    printf("Unidad agregada.\n");
}

void opcionAgregarTarea() {
    char nombreMateria[50];
    char nombreUnidad[50];
    char nombreTarea[50];

    printf("Nombre de la materia: ");
    leerTexto(nombreMateria, 50);
    struct Materia *materia = buscarMateria(nombreMateria);
    if (materia == NULL) {
        printf("Esa materia no existe.\n");
        return;
    }

    printf("Nombre de la unidad: ");
    leerTexto(nombreUnidad, 50);
    struct Unidad *unidad = buscarUnidad(materia, nombreUnidad);
    if (unidad == NULL) {
        printf("Esa unidad no existe.\n");
        return;
    }

    printf("Nombre de la tarea: ");
    leerTexto(nombreTarea, 50);
    if (buscarTarea(unidad, nombreTarea) != NULL) {
        printf("Esa tarea ya existe en la unidad.\n");
        return;
    }
    int dia = leerEntero("Dia de entrega: ");
    int mes = leerEntero("Mes de entrega: ");
    int anio = leerEntero("Anio de entrega: ");
    if (fechaValida(dia, mes, anio) == 0) {
        printf("Fecha no valida.\n");
        return;
    }
    int proyecto = leerEntero("Es proyecto final? (1 = si, 0 = no): ");
    if (proyecto != 1) {
        proyecto = 0;
    }
    agregarTarea(unidad, nombreTarea, dia, mes, anio, proyecto);

    struct Pendiente *nuevo = (struct Pendiente *)malloc(sizeof(struct Pendiente));
    strcpy(nuevo->tarea, nombreTarea);
    strcpy(nuevo->unidad, nombreUnidad);
    strcpy(nuevo->materia, nombreMateria);
    encolar(nuevo);
    printf("Tarea agregada a pendientes.\n");
}

void mostrarMateria(struct Materia *materia) {
    printf("\nMateria: %s\n", materia->nombre);
    struct Unidad *u = materia->unidades;
    while (u != NULL) {
        printf("  Unidad: %s\n", u->nombre);
        struct Tarea *t = u->tareas;
        while (t != NULL) {
            if (t->completada == 1) {
                printf("    [x] %s", t->nombre);
            } else {
                printf("    [ ] %s", t->nombre);
            }
            printf(" - %02d/%02d/%d", t->dia, t->mes, t->anio);
            if (t->proyecto == 1) {
                printf(" (PROYECTO FINAL)");
            }
            printf("\n");
            t = t->sig;
        }
        u = u->sig;
    }
}

void mostrarMaterias() {
    struct Materia *aux = materias;
    while (aux != NULL) {
        mostrarMateria(aux);
        aux = aux->sig;
    }
}

void opcionVerTodo() {
    if (materias == NULL) {
        printf("Todavia no hay materias.\n");
        return;
    }
    mostrarMaterias();
}

void opcionVerSiguiente() {
    if (frente == NULL) {
        printf("No hay tareas pendientes.\n");
        return;
    }
    printf("Siguiente tarea: %s (%s, %s)\n", frente->tarea, frente->materia, frente->unidad);
}

void opcionCompletar() {
    struct Pendiente *p = desencolar();
    if (p == NULL) {
        printf("No hay tareas pendientes.\n");
        return;
    }

    struct Materia *materia = buscarMateria(p->materia);
    struct Unidad *unidad = buscarUnidad(materia, p->unidad);
    struct Tarea *tarea = buscarTarea(unidad, p->tarea);
    tarea->completada = 1;

    apilar(p);
    printf("Tarea completada: %s\n", p->tarea);
}

void opcionDeshacer() {
    struct Pendiente *p = desapilar();
    if (p == NULL) {
        printf("No hay nada que deshacer.\n");
        return;
    }

    struct Materia *materia = buscarMateria(p->materia);
    struct Unidad *unidad = buscarUnidad(materia, p->unidad);
    struct Tarea *tarea = buscarTarea(unidad, p->tarea);
    tarea->completada = 0;

    encolar(p);
    printf("La tarea %s regreso a pendientes.\n", p->tarea);
}

void opcionHistorial() {
    if (tope == NULL) {
        printf("Todavia no hay tareas completadas.\n");
        return;
    }
    printf("Tareas completadas (la mas reciente primero):\n");
    struct Pendiente *aux = tope;
    while (aux != NULL) {
        printf("  %s (%s, %s)\n", aux->tarea, aux->materia, aux->unidad);
        aux = aux->sig;
    }
}

/*  Calendario  */

void agregarEvento(int dia, struct Tarea *t, char *materia) {
    struct Evento *nuevo = (struct Evento *)malloc(sizeof(struct Evento));
    strcpy(nuevo->nombre, t->nombre);
    strcpy(nuevo->materia, materia);
    nuevo->proyecto = t->proyecto;
    nuevo->completada = t->completada;
    nuevo->sig = NULL;

    if (calendario[dia] == NULL) {
        calendario[dia] = nuevo;
    } else {
        struct Evento *aux = calendario[dia];
        while (aux->sig != NULL) {
            aux = aux->sig;
        }
        aux->sig = nuevo;
    }
}

void llenarCalendario(int mes, int anio) {
    int i;
    for (i = 1; i <= 31; i++) {
        calendario[i] = NULL;
    }

    struct Materia *m = materias;
    while (m != NULL) {
        struct Unidad *u = m->unidades;
        while (u != NULL) {
            struct Tarea *t = u->tareas;
            while (t != NULL) {
                if (t->mes == mes && t->anio == anio) {
                    agregarEvento(t->dia, t, m->nombre);
                }
                t = t->sig;
            }
            u = u->sig;
        }
        m = m->sig;
    }
}

void liberarCalendario() {
    int i;
    for (i = 1; i <= 31; i++) {
        while (calendario[i] != NULL) {
            struct Evento *borrar = calendario[i];
            calendario[i] = calendario[i]->sig;
            free(borrar);
        }
    }
}

void opcionCalendario() {
    int mes = leerEntero("Mes (1-12): ");
    int anio = leerEntero("Anio: ");
    if (mes < 1 || mes > 12 || anio < 2000 || anio > 2100) {
        printf("Mes o anio no valido.\n");
        return;
    }

    llenarCalendario(mes, anio);
    int total = diasDelMes(mes, anio);
    int inicio = diaSemana(1, mes, anio);
    int d, i;

    printf("\nCALENDARIO %02d/%d\n", mes, anio);
    printf(" Do  Lu  Ma  Mi  Ju  Vi  Sa\n");
    for (i = 0; i < inicio; i++) {
        printf("    ");
    }
    for (d = 1; d <= total; d++) {
        char marca = ' ';
        struct Evento *e = calendario[d];
        while (e != NULL) {
            if (e->proyecto == 1) {
                marca = 'P';
            } else if (marca != 'P') {
                marca = '*';
            }
            e = e->sig;
        }
        printf("%3d%c", d, marca);
        if ((inicio + d) % 7 == 0) {
            printf("\n");
        }
    }
    if ((inicio + total) % 7 != 0) {
        printf("\n");
    }
    printf("\n* = tarea   P = proyecto final\n\n");

    int hay = 0;
    for (d = 1; d <= total; d++) {
        struct Evento *e = calendario[d];
        while (e != NULL) {
            printf("Dia %02d: ", d);
            if (e->completada == 1) {
                printf("[x] ");
            } else {
                printf("[ ] ");
            }
            printf("%s (%s)", e->nombre, e->materia);
            if (e->proyecto == 1) {
                printf(" - PROYECTO FINAL");
            }
            printf("\n");
            hay = 1;
            e = e->sig;
        }
    }
    if (hay == 0) {
        printf("No hay tareas ni proyectos en este mes.\n");
    }
    liberarCalendario();
}

/* Liberar memoria */

void liberarPendientes(struct Pendiente *lista) {
    while (lista != NULL) {
        struct Pendiente *borrar = lista;
        lista = lista->sig;
        free(borrar);
    }
}

void liberarMaterias() {
    while (materias != NULL) {
        struct Materia *m = materias;
        materias = materias->sig;

        struct Unidad *u = m->unidades;
        while (u != NULL) {
            struct Tarea *t = u->tareas;
            while (t != NULL) {
                struct Tarea *borrarT = t;
                t = t->sig;
                free(borrarT);
            }
            struct Unidad *borrarU = u;
            u = u->sig;
            free(borrarU);
        }
        free(m);
    }
}

void mostrarMenu() {
    printf("\n");
    printf(AZUL "+==============================================+" NORMAL "\n");
    printf(AZUL "|" AMARILLO "       ORGANIZADOR DE MATERIAS Y TAREAS       " AZUL "|" NORMAL "\n");
    printf(AZUL "+==============================================+" NORMAL "\n");
    printf(AZUL "|" VERDE "   1." NORMAL " Agregar materia                          " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   2." NORMAL " Agregar unidad a una materia             " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   3." NORMAL " Agregar tarea a una unidad               " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   4." NORMAL " Ver todo                                 " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   5." NORMAL " Ver siguiente tarea pendiente          " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   6." NORMAL " Completar siguiente tarea pendiente     " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   7." NORMAL " Deshacer ultima tarea completada        " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   8." NORMAL " Ver historial de completadas             " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   9." NORMAL " Ver calendario del mes                   " AZUL "|" NORMAL "\n");
    printf(AZUL "|" ROJO "  10." NORMAL " Salir                                  " AZUL "|" NORMAL "\n");
    printf(AZUL "+==============================================+" NORMAL "\n");
    printf("Opcion: ");
}

/*  Programa principal  */

int main() {
    char texto[50];
    system("");
    int opcion = 0;

    while (opcion != 10) {
        mostrarMenu();
        leerTexto(texto, 50);
        opcion = atoi(texto);

        switch (opcion) {
            case 1: opcionAgregarMateria(); break;
            case 2: opcionAgregarUnidad(); break;
            case 3: opcionAgregarTarea(); break;
            case 4: opcionVerTodo(); break;
            case 5: opcionVerSiguiente(); break;
            case 6: opcionCompletar(); break;
            case 7: opcionDeshacer(); break;
            case 8: opcionHistorial(); break;
            case 9: opcionCalendario(); break;
            case 10: printf("Hasta luego.\n"); break;
            default: printf(ROJO "Opcion no valida." NORMAL "\n");
        }
    }

    liberarMaterias();
    liberarPendientes(frente);
    liberarPendientes(tope);
    return 0;
}`

function guardar() {
    localStorage.setItem("org-materias", JSON.stringify(materias));
    localStorage.setItem("org-tareas", JSON.stringify(tareas));
    localStorage.setItem("org-historial", JSON.stringify(historial));
    actualizarEstadisticas();
}

function registrar(mensaje) {
    historial.push({ mensaje, fecha: new Date().toLocaleString() });
    guardar();
}

function actualizarEstadisticas() {
    document.getElementById("totalMaterias").textContent = materias.length;
    document.getElementById("totalPendientes").textContent = tareas.filter(t => !t.completada).length;
    document.getElementById("totalCompletadas").textContent = tareas.filter(t => t.completada).length;
}

function alternarModo() {
    const actual = document.documentElement.getAttribute("data-theme");
    const nuevo = actual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nuevo);
    localStorage.setItem("org-theme", nuevo);
    document.querySelector(".btn-modo").textContent = nuevo === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
}


if(localStorage.getItem("org-theme") === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
}

function ocultarFormularios() {
    document.querySelectorAll(".formulario").forEach(f => f.classList.remove("activo"));
    document.getElementById("contenedorBuscador").style.display = "none";
}

function mostrarFormulario(tipo) {
    ocultarFormularios();
    const formulario = document.getElementById("form" + tipo.charAt(0).toUpperCase() + tipo.slice(1));
    formulario.classList.add("activo");
    document.getElementById("tituloVista").textContent = "Registrar información";
    document.getElementById("descripcionVista").textContent = "Completa los campos correspondientes.";
    document.getElementById("vista").innerHTML = "";
    actualizarSelects();
}

function actualizarSelects() {
    let opciones = '<option value="">Selecciona una materia</option>';
    materias.forEach(m => { opciones += `<option value="${m.id}">${m.nombre}</option>`; });
    if(document.getElementById("materiaUnidad")) document.getElementById("materiaUnidad").innerHTML = opciones;
    if(document.getElementById("materiaTarea")) document.getElementById("materiaTarea").innerHTML = opciones;
    actualizarUnidades();
}

function actualizarUnidades() {
    let id = Number(document.getElementById("materiaTarea").value);
    let materia = materias.find(m => m.id === id);
    let select = document.getElementById("unidadTarea");
    if(!materia || !materia.unidades || materia.unidades.length === 0) {
        select.innerHTML = '<option value="">Sin unidades registradas</option>';
        return;
    }
    select.innerHTML = materia.unidades.map(u => `<option value="${u}">${u}</option>`).join("");
}

function agregarMateria() {
    let nombre = document.getElementById("nombreMateria").value.trim();
    let profesor = document.getElementById("profesor").value.trim();
    if (!nombre) { alert("Escribe el nombre de la materia."); return; }
    materias.push({ id: Date.now(), nombre, profesor, unidades: [] });
    registrar("Se agregó la materia: " + nombre);
    document.getElementById("nombreMateria").value = "";
    document.getElementById("profesor").value = "";
    alert("Materia agregada correctamente.");
    inicio();
}

function agregarUnidad() {
    let id = Number(document.getElementById("materiaUnidad").value);
    let nombre = document.getElementById("nombreUnidad").value.trim();
    let materia = materias.find(m => m.id === id);
    if (!materia || !nombre) { alert("Selecciona una materia y escribe la unidad."); return; }
    materia.unidades.push(nombre);
    registrar("Se agregó la unidad " + nombre + " a " + materia.nombre);
    document.getElementById("nombreUnidad").value = "";
    alert("Unidad agregada correctamente.");
    inicio();
}

function agregarTarea() {
    let idMateria = Number(document.getElementById("materiaTarea").value);
    let materia = materias.find(m => m.id === idMateria);
    let unidad = document.getElementById("unidadTarea").value;
    let nombre = document.getElementById("nombreTarea").value.trim();
    let detalle = document.getElementById("detalleTarea").value.trim();
    let fecha = document.getElementById("fechaTarea").value;

    if (!materia || !nombre || !fecha) { alert("Faltan datos obligatorios."); return; }

    let tarea = { id: Date.now(), materiaId: materia.id, materia: materia.nombre, unidad, nombre, detalle, fecha, completada: false };
    tareas.push(tarea);
    acciones.push({ tipo: "agregar", tarea });
    registrar("Se agregó la tarea: " + nombre);
    document.getElementById("nombreTarea").value = "";
    document.getElementById("detalleTarea").value = "";
    document.getElementById("fechaTarea").value = "";
    alert("Tarea registrada en la Cola.");
    mostrarTodo();
}

function inicio() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Progreso por Materias";
    document.getElementById("descripcionVista").textContent = "Resumen general de tus avances académicos.";
    let vista = document.getElementById("vista");

    if (materias.length === 0) {
        vista.innerHTML = '<div class="vacio">No hay materias registradas. Comienza agregando una en el menú.</div>';
        return;
    }

    let html = '<div class="tarjetas">';
    materias.forEach(m => {
        let tMateria = tareas.filter(t => t.materiaId === m.id);
        let completadas = tMateria.filter(t => t.completada).length;
        let total = tMateria.length;
        let porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

        html += `
            <div class="tarjeta">
                <h3>${escapar(m.nombre)}</h3>
                <p><strong>Profesor:</strong> ${escapar(m.profesor || "No asignado")}</p>
                <p>Tareas completadas: ${completadas} / ${total}</p>
                <div class="barra-progreso-contenedor">
                    <div class="barra-progreso-llenado" style="width: ${porcentaje}%"></div>
                </div>
                <span class="estado">${porcentaje}% Avanzado</span>
            </div>
        `;
    });
    html += '</div>';
    vista.innerHTML = html;
}

function mostrarTodo() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Todas las Tareas";
    document.getElementById("descripcionVista").textContent = "Gestión completa de actividades (Cola FIFO y estados).";
    document.getElementById("contenedorBuscador").style.display = "block";
    renderizarListaTareas(tareas);
}

function filtrarTareas(texto) {
    let filtradas = tareas.filter(t => t.nombre.toLowerCase().includes(texto.toLowerCase()) || t.materia.toLowerCase().includes(texto.toLowerCase()));
    renderizarListaTareas(filtradas);
}

function renderizarListaTareas(lista) {
    let vista = document.getElementById("vista");
    let contenedorResultados = document.getElementById("resultadosTareas");
    if(!contenedorResultados) {
        // Creamos contenedor dinámico si no existe
        vista.innerHTML = '<div id="resultadosTareas"></div>';
        contenedorResultados = document.getElementById("resultadosTareas");
    }

    if (lista.length === 0) {
        contenedorResultados.innerHTML = '<div class="vacio">No se encontraron tareas registradas.</div>';
        return;
    }

    let hoy = new Date().toISOString().split('T')[0];
    let ordenadas = [...lista].sort((a,b) => a.fecha.localeCompare(b.fecha));

    contenedorResultados.innerHTML = ordenadas.map(t => {
        let esUrgente = !t.completada && t.fecha <= hoy;
        return `
            <div class="tarea ${t.completada ? "completada" : ""} ${esUrgente ? "urgente" : ""}">
                <h3>${escapar(t.nombre)}</h3>
                <p><strong>Materia:</strong> ${escapar(t.materia)}</p>
                <p><strong>Unidad:</strong> ${escapar(t.unidad || "Sin unidad")}</p>
                <p><strong>Detalle:</strong> ${escapar(t.detalle || "Sin descripción")}</p>
                <p><strong>Entrega:</strong> ${t.fecha} ${esUrgente ? '⚠️ <strong>¡Urgente / Vence hoy!</strong>' : ''}</p>
                <span class="estado ${t.completada ? "ok" : (esUrgente ? "alerta" : "")}">
                    ${t.completada ? "Completada" : (esUrgente ? "Urgente" : "Pendiente en Cola")}
                </span>
                <br><br>
                ${!t.completada ? `<button class="btn btn-verde" onclick="completarTarea(${t.id})">✓ Completar</button>` : ""}
                <button class="btn btn-rojo" onclick="eliminarTarea(${t.id})">🗑️ Eliminar</button>
            </div>
        `;
    }).join("");
}

function siguienteTarea() {
    ocultarFormularios();
    let pendientes = tareas.filter(t => !t.completada).sort((a,b) => a.fecha.localeCompare(b.fecha));
    document.getElementById("tituloVista").textContent = "Siguiente Tarea en Cola (FIFO)";
    document.getElementById("descripcionVista").textContent = "La actividad al frente de la cola con fecha más próxima.";
    
    if (pendientes.length === 0) {
        document.getElementById("vista").innerHTML = '<div class="vacio">¡Excelente! No hay tareas pendientes en la cola.</div>';
        return;
    }
    
    let t = pendientes[0];
    document.getElementById("vista").innerHTML = `
        <div class="tarea" style="border-left-color: var(--acento);">
            <h3>🚀 [FRENTE DE COLA] ${escapar(t.nombre)}</h3>
            <p><strong>Materia:</strong> ${escapar(t.materia)}</p>
            <p><strong>Fecha límite:</strong> ${t.fecha}</p>
            <button class="btn btn-verde" onclick="completarTarea(${t.id})">Completar Siguiente</button>
        </div>
    `;
}

function completarTarea(id) {
    let tarea = tareas.find(t => t.id === id);
    if (!tarea || tarea.completada) return;
    acciones.push({ tipo: "completar", tareaId: id });
    tarea.completada = true;
    registrar("Se completó la tarea: " + tarea.nombre);
    mostrarTodo();
}

function completarSiguiente() {
    let pendientes = tareas.filter(t => !t.completada).sort((a,b) => a.fecha.localeCompare(b.fecha));
    if (pendientes.length === 0) { alert("No hay tareas pendientes."); return; }
    completarTarea(pendientes[0].id);
}

function deshacer() {
    let accion = acciones.pop();
    if (!accion) { alert("No hay acciones recientes para deshacer en la Pila LIFO."); return; }
    if (accion.tipo === "agregar") {
        tareas = tareas.filter(t => t.id !== accion.tarea.id);
        registrar("Se deshizo el registro de: " + accion.tarea.nombre);
    } else if (accion.tipo === "completar") {
        let tarea = tareas.find(t => t.id === accion.tareaId);
        if (tarea) { tarea.completada = false; registrar("Se des hizo la completación de: " + tarea.nombre); }
    }
    guardar();
    mostrarTodo();
}

function eliminarTarea(id) {
    if (!confirm("¿Deseas eliminar esta tarea permanentemente?")) return;
    let tarea = tareas.find(t => t.id === id);
    tareas = tareas.filter(t => t.id !== id);
    registrar("Se eliminó la tarea: " + tarea.nombre);
    guardar();
    mostrarTodo();
}

function mostrarEstructuras() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Visualizador Gráfico de Estructuras";
    document.getElementById("descripcionVista").textContent = "Representación conceptual de la memoria (Cola FIFO y Pila LIFO).";
    
    let pendientes = tareas.filter(t => !t.completada);
    let completadas = tareas.filter(t => t.completada);

    let html = `<h3>📦 Cola de Pendientes (Frente -> Fin)</h3>`;
    if(pendientes.length === 0) {
        html += `<p style="color:var(--gris); margin-bottom:20px;">Cola vacía (NULL)</p>`;
    } else {
        html += `<div style="margin-bottom:20px;">`;
        pendientes.forEach((t, i) => {
            html += `<div class="nodo-estructura"><span class="flecha-nodo">[${i === 0 ? 'FRENTE' : 'nodo'}]</span> <strong>${escapar(t.nombre)}</strong> (${escapar(t.materia)})</div>`;
        });
        html += `</div>`;
    }

    html += `<h3>📚 Pila de Historial / Completadas (Tope LIFO)</h3>`;
    if(completadas.length === 0) {
        html += `<p style="color:var(--gris);">Pila vacía (TOPE = NULL)</p>`;
    } else {
        html += `<div>`;
        completadas.slice().reverse().forEach((t, i) => {
            html += `<div class="nodo-estructura"><span class="flecha-nodo">[${i === 0 ? 'TOPE' : 'abajo'}]</span> ✅ <strong>${escapar(t.nombre)}</strong> (${escapar(t.materia)})</div>`;
        });
        html += `</div>`;
    }

    document.getElementById("vista").innerHTML = html;
}

function mostrarHistorial() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Historial de Actividades";
    document.getElementById("descripcionVista").textContent = "Registro cronológico de cambios y transacciones.";
    let vista = document.getElementById("vista");
    if (historial.length === 0) { vista.innerHTML = '<div class="vacio">No hay movimientos registrados.</div>'; return; }
    vista.innerHTML = [...historial].reverse().map(h => `
        <div class="tarea">
            <h3>${escapar(h.mensaje)}</h3>
            <p>${escapar(h.fecha)}</p>
        </div>
    `).join("");
}

function mostrarCalendario() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Calendario de Entregas";
    document.getElementById("descripcionVista").textContent = "Listado cronológico de tareas programadas.";
    let vista = document.getElementById("vista");
    if (tareas.length === 0) { vista.innerHTML = '<div class="vacio">No hay tareas programadas.</div>'; return; }
    let ordenadas = [...tareas].sort((a,b) => a.fecha.localeCompare(b.fecha));
    vista.innerHTML = ordenadas.map(t => `
        <div class="tarea ${t.completada ? "completada" : ""}">
            <h3>📅 ${t.fecha}</h3>
            <p><strong>${escapar(t.nombre)}</strong> - ${escapar(t.materia)}</p>
            <span class="estado ${t.completada ? "ok" : ""}">${t.completada ? "Completada" : "Pendiente"}</span>
        </div>
    `).join("");
}

function mostrarCodigoC() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Código Fuente en C";
    document.getElementById("descripcionVista").textContent = "Implementación estructural base en lenguaje C.";
    document.getElementById("vista").innerHTML = `
        <div class="contenedor-codigo">
            <div class="barra-codigo">
                <span>codigo principal.c</span>
                <button class="btn" style="padding:6px 12px; font-size:12px;" onclick="copiarCodigoC()">Copiar</button>
            </div>
            <pre><code>${escapar(codigoC)}</code></pre>
        </div>
    `;
}

function copiarCodigoC() {
    navigator.clipboard.writeText(codigoC).then(() => { alert("Código copiado al portapapeles con éxito."); });
}

function escapar(valor) {
    return String(valor).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
}

// NUEVA FUNCIÓN PARA GESTIONAR EL BUZÓN DE NETLIFY MEDIANTE FETCH
function mostrarFormularioNetlify() {
    ocultarFormularios();
    document.getElementById("tituloVista").textContent = "Buzón de Comentarios (Netlify)";
    document.getElementById("descripcionVista").textContent = "Envía tus comentarios o sugerencias directamente a la plataforma.";
    
    let vista = document.getElementById("vista");
    vista.innerHTML = `
        <div class="tarjeta" style="max-width: 600px; margin: 0 auto;">
            <form id="formNetlify" name="contacto-net" method="POST" data-netlify="true">
                <input type="hidden" name="form-name" value="contacto-net" />
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;"><strong>Nombre:</strong></label>
                    <input type="text" name="nombre" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--gris);" />
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;"><strong>Correo electrónico:</strong></label>
                    <input type="email" name="email" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--gris);" />
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;"><strong>Mensaje / Comentario:</strong></label>
                    <textarea name="mensaje" rows="4" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--gris);"></textarea>
                </div>
                <button type="submit" class="btn btn-verde">Enviar a Netlify</button>
            </form>
            <div id="respuestaNetlify" style="margin-top: 15px; font-weight: bold;"></div>
        </div>
    `;

    document.getElementById("formNetlify").addEventListener("submit", function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        })
        .then(() => {
            alert("¡Mensaje enviado con éxito a Netlify!");
            this.reset();
        })
        .catch(error => {
            alert("Hubo un error al enviar el formulario.");
            console.error(error);
        });
    });
}

actualizarEstadisticas();