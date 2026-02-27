import { ReactNode } from "react";

interface MasonryGridProps {
  children: ReactNode;
}

const MasonryGrid = ({ children }: MasonryGridProps) => {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
      {children}
    </div>
  );
};

export default MasonryGrid;
