const express = require('express');
const axios = require('axios');
const path = require('path'); 
const multer = require('multer');
const nodemailer = require('nodemailer');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


let sessionId = '';

// Variables de entorno
const companyDB = process.env.COMPANY_DB;
const serviceLayerUser = process.env.SL_USER;
const serviceLayerPassword = process.env.SL_PASSWORD;
const serviceLayerUrl = process.env.SL_URL;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpSecure = process.env.SMTP_SECURE;
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const mailTo = process.env.MAIL_TO;
const sessionSecret = process.env.SESSION_SECRET;


// Configuración express-session
app.use(session({
  secret: `${sessionSecret}`, 
  resave: false,
  saveUninitialized: true
}));

// Configuración multer para manejar archivos adjuntos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Se define la carpeta de destino para los archivos adjuntos
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    // Se define el nombre de los archivos adjuntos (se pueden personalizar)
    cb(null, file.originalname);
  }
});

// Configuración multer para manejar form-data
const upload = multer({ storage: storage });

// Create a SMTP transporter object
const transporter = nodemailer.createTransport(
  {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
          user: emailUser,
          pass: emailPassword
      },
      logger: true,
      transactionLog: true, // include SMTP traffic in the logs
      allowInternalNetworkInterfaces: false
  }
);

// Función para iniciar sesión en el Service Layer
async function loginToServiceLayer() {
  const loginData = {
    CompanyDB: companyDB,
    Password: serviceLayerPassword,
    UserName: serviceLayerUser
  };

  try {
    const response = await axios.post(`${serviceLayerUrl}/Login`, loginData);
    sessionId = response.data.SessionId;
    console.log('Sesión iniciada:', sessionId);
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
  }
}

// Función para cerrar sesión en el Service Layer
async function logoutFromServiceLayer() {
  try {
    await axios.post(`${serviceLayerUrl}/Logout('${sessionId}')`);
    console.log('Sesión cerrada');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}

// Ruta estática carpeta public
app.use(express.static(path.join(__dirname, 'public')));


// Ruta verificación previa de proveedor
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'verificar-proveedor.html'));
});

// Ruta para el formulario de creación
app.get('/formulario', (req, res) => {
  // Verifica si req.session.verificado es true
  if (req.session.verificado) {
    // Si es true, muestra el formulario
    res.sendFile(path.join(__dirname, 'views', 'formulario-creacion.html'));
  } else {
    // Si no es true, redirige de vuelta a la página de verificación
    res.redirect('/');
  }
});


// Ruta para verificar si el proveedor existe
app.post('/verificarProveedor', async (req, res) => {
  const { nit } = req.body;

  try {
    // Iniciar sesión antes de realizar la verificación
    await loginToServiceLayer();

    try {
      const response = await axios.get(`${serviceLayerUrl}/BusinessPartners('P${nit}')`, {
        headers: { Cookie: `B1SESSION=${sessionId}` }
      });
      
      if (response.status === 200) {
        return res.json({ mensaje: 'Proveedor ya existe en el sistema' });
      } else {
        req.session.verificado = true;
        return res.json({ mensaje: 'Proveedor no encontrado, proceda al formulario' });
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        req.session.verificado = true;
        return res.json({ mensaje: 'Proveedor no encontrado, proceda al formulario' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al verificar el proveedor', error: error.message });
  } finally {
    // Cerrar sesión después de la verificación
    await logoutFromServiceLayer();
  }
});


// Ruta para crear un nuevo proveedor a través de Service Layer
app.post('/crearProveedor', upload.array('archivos', 5), async (req, res) => {
  // Aquí se manejan los datos del formulario que se envían en el req.body
  const { nit, nitSinVerificacion, razonSocial, direccionEmpresa, telefono, celular, email,
    nombreContacto, segundoNombre, apellidos, cargo, direccionContacto, 
    telefonoContacto, celularContacto, emailContacto } = req.body;
  
  // Obtiene la lista de archivos adjuntos desde req.files
  const archivosAdjuntos = req.files;    
    
  //console.log(req.body)

  // Se realiza la solicitud al Service Layer para crear un nuevo proveedor
  try {
    // Iniciar sesión antes de crear el proveedor
    await loginToServiceLayer();

    // Se construye el objeto de datos para crear el proveedor en el Service Layer
    const data = {
      CardCode: `P${nitSinVerificacion}`, // NIT con la P al inicio
      CardName: razonSocial,
      CardType: 'cSupplier',
      GroupCode: 115,
      Address: direccionEmpresa,
      Phone1: telefono,
      ContactPerson: nombreContacto,
      VatLiable: 'vLiable',
      FederalTaxID: nit,
      Cellular: celular,
      City: 'BOGOTA',
      Country: 'CO',
      EmailAddress: email,
      DebitorAccount: '22050501',
      DownPaymentClearAct: '13300501',
      BilltoDefault: 'PRINCIPAL',
      VatGroupLatinAmerica: 'IDS19',
      Properties1: 'tYES',
      U_BPCO_Address: direccionEmpresa,
      BPAddresses: [
        {
          AddressName: 'PRINCIPAL',
          Country: 'CO',
          AddressType: 'bo_BillTo',
          BPCode: `P${nitSinVerificacion}`,
          Street: direccionEmpresa
        }
      ],
      ContactEmployees: [
        {
          CardCode: `P${nitSinVerificacion}`,
          Name: cargo,
          Position: cargo,
          Address: direccionContacto,
          Phone1: telefonoContacto,
          MobilePhone: celularContacto,
          E_Mail: emailContacto,
          Active: 'tYES',
          FirstName: nombreContacto,
          MiddleName: segundoNombre,
          LastName: apellidos
        }
      ]
    };

    console.log(data);

    const response = await axios.post(`${serviceLayerUrl}/BusinessPartners`, data, {
      headers: { Cookie: `B1SESSION=${sessionId}` }
    });

    // Verifica la respuesta y devuelve la respuesta apropiada al cliente
    if (response.status === 201) {
      // Si se creó el proveedor con éxito, puedes redirigir al usuario a una página de confirmación
      const mailOptions = {
        from: `${emailUser}`, // Reemplaza con tu dirección de correo
        to: `${mailTo}`, // Reemplaza con la dirección de correo de compras
        subject: 'Nuevo proveedor creado',
        text: 'Se ha creado un nuevo proveedor con los siguientes datos:\n\n' +
          `Código SAP: P${nitSinVerificacion}\n` +
          `Nombre: ${razonSocial}\n` +
          `NIT: ${nit}\n` +
          `Dirección: ${direccionEmpresa}\n` +
          `Teléfono: ${telefono}\n` +
          `Email: ${email}\n`,
        attachments: archivosAdjuntos ? archivosAdjuntos.map((archivo) => {
          if (archivo.path) {
            return {
              filename: archivo.originalname,
              path: archivo.path,
              contentType: archivo.mimetype
            };
          }
          return null; // Otra opción podría ser excluir el archivo si no tiene path
        }).filter(Boolean) : []          
      };      
        
      console.log('Archivos adjuntos:', archivosAdjuntos);

      console.log('Archivos adjuntos al correo:', mailOptions.attachments);

      // Envía el correo electrónico
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error al enviar el correo electrónico:', error);
          res.status(500).json({ mensaje: 'Error al enviar el correo electrónico', error: error.message });
        } else {
          console.log('Correo electrónico enviado:', info.response);
          res.json({ mensaje: 'Proveedor creado exitosamente' });
        }
      });      
    }
  } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al crear el proveedor', error: error.message });
  } finally {
      // Cierra sesión después de la creación del proveedor
      await logoutFromServiceLayer();
  }
});


app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
