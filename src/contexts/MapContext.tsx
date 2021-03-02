import { createContext, ReactNode, useState } from "react";

type MapContextType = {
  selectedSegments: string[];
  setSelectedSegments: (selectedSegments: string[]) => void;
};

const MapContext = createContext<MapContextType>({
  selectedSegments: [],
  setSelectedSegments: () => {
    console.warn("no provider set");
  },
});

type MapProviderProps = {
  children: ReactNode;
};

const MapProvider = ({ children }: MapProviderProps) => {
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  return (
    <MapContext.Provider
      value={{
        selectedSegments: selectedSegments,
        setSelectedSegments: setSelectedSegments,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export { MapContext, MapProvider };
