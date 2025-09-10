"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";

// Pequeño wrapper que evita usar el optimizador de Next para rutas locales
// cuando el archivo puede no existir en `public/images/...`. Para URL
// externas se sigue usando `next/image`.
export default function SafeImage(props: any) {
  const {
    src,
    alt,
    className = "",
    fill,
    priority,
    sizes,
    style,
    ...rest
  } = props;
  const [imgSrc, setImgSrc] = useState<any>(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const placeholder =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial, Helvetica, sans-serif' font-size='18'>Imagen no disponible</text></svg>"
    );

  const handleError = () => {
    setImgSrc(placeholder);
  };

  // tratar como externa si comienza con http(s) o con //
  const isExternal = typeof src === "string" && /^(https?:)?\/\//i.test(src);

  // Si es externa, usamos next/image para ventajas de optimización.
  if (isExternal) {
    return (
      <NextImage
        src={src}
        alt={alt || ""}
        className={className}
        fill={fill}
        priority={priority}
        sizes={sizes}
        onError={handleError}
        style={style}
        {...rest}
      />
    );
  }

  // Para rutas locales (p. ej. /images/...), renderizamos un <img>
  // para evitar que el optimizador intente pedir la ruta y reciba HTML.
  const imgClass = `${className} ${fill ? "w-full h-full" : ""}`.trim();

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      src={imgSrc || placeholder}
      alt={alt || ""}
      className={imgClass}
      style={style}
      onError={handleError}
      {...rest}
    />
  );
}
