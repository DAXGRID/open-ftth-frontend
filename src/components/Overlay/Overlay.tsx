import { ReactNode } from "react";

interface OverlayProps {
  children?: ReactNode;
}

function Overlay({ children }: OverlayProps) {
  return <div className="overlay">{children}</div>;
}

export default Overlay;
