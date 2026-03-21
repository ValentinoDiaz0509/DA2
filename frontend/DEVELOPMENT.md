# 🛠️ Manual de Desarrollo y Mantenimiento

## 🚀 Para Desarrolladores

---

## 📱 Estructura del Proyecto

```
health-grid-module-9/
├── public/
│   └── index.html                 # HTML base
├── src/
│   ├── components/
│   │   ├── Layout.js              # Header + Sidebar
│   │   ├── NursingDashboard.js    # Vista principal
│   │   ├── PatientCard.js         # Tarjeta de paciente
│   │   ├── PatientDetailView.js   # Detalle + gráficos
│   │   └── AlertsSupervisionPanel.js  # Panel de alertas
│   ├── context/
│   │   └── HealthGridContext.js   # Gestión de estado
│   ├── data/
│   │   ├── mockPatients.js        # Datos simulados
│   │   └── constants.js           # Configuración
│   ├── theme/
│   │   └── theme.js               # Material-UI theme
│   ├── App.js                     # Componente raíz
│   └── index.js                   # Punto de entrada
├── package.json                   # Dependencias
├── readme.md                      # Documentación general
├── TECHNICAL.md                   # Arquitectura técnica
├── INTEGRATION.md                 # Integración con otros módulos
├── QUICK_START.md                 # Guía para usuarios finales
└── DEVELOPMENT.md                 # Este archivo
```

---

## 💻 Configuración del Entorno

### Requisitos
- **Node.js 16+** (recomendado 18 LTS)
- **npm 8+** o **yarn 1.22+**
- Editor: VS Code recomendado

### Setup Inicial

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd health-grid-module-9

# 2. Instalar dependencias
npm install

# 3. Verificar instalación
npm run --version

# 4. Iniciar servidor de desarrollo
npm start

# La aplicación abrirá en http://localhost:3000
```

### Variables de Entorno (.env)

```env
# Desarrollo
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:5000
REACT_APP_LOG_LEVEL=debug

# Producción
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.hospital.local
REACT_APP_LOG_LEVEL=error
```

---

## 🛠️ Comandos Disponibles

```bash
# Iniciar servidor de desarrollo
npm start
# Abre http://localhost:3000

# Compilar para producción
npm run build
# Genera carpeta /build optimizada

# Ejecutar tests
npm test
# Modo interactivo, presiona 'a' para todos

# Linter y formateador
npm run lint
npm run format

# Limpiar caché
npm cache clean --force
rm -rf node_modules
npm install
```

---

## 📝 Guía de Codificación

### Estructura de Componentes

```javascript
// ✅ BIEN
import { useState, useCallback } from 'react';
import { Box, Button } from '@mui/material';

export const MyComponent = ({ prop1, onAction }) => {
  const [state, setState] = useState(initialValue);

  const handleAction = useCallback(() => {
    // lógica
  }, [dependencies]);

  return (
    <Box>
      <Button onClick={handleAction}>Acción</Button>
    </Box>
  );
};
```

### Convenciones de Nombres

```javascript
// Componentes: PascalCase
MyComponent.js
UserProfile.js

// Hooks: camelCase, prefijo use
useHealthGrid()
usePatientData()

// Constantes: UPPER_CASE
const MAX_ALERTS = 100;
const API_TIMEOUT = 5000;

// Variables/funciones: camelCase
const patientId = '...';
const handleAlert = () => {};
```

### Estructura de Archivos

```javascript
// imports
import React from 'react';
import { useHealthGrid } from './context/HealthGridContext';

// tipos/interfaces
const COMPONENT_PROPS = {
  // ...
};

// componente principal
export const MyComponent = (props) => {
  // hooks
  // state management
  // event handlers
  // render
  return (...);
};

// componentes secundarios
const SubComponent = () => {};

// exports
export default MyComponent;
```

---

## 🧪 Testing

### Unit Tests Básicos

```javascript
// PatientCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientCard } from './PatientCard';

describe('PatientCard', () => {
  it('should render patient name', () => {
    const patient = { id: '1', name: 'Juan' };
    render(<PatientCard patient={patient} onSelect={() => {}} />);
    expect(screen.getByText('Juan')).toBeInTheDocument();
  });

  it('should call onSelect when clicking monitor button', () => {
    const mockSelect = jest.fn();
    const patient = { id: '1', name: 'Juan' };
    render(<PatientCard patient={patient} onSelect={mockSelect} />);
    fireEvent.click(screen.getByText('Monitorear'));
    expect(mockSelect).toHaveBeenCalled();
  });
});
```

### Integration Tests

```javascript
// NursingDashboard.integration.test.js
describe('NursingDashboard Flow', () => {
  it('should filter patients by floor', async () => {
    // 1. Render component
    // 2. Select floor filter
    // 3. Assert filtered results
  });

  it('should open patient detail on click', async () => {
    // 1. Render dashboard
    // 2. Click on patient card
    // 3. Assert detail view appears
  });
});
```

---

## 🐛 Debugging

### React DevTools
```javascript
// En consola del navegador con extensión instalada
$r // Seleccionado en React DevTools
$r.props // Ver props
$r.state // Ver state (si es class component)
```

### Context Debugging
```javascript
// En componente
const { patients, alerts } = useHealthGrid();
console.table(patients); // Visualizar en tabla
console.log('Alerts:', alerts);
```

### Performance Profiling
```bash
# En Chrome DevTools
1. Abrir Performance tab
2. Record
3. Interactuar con app
4. Stop recording
5. Analizar waterfall
```

---

## 🔒 Mejores Prácticas

### ✅ DO (Haz)

```javascript
// 1. Usar useCallback para callbacks
const handleClick = useCallback(() => {
  // lógica
}, [deps]);

