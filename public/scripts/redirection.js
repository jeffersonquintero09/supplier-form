document.addEventListener('DOMContentLoaded', () => {
    // Obtén una referencia al botón por su id
    const botonVolverAlInicio = document.getElementById("volverAlInicio");

    // Agrega un controlador de evento clic al botón
    botonVolverAlInicio.addEventListener("click", () => {
        // Redirige al usuario a la URL deseada
        window.location.href = "https://pcpplasticos.co/";
    });
});
