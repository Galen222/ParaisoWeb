declare module "react-slick" {
  import * as React from "react";

  interface Settings {
    accessibility?: boolean;
    arrows?: boolean;
    dots?: boolean;
    infinite?: boolean;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    autoplay?: boolean;
    autoplaySpeed?: number;
    [key: string]: any;
  }

  class Slider extends React.Component<Settings, any> {}

  export default Slider;
}