// 2. Usar useMemo para cálculos complejos
const filtered = useMemo(() => {
  return data.filter(...);
}, [data]);

// 3. Componentes puros (sin side effects en render)
export const Pure = ({ data }) => {
  // solo render
  return <div>{data}</div>;
};

// 4. Manejo de errores
try {
  await fetch('/api/data');
} catch (error) {
  console.error('Error:', error);
  setError(error.message);
}
```

### ❌ DON'T (No hagas)

```javascript
// 1. NO inline functions en render
// ❌ BAD: onClick={() => handleClick()} en JSX repeat

// 2. NO mutate state directamente
// ❌ BAD: patients[0].name = 'new name'
// ✅ GOOD: setPatients([...patients])

// 3. NO side effects en componentes
// ❌ BAD: fetch en el body del componente
// ✅ GOOD: useEffect(() => { fetch(...) }, [])

// 4. NO console.log en producción
// ✅ GOOD: if (isDevelopment) console.log(...)
```

---

## 📦 Dependencias

### Actuales (`package.json`)
- **react**: UI library
- **react-dom**: DOM rendering
- **@mui/material**: Componentes UI
- **@mui/icons-material**: Iconos
- **recharts**: Gráficos
- **uuid**: Generación de IDs

### Agregar Nueva Dependencia

```bash
# Verificar compatibilidad
npm search <package>

# Instalar
npm install <package>

# O desarrollo only
npm install --save-dev <package>

# Verificar
npm ls <package>
```

### Versioning

```json
{
  "dependencies": {
    "react": "^18.2.0",    // ~= 18.x.x (cambios menores ok)
    "uuid": "~9.0.0"       // = 9.0.x (solo patches)
  }
}
```

---

## 🚀 Build y Deploy

### Build para Producción

```bash
npm run build

# Genera:
# - build/index.html
# - build/static/js/main.*.js (minificado)
# - build/static/css/main.*.css
# - build/favicon.ico
```

### Servidor Estático (Nginx)

```nginx
server {
    listen 80;
    server_name healthgrid.hospital.local;
    
    root /var/www/health-grid/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
    }
}
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build y run
docker build -t healthgrid:v1.0.0 .
docker run -p 80:80 healthgrid:v1.0.0
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy Health Grid
on:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      
      - name: Deploy to Server
        run: |
          scp -r build/* user@server:/var/www/html/
```

---

## 📊 Performance Tips

### Bundle Size
```bash
# Analizar bundle
npm run build -- --analyze

# Usar React.lazy para code splitting
const PatientDetail = React.lazy(() =>
  import('./components/PatientDetailView')
);
```

### Render Optimization
```javascript
// 1. Memoize componentes
const MemoizedCard = React.memo(PatientCard, (prev, next) => {
  return prev.id === next.id;
});

// 2. Virtual lists para muchos items
import { FixedSizeList } from 'react-window';

// 3. Debounce/Throttle
import { debounce } from 'lodash';
const handleFilterChange = debounce((value) => {
  setFilter(value);
}, 300);
```

---

## 🔐 Seguridad

### Inputs Seguros
```javascript
// ✅ Sanitizar inputs
const sanitizeInput = (input) => {
  return input.replace(/<script[^>]*>/gi, '');
};

// ✅ Validar data del servidor
const validateAlert = (data) => {
  if (!data.id) throw new Error('Invalid alert');
  return data;
};
```

### CORS y Headers
```javascript
// En backend (si aplica)
res.setHeader('Content-Security-Policy', "...");
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'SAMEORIGIN');
```

---

## 📚 Recursos Útiles

- **React Docs**: https://react.dev
- **Material-UI**: https://mui.com
- **Recharts**: https://recharts.org
- **Testing Library**: https://testing-library.com
- **TypeScript**: https://www.typescriptlang.org

---

## 🤝 Contribuciones

### Contributing Guidelines

1. **Fork** el repositorio
2. **Branch** nueva feature (`git checkout -b feature/my-feature`)
3. **Commit** cambios (`git commit -m 'Add feature'`)
4. **Push** al branch (`git push origin feature/my-feature`)
5. **Pull Request** con descripción clara

### Code Review Checklist
- [ ] Tests unitarios escritos
- [ ] Sin console.log en prod
- [ ] Accesibilidad verificada
- [ ] Mobile responsive
- [ ] Documentación actualizada

---

## 📝 Versionado

### Semantic Versioning (MAJOR.MINOR.PATCH)

- `1.0.0` → `1.0.1`: Bug fixes
- `1.0.0` → `1.1.0`: Nueva feature, compatible
- `1.0.0` → `2.0.0`: Breaking changes

### Release Process
```bash
# 1. Bump version
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# 2. Tag
git push origin v1.0.0

# 3. Crear release en GitHub
```

---

## 📞 Contacto Desarrollo

- **Lead Developer**: [Nombre]
- **Tech Lead**: [Nombre]
- **Slack**: #healthgrid-dev
- **Issues**: GitHub Issues
- **Docs**: Wiki del repositorio

---

**Última actualización**: Marzo 21, 2026  
**Versión**: 1.0.0  
**Status**: ✅ Producción

