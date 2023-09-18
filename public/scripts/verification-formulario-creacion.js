document.addEventListener('DOMContentLoaded', () => {
  const proveedorForm = document.getElementById('proveedorForm');

  proveedorForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Valores de los campos del formulario
    const nit = document.getElementById('nit').value;
    const nitSinVerificacion = document.getElementById('nitSinVerificacion').value;
    const razonSocial = document.getElementById('razonSocial').value.toUpperCase();
    const regimenTributario = document.getElementById('regimenTributario').value;
    const direccionEmpresa = document.getElementById('direccionEmpresa').value.toUpperCase();
    const telefono = document.getElementById('telefono').value;
    const celular = document.getElementById('celular').value;
    const email = document.getElementById('email').value;

    // Valores de los campos del formulario (Datos de contacto)
    const nombreContacto = document.getElementById('nombreContacto').value.toUpperCase();
    const segundoNombre = document.getElementById('segundoNombre').value.toUpperCase();
    const apellidos = document.getElementById('apellidos').value.toUpperCase();
    const cargo = document.getElementById('cargo').value.toUpperCase();
    const direccionContacto = document.getElementById('direccionContacto').value.toUpperCase();
    const telefonoContacto = document.getElementById('telefonoContacto').value;
    const celularContacto = document.getElementById('celularContacto').value;
    const emailContacto = document.getElementById('emailContacto').value;

    // Campo de archivos
    const archivosInput = document.getElementById('archivos');

    // Realiza las validaciones de campos para el formato de NIT
    if (!nit || !/^\d{9}-\d$/.test(nit)) {
      alert('Por favor, ingresa un NIT válido en el formato 123456789-0.');
      return; // Detiene el proceso si el NIT no es válido
    }

    if (!nitSinVerificacion || nitSinVerificacion.length > 9 || !/^[0-9]+$/.test(nitSinVerificacion)) {
      alert('Por favor, ingresa un NIT sin verificación válido.');
      return; // Detiene el proceso si el NIT sin verificación no es válido
    }

    if (!razonSocial) {
      alert('Por favor, ingresa la Razón Social.');
      return; // Detiene el proceso si la Razón Social está en blanco
    }

    if (!regimenTributario) {
      alert('Por favor, selecciona un Régimen Tributario.');
      return; // Detiene el proceso si el Régimen Tributario está en blanco
    }

    if (!direccionEmpresa) {
      alert('Por favor, ingresa la Dirección de la Empresa.');
      return; // Detiene el proceso si la Dirección de la Empresa está en blanco
    }

    if (!telefono) {
      alert('Por favor, ingresa el Teléfono.');
      return; // Detiene el proceso si el Teléfono está en blanco
    }

    if (email && !isValidEmail(email)) {
      alert('Por favor, ingresa un Email válido.');
      return; // Detiene el proceso si el Email no es válido
    }

    // Crea un objeto FormData y agrega los campos del formulario
    const formData = new FormData();

    formData.append('nit', nit);
    formData.append('nitSinVerificacion', nitSinVerificacion);
    formData.append('razonSocial', razonSocial);
    formData.append('regimenTributario', regimenTributario);
    formData.append('direccionEmpresa', direccionEmpresa);
    formData.append('telefono', telefono);
    formData.append('celular', celular);
    formData.append('email', email);
    formData.append('nombreContacto', nombreContacto);
    formData.append('segundoNombre', segundoNombre);
    formData.append('apellidos', apellidos);
    formData.append('cargo', cargo);
    formData.append('direccionContacto', direccionContacto);
    formData.append('telefonoContacto', telefonoContacto);
    formData.append('celularContacto', celularContacto);
    formData.append('emailContacto', emailContacto);

    // Agrega los archivos al FormData
    for (const archivo of archivosInput.files) {
      formData.append('archivos', archivo);
    }

    //console.log("Valor de nit:", nit);

    // Realiza la solicitud al Service Layer y maneja las respuestas como antes
    try {
      // Realiza la solicitud al Service Layer
      const response = await fetch('/crearProveedor', {
        method: 'POST',
        body: formData // Usamos el objeto FormData aquí
      });

      const responseData = await response.json();

      if (response.status === 200) {
        alert(responseData.mensaje); // Muestra una alerta si la creación fue exitosa
        // Puedes redirigir al usuario a una página de confirmación aquí
      } else {
        // Extract and display the error message from the server response
        const errorResponse = responseData.error;
        if (errorResponse && errorResponse.message) {
          alert(`Error: ${errorResponse.message}`);
        } else {
          alert('Hubo un error al crear el proveedor.');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error al crear el proveedor.');
    }
  });
});

// Función para validar el formato de correo electrónico
function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
}
