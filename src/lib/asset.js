// Rutas a archivos de public/ respetando el base de GitHub Pages.
export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
