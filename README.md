# Control de Stock

Pagina web simple para administrar stock por fecha, categoria e items.

## Como usar

1. Abrir `index.html` en el navegador.
2. Ingresar con:
   - Administrador: `admin` / `admin123`
   - Usuario normal: `usuario` / `usuario123`
3. Seleccionar una fecha en el calendario.
4. El administrador puede agregar, editar o eliminar categorias.
5. El administrador puede ver y borrar registros individuales de movimientos de stock.
6. El usuario normal solo puede agregar, editar o eliminar items de stock.
7. Editar o eliminar items desde la tabla.
8. Cambiar entre modo claro y modo oscuro desde el panel lateral.
9. Ampliar o minimizar la barra lateral con el boton del encabezado.
10. Exportar el dia seleccionado o todo el stock en formato `.xls`, compatible con Excel.

Los datos se guardan en el navegador usando `localStorage`.

Los iconos usan Font Awesome desde CDN, por lo que necesitan conexion a internet al abrir la pagina.
