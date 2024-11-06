// types/react-slick.d.ts

/**
 * Declaración de módulo para el paquete "react-slick".
 * Esto proporciona definiciones de tipos para el componente de slider utilizado en la aplicación,
 * permitiendo un autocompletado y verificación de tipos más precisos.
 */
declare module "react-slick" {
  import * as React from "react";

  /**
   * Interfaz para las propiedades (settings) del componente de slider.
   */
  export interface Settings {
    accessibility?: boolean; // Habilita la accesibilidad para el slider.
    arrows?: boolean; // Muestra flechas de navegación.
    dots?: boolean; // Muestra puntos de navegación.
    infinite?: boolean; // Activa el scroll infinito en el slider.
    speed?: number; // Velocidad de transición en milisegundos.
    slidesToShow?: number; // Número de elementos visibles en cada slide.
    slidesToScroll?: number; // Número de elementos a desplazar en cada transición.
    autoplay?: boolean; // Habilita la reproducción automática del slider.
    autoplaySpeed?: number; // Velocidad de la reproducción automática en milisegundos.
    [key: string]: any; // Propiedades adicionales que pueden ser especificadas.
  }

  /**
   * Clase del componente `Slider` de "react-slick", que acepta las propiedades definidas en `Settings`.
   */
  class Slider extends React.Component<Settings, any> {}

  export default Slider;
}
