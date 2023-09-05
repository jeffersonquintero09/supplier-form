document.addEventListener('DOMContentLoaded', () => {
    const btnVerificar = document.getElementById('btnVerificar');
    const nit = document.getElementById('nit');
  
    btnVerificar.addEventListener('click', async () => {
      if (nit.value.length > 0 && nit.value.length <= 10 && /^[0-9]+$/.test(nit.value)) {
        try {
          const response = await fetch('/verificarProveedor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nit: nit.value })
          });
  
          const data = await response.json();
          if (data.mensaje === 'Proveedor ya existe en el sistema') {
            alert(data.mensaje);
          } else if (data.mensaje === 'Proveedor no encontrado, proceda al formulario') {
            window.location.href = '/formulario';
          } else {
            console.log('Respuesta inesperada:', data);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        alert('Por favor, ingresa un NIT válido para verificar.');
      }
    });
  });
  